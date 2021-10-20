import { useState, useEffect, useMemo, useRef } from "react";
import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, View } from "react-native";

import { Message } from "@twilio/conversations/lib/message";
import Client from "@twilio/conversations";
import { Conversation } from "@twilio/conversations/lib/conversation";
import { Participant } from "@twilio/conversations/lib/participant";

import { actionCreators, AppState } from "../store";
import ConversationContainer from "./conversations/ConversationContainer";
import ConversationsContainer from "./conversations/ConversationsContainer";
import {
  AddMessagesType,
  SetParticipantsType,
  SetUreadMessagesType,
} from "../types";
import { getConversationParticipants, getToken } from "../api";

type SetConvosType = (convos: Conversation[]) => void;

function loadUnreadMessagesCount(
  convo: Conversation,
  updateUnreadMessages: SetUreadMessagesType
) {
  convo.getUnreadMessagesCount().then((count: number | null) => {
    if (count === null) {
      updateUnreadMessages(convo.sid, 0);
    } else {
      updateUnreadMessages(convo.sid, count);
    }
  });
}

async function handleParticipantsUpdate(
  participant: Participant,
  updateParticipants: SetParticipantsType
) {
  const result = await getConversationParticipants(participant.conversation);
  updateParticipants(result, participant.conversation.sid);
}

function updateConvoList(
  client: Client,
  conversation: Conversation,
  setConvos: SetConvosType,
  addMessages: AddMessagesType,
  updateUnreadMessages: SetUreadMessagesType
) {
  conversation
    .getMessages()
    .then((messages) => {
      addMessages(conversation.sid, messages.items);
    })
    .catch(() => {
      addMessages(conversation.sid, []);
    });

  loadUnreadMessagesCount(conversation, updateUnreadMessages);

  client.getSubscribedConversations().then((value) => {
    setConvos(value.items);
  });
}

const AppContainer: React.FC = () => {
  /* eslint-disable */
  const Conversations = require("@twilio/conversations");
  const [client, setClient] = useState<Client>();
  const token = useSelector((state: AppState) => state.token);
  const conversations = useSelector((state: AppState) => state.convos);
  const sid = useSelector((state: AppState) => state.sid);
  const sidRef = useRef("");
  sidRef.current = sid;


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
  } = bindActionCreators(actionCreators, dispatch);

  const updateTypingIndicator = (participant: Participant, sid: string, callback: (sid: string, user: string) => void) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { attributes: { friendlyName }, identity } = participant;
    if (identity === localStorage.getItem("username")) {
      return;
    }
    callback(
        sid,
        identity || friendlyName || "",
    );
  }
  useEffect(() => {
    Conversations.Client.create(token).then((client: Client) => {
      setClient(client);
      client.addListener("conversationAdded", async (conversation: Conversation) => {
        conversation.addListener("typingStarted", (participant) => {
          updateTypingIndicator(participant, conversation.sid, startTyping);
        });

        conversation.addListener("typingEnded", (participant) => {
          updateTypingIndicator(participant, conversation.sid, endTyping);
        });

        updateConvoList(
          client,
            conversation,
            listConversations,
          addMessages,
          updateUnreadMessages
        );
        const result = await getConversationParticipants(conversation);
        updateParticipants(result, conversation.sid);
      });
      client.addListener("conversationRemoved", (conversation: Conversation) => {
        updateCurrentConversation("");
        removeConversation(conversation.sid);
        updateParticipants([], conversation.sid);
      });
      client.addListener("messageAdded", (event: Message) => {
        addMessage(event, addMessages, updateUnreadMessages);
      });
      client.addListener("participantLeft", (participant) => {
        handleParticipantsUpdate(participant, updateParticipants);
      });
      client.addListener("participantUpdated", (event) => {
        handleParticipantsUpdate(event.participant, updateParticipants);
      });
      client.addListener("participantJoined", (participant) => {
        handleParticipantsUpdate(participant, updateParticipants);
      });
      client.addListener("conversationUpdated", ({ conversation }) => {
        updateConvoList(
            client,
            conversation,
            listConversations,
            addMessages,
            updateUnreadMessages
        );
      });
      client.addListener("messageUpdated", ({ message }) => {
        updateConvoList(
            client,
            message.conversation,
            listConversations,
            addMessages,
            updateUnreadMessages
        );
      });

      client.addListener("messageRemoved", (message) => {
        removeMessages(
            message.conversation.sid, [message]
        );
      });

        client.addListener("tokenExpired", () => {
          const username = localStorage.getItem("username");
          const password = localStorage.getItem("password");
          if (username && password) {
            getToken(username, password).then((token) => {
              login(token);
            });
          }
        });

      updateLoadingState(false);
    });

    return () => {
      client?.removeAllListeners();
    }
  }, []);


  function addMessage(
      message: Message,
      addMessages: AddMessagesType,
      updateUnreadMessages: SetUreadMessagesType,
  ) {
    //transform the message and add it to redux
    if (sidRef.current === message.conversation.sid) {
      message.conversation.updateLastReadMessageIndex(message.index);
    }
    addMessages(message.conversation.sid, [message]);
    loadUnreadMessagesCount(message.conversation, updateUnreadMessages);
  }

  const openedConversation = useMemo(
      () => conversations.find((convo) => convo.sid === sid),
      [sid, conversations]
  );

  return (
    <View style={styles.appWrapper}>
      <View style={styles.convosWrapper}>
        <ConversationsContainer
          client={client}
        />
      </View>
      <View style={styles.messagesWrapper}>
        <ConversationContainer
          conversation={openedConversation}
          client={client}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appWrapper: {
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "row",
  },
  convosWrapper: {
    height: "100%",
    width: 320,
    backgroundColor: "#F4F4F6",
  },
  messagesWrapper: {
    flex: 1,
  },
});

export default AppContainer;
