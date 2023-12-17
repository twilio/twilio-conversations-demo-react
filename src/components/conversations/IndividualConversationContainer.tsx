import React, { useState, useEffect, useMemo, useRef } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
export type SetSidType = (sid: string) => void;
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { getSdkConversationObject } from "../../conversations-objects";

import {
  Message,
  Conversation,
  Participant,
  Client,
  ConnectionState,
} from "@twilio/conversations";
import { Box, Input } from "@twilio-paste/core";

import { actionCreators, AppState } from "../../store";
import ConversationContainer from "./ConversationContainer";
import ConversationsContainer from "./ConversationsContainer";
import {
  AddMessagesType,
  SetParticipantsType,
  SetUnreadMessagesType,
} from "../../types";
import { getConversationByName, getToken } from "../../api";
import useAppAlert from "../../hooks/useAppAlerts";
import Notifications from "../Notifications";
import stylesheet from "../../styles";
import { handlePromiseRejection } from "../../helpers";
import AppHeader from "./../AppHeader";
import { getTypingMessage, unexpectedErrorNotification } from "../../helpers";

import {
  initFcmServiceWorker,
  subscribeFcmNotifications,
  showNotification,
} from "../../firebase-support";
import ConversationView from "./ConversationView";
import { ReduxMessage } from "../../store/reducers/messageListReducer";
import { useParams } from "react-router-dom";
import CreateConversationButton from "./CreateConversationButton";
import styles from "../../styles";

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
  const result = await participant.conversation.getParticipants();
  updateParticipants(result, participant.conversation.sid);
}

async function updateCurrentConvo(
  setSid: SetSidType,
  convo: ReduxConversation,
  updateParticipants: SetParticipantsType
) {
  setSid(convo.sid);

  const participants = await getSdkConversationObject(convo).getParticipants();
  updateParticipants(participants, convo.sid);
}
const IndividualConversationContainer: React.FC = () => {
  /* eslint-disable */
  const { uniqueName } = useParams<{ uniqueName: string }>();
  // console.log(uniqueName)
  const [connectionState, setConnectionState] = useState<ConnectionState>();
  const [client, setClient] = useState<Client>();
  const [clientIteration, setClientIteration] = useState(0);
  const token = useSelector((state: AppState) => state.token);
  const conversations = useSelector((state: AppState) => state.convos);
  const sid = useSelector((state: AppState) => state.sid);
  const sidRef = useRef("");
  const [alertsExist, AlertsView] = useAppAlert();
  sidRef.current = sid;
  const [convo, setConvo] = useState<ReduxConversation>();

  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  const dispatch = useDispatch();
  const {
    upsertMessages,
    updateLoadingState,
    updateParticipants,
    updateUser,
    updateUnreadMessages,
    startTyping,
    endTyping,
    upsertConversation,
    login,
    removeMessages,
    removeConversation,
    updateCurrentConversation,
    addNotifications,
    setLastReadIndex,
    logout,
    clearAttachments,
    updateTimeFormat,
  } = bindActionCreators(actionCreators, dispatch);
  
  const fetchConversation = async (name: string, nameType: 'uniqueName' | 'friendlyName') => {
    try {
      
      console.log(client);
      const conversation = await getConversationByName(name, nameType, client, addNotifications);
      console.log("friendly name " + conversation?.friendlyName)
      if (conversation) {
        // Assuming ReduxConversation has similar properties to Conversation
        const reduxConversation: ReduxConversation = {
          // Map properties from `conversation` to `reduxConversation`
          sid: conversation.sid,
          friendlyName: conversation.friendlyName,
          dateUpdated: conversation.dateUpdated,
          notificationLevel: conversation.notificationLevel,
          lastReadMessageIndex: conversation.lastReadMessageIndex,
          lastMessage: conversation.lastMessage
        };
        setConvo(reduxConversation);

        const lastReadIndex = convo?.lastReadMessageIndex ?? -1;
        setLastReadIndex(lastReadIndex);

        await updateCurrentConvo(updateCurrentConversation, conversation, updateParticipants);

        // Update unread messages
        updateUnreadMessages(conversation?.sid, 0);

        // Set messages to be read
        const lastMessage = messages[conversation.sid]?.length && messages[conversation.sid][messages[conversation.sid].length - 1];
        if (lastMessage && lastMessage.index !== -1) {
          await getSdkConversationObject(conversation).advanceLastReadMessageIndex(lastMessage.index);
        }
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };
  useEffect(() => {
    if (client && uniqueName) {
      // Call the function with either 'uniqueName' or 'friendlyName' depending on your requirements
      fetchConversation(uniqueName, "friendlyName");
    }
  }, [client, uniqueName]);


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
    initFcmServiceWorker().catch(() => {
      console.error(
        "FCM initialization failed: no push notifications will be available"
      );
    });
  }, []);
  useEffect(() => {
    const client = new Client(token);
    setClient(client);

  
    const fcmInit = async () => {
      await subscribeFcmNotifications(client);
    };


    fcmInit().catch(() => {
      console.error(
        "FCM initialization failed: no push notifications will be available"
      );
    });

    client.on("conversationJoined", (conversation) => {
      upsertConversation(conversation);

      conversation.on("typingStarted", (participant) => {
        handlePromiseRejection(
          () =>
            updateTypingIndicator(participant, conversation.sid, startTyping),
          addNotifications
        );
      });

      conversation.on("typingEnded", async (participant) => {
        await handlePromiseRejection(
          async () =>
            updateTypingIndicator(participant, conversation.sid, endTyping),
          addNotifications
        );
      });

      handlePromiseRejection(async () => {
        if (conversation.status === "joined") {
          const result = await conversation.getParticipants();
          updateParticipants(result, conversation.sid);

          const messages = await conversation.getMessages();
          upsertMessages(conversation.sid, messages.items);
          await loadUnreadMessagesCount(conversation, updateUnreadMessages);
        }
      }, addNotifications);
    });

    client.on("conversationRemoved", async (conversation: Conversation) => {
      updateCurrentConversation("");
      await handlePromiseRejection(async () => {
        removeConversation(conversation.sid);
        updateParticipants([], conversation.sid);
      }, addNotifications);
    });
    client.on("messageAdded", async (message: Message) => {
      await upsertMessage(message, upsertMessages, updateUnreadMessages);
      if (message.author === localStorage.getItem("username")) {
        clearAttachments(message.conversation.sid, "-1");
      }
    });
    client.on("userUpdated", async (event) => {
      await updateUser(event.user);
    });
    client.on("participantLeft", async (participant) => {
      await handlePromiseRejection(
        async () => handleParticipantsUpdate(participant, updateParticipants),
        addNotifications
      );
    });
    client.on("participantUpdated", async (event) => {
      await handlePromiseRejection(
        async () =>
          handleParticipantsUpdate(event.participant, updateParticipants),
        addNotifications
      );
    });
    client.on("participantJoined", async (participant) => {
      await handlePromiseRejection(
        async () => handleParticipantsUpdate(participant, updateParticipants),
        addNotifications
      );
    });
    client.on("conversationUpdated", async ({ conversation }) => {
      await handlePromiseRejection(
        () => upsertConversation(conversation),
        addNotifications
      );
    });

    client.on("messageUpdated", async ({ message }) => {
      await handlePromiseRejection(
        async () =>
          upsertMessage(message, upsertMessages, updateUnreadMessages),
        addNotifications
      );
    });

    client.on("messageRemoved", async (message) => {
      await handlePromiseRejection(
        () => removeMessages(message.conversation.sid, [message]),
        addNotifications
      );
    });

    client.on("pushNotification", (event) => {
      // @ts-ignore
      if (event.type !== "twilio.conversations.new_message") {
        return;
      }

      if (Notification.permission === "granted") {
        showNotification(event);
      } else {
        console.log("Push notification is skipped", Notification.permission);
      }
    });

    client.on("tokenAboutToExpire", async () => {
      if (username && password) {
        const token = await getToken(username, password);
        await client.updateToken(token);
        login(token);
      }
    });

    client.on("tokenExpired", async () => {
      if (username && password) {
        const token = await getToken(username, password);
        login(token);
        setClientIteration((x) => x + 1);
      }
    });

    client.on("connectionStateChanged", (state) => {
      setConnectionState(state);
    });

    updateLoadingState(false);
    return () => {
      client?.removeAllListeners();
    };
  }, [clientIteration, uniqueName]);

  useEffect(() => {
    const abortController = new AbortController();
    const use24hTimeFormat = localStorage.getItem("use24hTimeFormat");
    if (use24hTimeFormat !== null) {
      updateTimeFormat(true);
    }
    return () => {
      abortController.abort();
    };
  }, []);

  async function upsertMessage(
    message: Message,
    upsertMessages: AddMessagesType,
    updateUnreadMessages: SetUnreadMessagesType
  ) {
    //transform the message and add it to redux
    await handlePromiseRejection(async () => {
      if (sidRef.current === message.conversation.sid) {
        await message.conversation.advanceLastReadMessageIndex(message.index);
      }
      upsertMessages(message.conversation.sid, [message]);
      await loadUnreadMessagesCount(message.conversation, updateUnreadMessages);
    }, addNotifications);
  }


  function isMyMessage(messages: ReduxMessage[]) {
    if (messages === undefined || messages === null || messages.length === 0) {
      return false;
    }
    return messages[messages.length - 1].author ===
      localStorage.getItem("username")
      ? messages[messages.length - 1]
      : false;
  }

  function setUnreadMessagesCount(
    currentconvoSid: string,
    convoSid: string,
    unreadMessages: Record<string, number>,
    updateUnreadMessages: SetUnreadMessagesType
  ) {
    if (currentconvoSid == convoSid && unreadMessages[convoSid] !== 0) {
      updateUnreadMessages(convoSid, 0);
      return 0;
    }
    if (currentconvoSid == convoSid) {
      return 0;
    }
    return unreadMessages[convoSid];
  }

  const openedConversation = useMemo(
    () => conversations.find((convo) => convo.sid === sid),
    [sid, conversations]
  );

  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );

  const messages = useSelector((state: AppState) => state.messages);
  const typingData = useSelector((state: AppState) => state.typingData);
  const unreadMessages = useSelector((state: AppState) => state.unreadMessages);
  const participants = useSelector((state: AppState) => state.participants);

  function getLastMessage(messages: ReduxMessage[], typingData: string[]) {
    if (messages === undefined || messages === null) {
      return "Loading...";
    }
    if (typingData.length) {
      return getTypingMessage(typingData);
    }
    if (messages.length === 0) {
      return "No messages";
    }
    return messages[messages.length - 1].body || "Media message";
  }

  function handleSearch(value: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <Box style={stylesheet.appWrapper}>
      <AlertsView />
      <Notifications />
      <Box>
        <AppHeader
          user={username ?? ""}
          client={client}
          onSignOut={async () => {
            logout();

            // unregister service workers
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
              registration.unregister();
            }
          }}
          connectionState={connectionState ?? "disconnected"}
        />
      </Box>

      {convo ? (
        <Box style={stylesheet.appContainer(alertsExist)}>
          <ConversationsContainer client={client} />
          <Box style={stylesheet.messagesWrapper}>
            <ConversationContainer
              conversation={convo}
              client={client}
            />
          </Box>
        </Box>
      ) : (
        <Box style={stylesheet.appContainer(alertsExist)}>
          {/* <ConversationsContainer client={client} /> */}
          <CreateConversationButton client={client} collapsed={false} />
          <ConversationContainer
              conversation={convo}
              client={client}
            />
        </Box>
      )}

    </Box>
  );
};

export default IndividualConversationContainer;
