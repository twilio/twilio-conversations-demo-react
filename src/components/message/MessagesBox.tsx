import React, { useEffect, useMemo } from "react";

import Client from "@twilio/conversations";
import { Conversation } from "@twilio/conversations/lib/conversation";
import { Paginator } from "@twilio/conversations/lib/interfaces/paginator";
import { Message } from "@twilio/conversations/lib/message";
import { Box } from "@twilio-paste/core";
import { Participant } from "@twilio/conversations/lib/participant";

import MessageList from "./MessageList";
import { AddMessagesType } from "../../types";

export function updateMessages(
  conversation: Conversation,
  currentMessages: Record<string, Message[]>,
  addMessage: AddMessagesType
): void {
  const convoSid: string = conversation.sid;
  if (!(convoSid in currentMessages)) {
    conversation.getMessages().then((value: Paginator<Message>) => {
      const messages = value.items;
      //save to redux
      addMessage(convoSid, messages);
    });
  }
}

interface MessageProps {
  convoSid: string;
  client?: Client;
  convo: Conversation;
  addMessage: AddMessagesType;
  messages: Record<string, Message[]>;
  loadingState: boolean;
  participants: Participant[];
  lastReadIndex: number;
}

const MessagesBox: React.FC<MessageProps> = (props: MessageProps) => {
  const { messages, convo, convoSid, loadingState, lastReadIndex, addMessage } =
    props;
  const visibleMessages = messages[convoSid];
  if (
    (visibleMessages === undefined || visibleMessages === null) &&
    convo !== undefined &&
    !loadingState
  ) {
    updateMessages(convo, messages, addMessage);
  }

  useEffect(() => {
    if (
      visibleMessages?.length &&
      visibleMessages[visibleMessages.length - 1].index !== -1
    ) {
      convo.updateLastReadMessageIndex(
        visibleMessages[visibleMessages.length - 1].index
      );
    }
  }, [visibleMessages, convo]);

  const lastConversationReadIndex = useMemo(
    () =>
      visibleMessages?.length &&
      visibleMessages[visibleMessages.length - 1].author !==
        localStorage.getItem("username")
        ? lastReadIndex
        : -1,
    [lastReadIndex, visibleMessages]
  );

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        width: "100%",
        flexGrow: 2,
        flexShrink: 2,
        zIndex: -1,
        flexBasis: "90%",
        overflow: "scroll",
        paddingLeft: 16,
      }}
    >
      <MessageList
        messages={visibleMessages ?? []}
        conversation={convo}
        participants={props.participants}
        lastReadIndex={lastConversationReadIndex}
      />
    </Box>
  );
};

export default MessagesBox;
