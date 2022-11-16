import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Client, Message, Paginator } from "@twilio/conversations";
import { Box } from "@twilio-paste/core";
import _ from "lodash";

import MessageList from "./MessageList";
import { AddMessagesType } from "../../types";
import { getMessages } from "../../api";
import { CONVERSATION_PAGE_SIZE } from "../../constants";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxMessage } from "../../store/reducers/messageListReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";

/// Load first batch of messages from the conversation.
export async function loadMessages(
  conversation: ReduxConversation,
  addMessage: AddMessagesType,
  currentMessages: ReduxMessage[] = []
): Promise<void> {
  const convoSid: string = conversation.sid;
  const sidExists = _.some(currentMessages, ({ sid }) => sid === convoSid);
  if (!sidExists) {
    const paginator = await getMessages(getSdkConversationObject(conversation));
    const messages = paginator.items;
    //save to redux
    addMessage(convoSid, messages);
  }
}

interface MessageProps {
  convoSid: string;
  client?: Client;
  convo: ReduxConversation;
  addMessage: AddMessagesType;
  messages: ReduxMessage[];
  loadingState: boolean;
  participants: ReduxParticipant[];
  lastReadIndex: number;
}

const MessagesBox: React.FC<MessageProps> = (props: MessageProps) => {
  const { messages, convo, loadingState, lastReadIndex, addMessage } = props;
  const [hasMore, setHasMore] = useState(
    messages?.length === CONVERSATION_PAGE_SIZE
  );
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(0);
  const [paginator, setPaginator] = useState<Paginator<Message> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sdkConvo = useMemo(() => getSdkConversationObject(convo), [convo.sid]);

  useEffect(() => {
    if (!messages && convo && !loadingState) {
      loadMessages(convo, addMessage);
    }
  }, []);

  useLayoutEffect(() => {
    const currentHeight = listRef.current?.clientHeight;
    if (currentHeight && currentHeight > height && loading) {
      // for preventing immediate downloading of the next messages page
      setTimeout(() => {
        setHeight(currentHeight ?? 0);
        setLoading(false);
      }, 2000);
    }
  }, [listRef.current?.clientHeight]);

  useEffect(() => {
    getMessages(sdkConvo).then((paginator) => {
      setHasMore(paginator.hasPrevPage);
      setPaginator(paginator);
    });
  }, [convo]);

  useEffect(() => {
    if (messages?.length && messages[0].index !== -1) {
      sdkConvo
        .updateLastReadMessageIndex(messages[0].index)
        .then((newUnread: number) => {
          convo.unreadMessageCount = newUnread;
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [messages, convo]);

  const lastConversationReadIndex = useMemo(
    () =>
      messages?.length &&
      messages[messages.length - 1].author !== localStorage.getItem("username")
        ? lastReadIndex
        : -1,
    [lastReadIndex, messages]
  );

  const fetchMore = async () => {
    if (!paginator) {
      return;
    }

    const result = await paginator?.prevPage();
    if (!result) {
      return;
    }
    const moreMessages = result.items;

    setLoading(true);
    setPaginator(result);
    setHasMore(result.hasPrevPage);
    addMessage(convo.sid, moreMessages);
  };

  return (
    <Box
      key={convo.sid}
      paddingRight="space50"
      style={{
        display: "block",
        width: "100%",
        paddingLeft: 16,
        height: "100%",
      }}
    >
      <MessageList
        messages={messages ?? []}
        conversation={convo}
        participants={props.participants}
        lastReadIndex={lastConversationReadIndex}
        hasMore={hasMore}
        fetchMore={fetchMore}
      />
    </Box>
  );
};

export default MessagesBox;
