import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { saveAs } from "file-saver";
import { VariableSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { useTheme } from "@twilio-paste/theme";
import { Spinner } from "@twilio-paste/core";

import { getBlobFile, getMessageStatus } from "../../api";
import MessageView from "./MessageView";
import { actionCreators, AppState } from "../../store";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import Horizon from "./Horizon";
import {
  successNotification,
  unexpectedErrorNotification,
} from "../../helpers";
import type { ReactionsType } from "./Reactions";
import MessageMedia from "./MessageMedia";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import {
  ReduxMedia,
  ReduxMessage,
} from "../../store/reducers/messageListReducer";
import {
  getSdkMediaObject,
  getSdkMessageObject,
} from "../../conversations-objects";
import { getSdkConversationObject } from "../../conversations-objects";
import TimeAgo from "javascript-time-ago";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import styles from "../../styles";
import { Message } from "@twilio/conversations";
import wrap from "word-wrap";

const messageHasMedia = (message: ReduxMessage | Message): boolean => {
  return !!message.attachedMedia && message.attachedMedia.length > 0; // @todo category filter?
};

interface MessageListProps {
  messages: ReduxMessage[];
  conversation: ReduxConversation;
  participants: ReduxParticipant[];
  lastReadIndex: number;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
}

function getMessageTime(message: ReduxMessage) {
  const dateCreated = message.dateCreated;

  return dateCreated
    ? new TimeAgo("en-US").format(dateCreated, "twitter-now")
    : "";
}

const MessageList: React.FC<MessageListProps> = (props: MessageListProps) => {
  const { messages, conversation, lastReadIndex } = props;
  if (messages === undefined) {
    return <div className="empty" />;
  }

  const theme = useTheme();
  const readHorizonRef = useRef<HTMLInputElement>(null);
  const messagesLength: number = messages.length;

  const dispatch = useDispatch();
  const { addAttachment, addNotifications } = bindActionCreators(
    actionCreators,
    dispatch
  );
  const conversationAttachments = useSelector(
    (state: AppState) => state.attachments[conversation.sid]
  );

  const [imagePreview, setImagePreview] = useState<{
    message: ReduxMessage;
    file: Blob;
    sid: string;
  } | null>(null);

  const [horizonMessageCount, setHorizonMessageCount] = useState<number>(0);
  const [showHorizonIndex, setShowHorizonIndex] = useState<number>(0);
  const [scrolledToHorizon, setScrollToHorizon] = useState(false);

  useEffect(() => {
    if (scrolledToHorizon || !readHorizonRef.current) {
      return;
    }
    readHorizonRef.current.scrollIntoView({
      behavior: "smooth",
    });
    setScrollToHorizon(true);
  });

  useEffect(() => {
    if (lastReadIndex === -1 || horizonMessageCount) {
      return;
    }
    getSdkConversationObject(conversation)
      .getUnreadMessagesCount()
      .then((count) => {
        setHorizonMessageCount(count ?? 0);
        setShowHorizonIndex(0);
      });
  }, [messages, lastReadIndex]);

  const authorNotChanged = (newIndex: number) =>
    props.messages[newIndex] !== undefined &&
    props.messages[newIndex - 1] !== undefined &&
    props.messages[newIndex].author === props.messages[newIndex - 1].author;

  const setTopPadding = (index: number) =>
    authorNotChanged(index) ? theme.space.space20 : theme.space.space50;

  const onDownloadAttachments = async (message: ReduxMessage) => {
    const attachedMedia = message.attachedMedia?.map(getSdkMediaObject);
    if (message.index === -1) {
      return undefined;
    }
    if (!attachedMedia?.length) {
      return new Error("No media attached");
    }

    for (const media of attachedMedia) {
      const blob = await getBlobFile(media, addNotifications);
      addAttachment(props.conversation.sid, message.sid, media.sid, blob);
    }

    return;
  };

  const onFileOpen = (file: Blob, { filename }: ReduxMedia) => {
    saveAs(file, filename ?? "");
  };

  const getMessageHeight = (index: number) => {
    const message = messages[index];
    const iAmAuthor = message.author === localStorage.getItem("username");
    let height = iAmAuthor ? 98 : 93; // empty message block with/without statuses
    height += 24; // padding top & bottom

    height += wrap(message.body, { width: 75, indent: "", cut: true }).split(
      "\n"
    ).length;

    // calculating media message height
    if (messageHasMedia(message)) {
      // @ts-stupid we know attachedMedia is not null here - we just checked that one line above.
      if (message.attachedMedia?.some((m) => m.contentType.includes("image"))) {
        return (height += 200);
      }

      return (height += 71); // file view height
    }

    return height;
  };

  const { hasMore, fetchMore } = props;
  const isItemLoaded = (index: number) => !hasMore || index < messages?.length;

  return (
    <>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? messages?.length + 1 : messages?.length}
            loadMoreItems={fetchMore}
          >
            {({ onItemsRendered, ref }) => (
              <List
                height={height}
                itemCount={hasMore ? messages?.length + 1 : messages?.length}
                itemSize={getMessageHeight}
                onItemsRendered={onItemsRendered}
                ref={ref}
                width={width}
              >
                {({ index, style }) => {
                  let content;
                  if (!isItemLoaded(index)) {
                    content = (
                      <div style={{ ...styles.paginationSpinner, ...style }}>
                        <Spinner
                          decorative={false}
                          size="sizeIcon50"
                          title="Loading"
                        />
                      </div>
                    );
                  } else {
                    const message = messages[index];

                    const messageImages: ReduxMedia[] = [];
                    const messageFiles: ReduxMedia[] = [];
                    (message.attachedMedia || []).forEach((file) => {
                      const { contentType } = file;
                      if (contentType.includes("image")) {
                        messageImages.push(file);
                        return;
                      }
                      messageFiles.push(file);
                    });
                    const attributes = message.attributes as Record<
                      string,
                      ReactionsType | undefined
                    >;

                    content = (
                      <div key={message.sid + "messageDiv"}>
                        {lastReadIndex !== -1 &&
                        horizonMessageCount &&
                        showHorizonIndex === message.index ? (
                          <Horizon
                            ref={readHorizonRef}
                            messageCount={horizonMessageCount}
                          />
                        ) : null}
                        <MessageView
                          reactions={attributes["reactions"]}
                          text={message.body ?? ""}
                          media={
                            messageHasMedia(message) ? (
                              <MessageMedia
                                key={message.sid + "media"}
                                attachments={
                                  conversationAttachments?.[message.sid]
                                }
                                onDownload={async () =>
                                  await onDownloadAttachments(message)
                                }
                                images={messageImages}
                                files={messageFiles}
                                sending={message.index === -1}
                                onOpen={(
                                  mediaSid: string,
                                  image?: ReduxMedia,
                                  file?: ReduxMedia
                                ) => {
                                  if (file) {
                                    onFileOpen(
                                      conversationAttachments?.[message.sid][
                                        mediaSid
                                      ],
                                      file
                                    );
                                    return;
                                  }
                                  if (image) {
                                    setImagePreview({
                                      message,
                                      file: conversationAttachments?.[
                                        message.sid
                                      ][mediaSid],
                                      sid: mediaSid,
                                    });
                                  }
                                }}
                              />
                            ) : null
                          }
                          author={message.author ?? ""}
                          getStatus={getMessageStatus(
                            message,
                            props.participants
                          )}
                          onDeleteMessage={async () => {
                            try {
                              await getSdkMessageObject(message).remove();
                              successNotification({
                                message: "Message deleted.",
                                addNotifications,
                              });
                            } catch {
                              unexpectedErrorNotification(addNotifications);
                            }
                          }}
                          topPadding={setTopPadding(index)}
                          lastMessageBottomPadding={
                            index === messagesLength - 1 ? 16 : 0
                          }
                          sameAuthorAsPrev={authorNotChanged(index)}
                          messageTime={getMessageTime(message)}
                          updateAttributes={(attribute) =>
                            getSdkMessageObject(message).updateAttributes({
                              ...attributes,
                              ...attribute,
                            })
                          }
                        />
                      </div>
                    );
                  }

                  return <>{content}</>;
                }}
              </List>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
      {imagePreview
        ? (function () {
            const dateString = imagePreview?.message.dateCreated;
            const date = dateString ? new Date(dateString) : "";
            return (
              <ImagePreviewModal
                image={imagePreview.file}
                isOpen={!!imagePreview}
                author={imagePreview?.message.author ?? ""}
                date={
                  date
                    ? date.toDateString() +
                      ", " +
                      date.getHours() +
                      ":" +
                      (date.getMinutes() < 10 ? "0" : "") +
                      date.getMinutes()
                    : ""
                }
                handleClose={() => setImagePreview(null)}
                onDownload={() => {
                  saveAs(
                    imagePreview.file,
                    imagePreview.message.attachedMedia?.find(
                      ({ sid }) => sid === imagePreview.sid
                    )?.filename ?? ""
                  );
                }}
              />
            );
          })()
        : null}
    </>
  );
};

export default MessageList;
