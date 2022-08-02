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
  SetUreadMessagesType,
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

type SetConvosType = (convos: Conversation[]) => void;

async function loadUnreadMessagesCount(
  convo: Conversation,
  updateUnreadMessages: SetUreadMessagesType
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

async function updateConvoList(
  client: Client,
  conversation: Conversation,
  setConvos: SetConvosType,
  addMessages: AddMessagesType,
  updateUnreadMessages: SetUreadMessagesType
) {
  if (conversation.status === "joined") {
    const messages = await conversation.getMessages();
    addMessages(conversation.sid, messages.items);
    loadUnreadMessagesCount(conversation, updateUnreadMessages);
  } else {
    addMessages(conversation.sid, []);
  }

  const subscribedConversations = await client.getSubscribedConversations();
  setConvos(subscribedConversations.items);
}

const AppContainer: React.FC = () => {
  /* eslint-disable */
  const Conversations = require("@twilio/conversations");
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
    listConversations,
    login,
    removeMessages,
    removeConversation,
    updateCurrentConversation,
    addNotifications,
    logout,
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

    const fcMInit = async () => {
      await initFcmServiceWorker();
      await subscribeFcmNotifications(client);
    };

    fcMInit();
    client.on("conversationAdded", async (conversation: Conversation) => {
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
        }

        updateConvoList(
          client,
          conversation,
          listConversations,
          addMessages,
          updateUnreadMessages
        );
      }, addNotifications);
    });

    client.on("conversationRemoved", (conversation: Conversation) => {
      updateCurrentConversation("");
      handlePromiseRejection(() => {
        removeConversation(conversation.sid);
        updateParticipants([], conversation.sid);
      }, addNotifications);
    });
    client.on("messageAdded", (event: Message) => {
      addMessage(event, addMessages, updateUnreadMessages);
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
      handlePromiseRejection(
        () =>
          updateConvoList(
            client,
            conversation,
            listConversations,
            addMessages,
            updateUnreadMessages
          ),
        addNotifications
      );
    });

    client.on("messageUpdated", ({ message }) => {
      handlePromiseRejection(
        () =>
          updateConvoList(
            client,
            message.conversation,
            listConversations,
            addMessages,
            updateUnreadMessages
          ),
        addNotifications
      );
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

    client.on("tokenExpired", () => {
      if (username && password) {
        getToken(username, password).then((token) => {
          login(token);
        });
      }
    });

    updateLoadingState(false);

    return () => {
      client?.removeAllListeners();
    };
  }, []);

  function addMessage(
    message: Message,
    addMessages: AddMessagesType,
    updateUnreadMessages: SetUreadMessagesType
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
