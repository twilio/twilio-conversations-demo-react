import { useState, useEffect, useMemo, useRef } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";

import {
  Message,
  Conversation,
  Participant,
  Client,
} from "@twilio/conversations";
import { Box } from "@twilio-paste/core";

import { actionCreators, AppState } from "../store";
import ConversationContainer from "./conversations/ConversationContainer";
import ConversationsContainer from "./conversations/ConversationsContainer";
import {
  AddMessagesType,
  SetParticipantsType,
  SetUnreadMessagesType,
} from "../types";
import { getConversationParticipants, getToken } from "../api";
import useAppAlert from "../hooks/useAppAlerts";
import Notifications from "./Notifications";
import stylesheet from "../styles";
import { handlePromiseRejection } from "../helpers";
import AppHeader from "./AppHeader";

import {
  initFcmServiceWorker,
  subscribeFcmNotifications,
  showNotification,
} from "../firebase-support";

async function loadUnreadMessagesCount(
  convo: Conversation,
  updateUnreadMessages: SetUnreadMessagesType
) {
  let count = 0;

  try {
    count =
      (await convo.getUnreadMessagesCount()) ??
      (await convo.getMessagesCount());
  } catch (e) {
    console.error("getUnreadMessagesCount threw an error", e);
  }

  updateUnreadMessages(convo.sid, count);
}

async function handleParticipantsUpdate(
  participant: Participant,
  updateParticipants: SetParticipantsType
) {
  const result = await getConversationParticipants(participant.conversation);
  updateParticipants(result, participant.conversation.sid);
}

async function getSubscribedConversations(
  client: Client
): Promise<Conversation[]> {
  let subscribedConversations = await client.getSubscribedConversations();
  let conversations = subscribedConversations.items;

  while (subscribedConversations.hasNextPage) {
    subscribedConversations = await subscribedConversations.nextPage();
    conversations = [...conversations, ...subscribedConversations.items];
  }

  return conversations;
}

const AppContainer: React.FC = () => {
  /* eslint-disable */
  const [client, setClient] = useState<Client>();
  const token = useSelector((state: AppState) => state.token);
  const conversations = useSelector((state: AppState) => state.convos);
  const sid = useSelector((state: AppState) => state.sid);
  const sidRef = useRef("");
  const [alertsExist, AlertsView] = useAppAlert();
  sidRef.current = sid;

  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  const dispatch = useDispatch();
  const {
    addMessages,
    updateLoadingState,
    updateParticipants,
    updateUnreadMessages,
    startTyping,
    endTyping,
    addConversation,
    login,
    removeMessages,
    removeConversation,
    updateCurrentConversation,
    addNotifications,
    logout,
    clearAttachments,
  } = bindActionCreators(actionCreators, dispatch);

  const updateTypingIndicator = (
    participant: Participant,
    sid: string,
    callback: (sid: string, user: string) => void
  ) => {
    const {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      attributes: { friendlyName },
      identity,
    } = participant;
    if (identity === localStorage.getItem("username")) {
      return;
    }
    callback(sid, identity || friendlyName || "");
  };
  useEffect(() => {
    const client = new Client(token);
    setClient(client);

    const fcmInit = async () => {
      await initFcmServiceWorker();
      await subscribeFcmNotifications(client);
    };

    fcmInit().catch(() => {
      console.error(
        "FCM initialization failed: no push notifications will be available"
      );
    });

    client.on("conversationJoined", (conversation) => {
      addConversation(conversation);

      conversation.on("typingStarted", (participant) => {
        handlePromiseRejection(
          () =>
            updateTypingIndicator(participant, conversation.sid, startTyping),
          addNotifications
        );
      });

      conversation.on("typingEnded", (participant) => {
        handlePromiseRejection(
          () => updateTypingIndicator(participant, conversation.sid, endTyping),
          addNotifications
        );
      });

      handlePromiseRejection(async () => {
        if (conversation.status === "joined") {
          const result = await getConversationParticipants(conversation);
          updateParticipants(result, conversation.sid);

          const messages = await conversation.getMessages();
          addMessages(conversation.sid, messages.items);
          loadUnreadMessagesCount(conversation, updateUnreadMessages);
        }
      }, addNotifications);
    });

    client.on("conversationRemoved", (conversation: Conversation) => {
      updateCurrentConversation("");
      handlePromiseRejection(() => {
        removeConversation(conversation.sid);
        updateParticipants([], conversation.sid);
      }, addNotifications);
    });
    client.on("messageAdded", (message: Message) => {
      addMessage(message, addMessages, updateUnreadMessages);
      if (message.author === localStorage.getItem("username")) {
        clearAttachments(message.conversation.sid, "-1");
      }

    });
    client.on("participantLeft", (participant) => {
      handlePromiseRejection(
        () => handleParticipantsUpdate(participant, updateParticipants),
        addNotifications
      );
    });
    client.on("participantUpdated", (event) => {
      handlePromiseRejection(
        () => handleParticipantsUpdate(event.participant, updateParticipants),
        addNotifications
      );
    });
    client.on("participantJoined", (participant) => {
      handlePromiseRejection(
        () => handleParticipantsUpdate(participant, updateParticipants),
        addNotifications
      );
    });
    client.on("conversationUpdated", ({ conversation }) => {
      handlePromiseRejection(() => {}, addNotifications);
    });

    client.on("messageUpdated", ({ message }) => {
      handlePromiseRejection(() => {}, addNotifications);
    });

    client.on("messageRemoved", (message) => {
      handlePromiseRejection(
        () => removeMessages(message.conversation.sid, [message]),
        addNotifications
      );
    });

    client.on("pushNotification", (event) => {
      // @ts-ignore
      if (event.type != "twilio.conversations.new_message") {
        return;
      }

      if (Notification.permission === "granted") {
        showNotification(event);
      } else {
        console.log("Push notification is skipped", Notification.permission);
      }
    });

    client.on("tokenAboutToExpire", () => {
      if (username && password) {
        getToken(username, password).then((token) => {
          login(token);
        });
      }
    });

    updateLoadingState(false);
    getSubscribedConversations(client);

    return () => {
      client?.removeAllListeners();
    };
  }, []);

  function addMessage(
    message: Message,
    addMessages: AddMessagesType,
    updateUnreadMessages: SetUnreadMessagesType
  ) {
    //transform the message and add it to redux
    handlePromiseRejection(() => {
      if (sidRef.current === message.conversation.sid) {
        message.conversation.updateLastReadMessageIndex(message.index);
      }
      addMessages(message.conversation.sid, [message]);
      loadUnreadMessagesCount(message.conversation, updateUnreadMessages);
    }, addNotifications);
  }

  const openedConversation = useMemo(
    () => conversations.find((convo) => convo.sid === sid),
    [sid, conversations]
  );

  return (
    <Box style={stylesheet.appWrapper}>
      <AlertsView />
      <Notifications />
      <Box>
        <AppHeader
          user={username ?? ""}
          onSignOut={async () => {
            logout();

            // unregister service workers
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
              registration.unregister();
            }
          }}
        />
      </Box>
      <Box style={stylesheet.appContainer(alertsExist)}>
        <ConversationsContainer client={client} />
        <Box style={stylesheet.messagesWrapper}>
          <ConversationContainer
            conversation={openedConversation}
            client={client}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AppContainer;
