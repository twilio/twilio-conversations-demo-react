import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Client,
  Conversation,
  Paginator,
  Message,
  Participant,
} from "@twilio/conversations";
import { Box, Spinner } from "@twilio-paste/core";
import InfiniteScroll from "react-infinite-scroll-component";

import MessageList from "./MessageList";
import { AddMessagesType } from "../../types";
import styles from "../../styles";

export function updateMessages(
  conversation: Conversation,
  currentMessages: Message[],
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
  messages: Message[];
  loadingState: boolean;
  participants: Participant[];
  lastReadIndex: number;
}

const MessagesBox: React.FC<MessageProps> = (props: MessageProps) => {
  const { messages, convo, loadingState, lastReadIndex, addMessage } = props;
  const [hasMore, setHasMore] = useState(messages.length === 30);
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(0);
  const [paginator, setPaginator] = useState<Paginator<Message> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (
    (messages === undefined || messages === null) &&
    convo !== undefined &&
    !loadingState
  ) {
    updateMessages(convo, messages, addMessage);
  }

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
    setHasMore(messages.length === 30);
    convo.getMessages().then((paginator) => setPaginator(paginator));
  }, [convo]);

  useEffect(() => {
    if (messages?.length && messages[messages.length - 1].index !== -1) {
      convo.updateLastReadMessageIndex(messages[messages.length - 1].index);
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
      id="scrollable"
      paddingRight="space50"
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        width: "100%",
        zIndex: -1,
        overflow: "scroll",
        paddingLeft: 16,
        height: "100%",
      }}
    >
      <InfiniteScroll
        dataLength={messages?.length ?? 0}
        next={fetchMore}
        hasMore={!loading && hasMore}
        loader={
          <div style={styles.paginationSpinner}>
            <Spinner decorative={false} size="sizeIcon50" title="Loading" />
          </div>
        }
        scrollableTarget="scrollable"
        style={{
          display: "flex",
          overflow: "hidden",
          flexDirection: "column-reverse",
        }}
        inverse={true}
        scrollThreshold="20px"
      >
        <div ref={listRef} style={{ overflow: "scroll" }}>
          <MessageList
            messages={messages ?? []}
            conversation={convo}
            participants={props.participants}
            lastReadIndex={lastConversationReadIndex}
          />
        </div>
      </InfiniteScroll>
    </Box>
  );
};

export default MessagesBox;
