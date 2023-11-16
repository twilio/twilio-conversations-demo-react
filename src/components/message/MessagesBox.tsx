import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Client, Message, Paginator } from "@twilio/conversations";
import { Box, Spinner } from "@twilio-paste/core";
import InfiniteScroll from "react-infinite-scroll-component";

import MessageList from "./MessageList";
import { AddMessagesType } from "../../types";
import styles from "../../styles";
import { getMessages } from "../../api";
import { CONVERSATION_PAGE_SIZE } from "../../constants";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxMessage } from "../../store/reducers/messageListReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";

export async function loadMessages(
  conversation: ReduxConversation,
  upsertMessage: AddMessagesType,
  currentMessages: ReduxMessage[] = []
): Promise<void> {
  const convoSid: string = conversation.sid;
  const sidExists = !!currentMessages.filter(({ sid }) => sid === convoSid)
    .length;
  if (!sidExists) {
    const paginator = await getMessages(getSdkConversationObject(conversation));
    const messages = paginator.items;
    //save to redux
    upsertMessage(convoSid, messages);
  }
}

interface MessageProps {
  convoSid: string;
  client?: Client;
  convo: ReduxConversation;
  upsertMessage: AddMessagesType;
  messages: ReduxMessage[];
  loadingState: boolean;
  participants: ReduxParticipant[];
  lastReadIndex: number;
  use24hTimeFormat: boolean;
  handleDroppedFiles: (droppedFiles: File[]) => void;
}

const MessagesBox: React.FC<MessageProps> = (props: MessageProps) => {
  const {
    messages,
    convo,
    loadingState,
    lastReadIndex,
    upsertMessage,
    use24hTimeFormat,
    handleDroppedFiles,
  } = props;
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
      loadMessages(convo, upsertMessage);
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
    if (messages?.length && messages[messages.length - 1].index !== -1) {
      sdkConvo.advanceLastReadMessageIndex(messages[messages.length - 1].index);
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
    upsertMessage(convo.sid, moreMessages);
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
        overflowY: "auto",
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
        <div ref={listRef}>
          <MessageList
            messages={messages ?? []}
            conversation={convo}
            participants={props.participants}
            lastReadIndex={lastConversationReadIndex}
            use24hTimeFormat={use24hTimeFormat}
            handleDroppedFiles={handleDroppedFiles}
          />
        </div>
      </InfiniteScroll>
    </Box>
  );
};

export default MessagesBox;
