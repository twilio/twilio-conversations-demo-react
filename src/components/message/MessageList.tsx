import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { saveAs } from "file-saver";

import {
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  ChatBubble,
  Separator,
  Badge,
  Box,
} from "@twilio-paste/core";
import { CustomizationProvider } from "@twilio-paste/core/customization";

import { getBlobFile } from "../../api";
import { actionCreators, AppState } from "../../store";
import ImagePreviewModal from "../modals/ImagePreviewModal";
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
  getSdkParticipantObject,
} from "../../conversations-objects";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import Reactions from "./Reactions";
import { MessageStatus } from "./MessageStatus";
import { MAX_MESSAGE_LINE_WIDTH } from "../../constants";
import wrap from "word-wrap";
import {
  getMessageTime,
  getFirstMessagePerDate,
} from "./../../utils/timestampUtils";
import { useDropzone } from "react-dropzone";
import { MAX_FILE_SIZE } from "../../constants";

interface MessageListProps {
  messages: ReduxMessage[];
  conversation: ReduxConversation;
  participants: ReduxParticipant[];
  lastReadIndex: number;
  use24hTimeFormat: boolean;
  handleDroppedFiles: (droppedFiles: File[]) => void;
}

const MetaItemWithMargin: React.FC<{ children: ReactNode }> = (props) => (
  <ChatMessageMetaItem>
    <div style={{ marginTop: "5px" }}>{props.children}</div>
  </ChatMessageMetaItem>
);

const MessageList: React.FC<MessageListProps> = (props: MessageListProps) => {
  const {
    messages,
    conversation,
    lastReadIndex,
    use24hTimeFormat,
    handleDroppedFiles,
  } = props;
  if (messages === undefined) {
    return <div className="empty" />;
  }

  // const theme = useTheme();
  const myRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const { addAttachment, addNotifications, updateUser } = bindActionCreators(
    actionCreators,
    dispatch
  );
  const conversationAttachments = useSelector(
    (state: AppState) => state.attachments[conversation.sid]
  );
  const users = useSelector((state: AppState) => state.users);

  const [imagePreview, setImagePreview] = useState<{
    message: ReduxMessage;
    file: Blob;
    sid: string;
  } | null>(null);

  const [horizonMessageCount, setHorizonMessageCount] = useState<number>(0);
  // const [showHorizonIndex, setShowHorizonIndex] = useState<number>(0);
  const [scrolledToHorizon, setScrollToHorizon] = useState(false);
  const [firstMessagePerDay, setFirstMessagePerDay] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const today = new Date().toDateString();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".gif"],
    },
  });

  useEffect(() => {
    if (scrolledToHorizon || !myRef.current) {
      return;
    }
    myRef.current.scrollIntoView({
      behavior: "smooth",
    });
    setScrollToHorizon(true);
  });

  useEffect(() => {
    if (lastReadIndex === -1 || horizonMessageCount) {
      return;
    }
    // const showIndex = 0;
    getSdkConversationObject(conversation)
      .getUnreadMessagesCount()
      .then((count) => {
        setHorizonMessageCount(count ?? 0);
        // setShowHorizonIndex(showIndex);
      });
  }, [messages, lastReadIndex]);

  // Updates the user list based on message authors to be able to get friendly names
  useEffect(() => {
    messages.forEach((message) => {
      const participant = message.participantSid
        ? participantsBySid.get(message.participantSid)
        : null;
      if (participant && participant.identity) {
        if (!users[participant.identity]) {
          const sdkParticipant = getSdkParticipantObject(participant);
          sdkParticipant.getUser().then((sdkUser) => {
            updateUser(sdkUser);
          });
        }
      }
      setFirstMessagePerDay(getFirstMessagePerDate(messages));
    });
  }, [messages]);

  useEffect(() => {
    const abortController = new AbortController();
    handleDroppedFiles(files);
    return () => {
      abortController.abort();
    };
  }, [files]);

  // function setTopPadding(index: number) {
  //   if (
  //     props.messages[index] !== undefined &&
  //     props.messages[index - 1] !== undefined &&
  //     props.messages[index].author === props.messages[index - 1].author
  //   ) {
  //     return theme.space.space20;
  //   }
  //   return theme.space.space50;
  // }

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

  const participantsBySid = new Map(props.participants.map((p) => [p.sid, p]));

  const getAuthorFriendlyName = (message: ReduxMessage) => {
    const author = message.author ?? "";
    if (message.participantSid == null) return author;

    const participant = participantsBySid.get(message.participantSid);
    if (participant == null || participant.identity == null) return author;

    const user = users[participant.identity];
    return user?.friendlyName || author;
  };

  return (
    <CustomizationProvider
      elements={{
        MY_CUSTOM_CHATLOG: {
          backgroundColor: isDragActive
            ? "colorBackgroundPrimaryWeakest"
            : null,
        },
      }}
    >
      <ChatLog {...getRootProps()} element="MY_CUSTOM_CHATLOG">
        <input {...getInputProps()} />
        {messages.map((message) => {
          const messageImages: ReduxMedia[] = [];
          const messageFiles: ReduxMedia[] = [];
          const currentDateCreated = message.dateCreated ?? null;
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

          const wrappedBody = wrap(message.body ?? "", {
            width: MAX_MESSAGE_LINE_WIDTH,
            indent: "",
            cut: true,
          });

          const isOutbound =
            message.author === localStorage.getItem("username");
          let metaItems = [
            <ChatMessageMetaItem key={0}>
              <Reactions
                reactions={attributes.reactions}
                onReactionsChanged={(reactions) => {
                  getSdkMessageObject(message).updateAttributes({
                    ...attributes,
                    reactions,
                  });
                }}
              />
            </ChatMessageMetaItem>,
            <MetaItemWithMargin key={1}>
              <MessageStatus
                message={message}
                channelParticipants={props.participants}
              />
            </MetaItemWithMargin>,
            <MetaItemWithMargin key={2}>
              {isOutbound
                ? `${getAuthorFriendlyName(message)}・${getMessageTime(
                    message,
                    use24hTimeFormat
                  )}`
                : `${getMessageTime(
                    message,
                    use24hTimeFormat
                  )}・${getAuthorFriendlyName(message)}`}
            </MetaItemWithMargin>,
          ];

          if (isOutbound) {
            metaItems = metaItems.reverse();
          }

          return (
            <div key={message.sid}>
              {currentDateCreated && firstMessagePerDay.includes(message.sid) && (
                <>
                  <Separator
                    orientation="horizontal"
                    verticalSpacing="space50"
                  />
                  <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Badge as="span" variant="neutral">
                      {currentDateCreated.toDateString() === today
                        ? "Today"
                        : currentDateCreated.toDateString()}
                    </Badge>
                  </Box>
                </>
              )}
              <ChatMessage
                variant={isOutbound ? "outbound" : "inbound"}
                key={`${message.sid}.message`}
              >
                <ChatBubble>
                  {wrappedBody}
                  <MessageMedia
                    key={message.sid}
                    attachments={conversationAttachments?.[message.sid]}
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
                          conversationAttachments?.[message.sid][mediaSid],
                          file
                        );
                        return;
                      }
                      if (image) {
                        setImagePreview({
                          message,
                          file: conversationAttachments?.[message.sid][
                            mediaSid
                          ],
                          sid: mediaSid,
                        });
                      }
                    }}
                  />
                </ChatBubble>
                <ChatMessageMeta
                  aria-label={`said by ${getAuthorFriendlyName(message)}`}
                >
                  {metaItems}
                </ChatMessageMeta>
              </ChatMessage>
            </div>
            // todo: delete only when full functionality is transferred over
            // <div key={message.sid + "message"}>
            //   {lastReadIndex !== -1 &&
            //   horizonMessageCount &&
            //   showHorizonIndex === message.index ? (
            //     <Horizon ref={myRef} messageCount={horizonMessageCount} />
            //   ) : null}
            //   <MessageView
            //     reactions={attributes["reactions"]}
            //     text={wrappedBody}
            //     media={
            //       message.attachedMedia?.length ? (
            //         <MessageMedia
            //           key={message.sid}
            //           attachments={conversationAttachments?.[message.sid]}
            //           onDownload={async () =>
            //             await onDownloadAttachments(message)
            //           }
            //           images={messageImages}
            //           files={messageFiles}
            //           sending={message.index === -1}
            //           onOpen={(
            //             mediaSid: string,
            //             image?: ReduxMedia,
            //             file?: ReduxMedia
            //           ) => {
            //             if (file) {
            //               onFileOpen(
            //                 conversationAttachments?.[message.sid][mediaSid],
            //                 file
            //               );
            //               return;
            //             }
            //             if (image) {
            //               setImagePreview({
            //                 message,
            //                 file: conversationAttachments?.[message.sid][
            //                   mediaSid
            //                 ],
            //                 sid: mediaSid,
            //               });
            //             }
            //           }}
            //         />
            //       ) : null
            //     }
            //     author={message.author ?? ""}
            //     getStatus={getMessageStatus(message, props.participants)}
            //     onDeleteMessage={async () => {
            //       try {
            //         await getSdkMessageObject(message).remove();
            //         successNotification({
            //           message: "Message deleted.",
            //           addNotifications,
            //         });
            //       } catch (e) {
            //         unexpectedErrorNotification(e.message, addNotifications);
            //       }
            //     }}
            //     topPadding={setTopPadding(index)}
            //     lastMessageBottomPadding={index === messagesLength - 1 ? 16 : 0}
            //     sameAuthorAsPrev={setTopPadding(index) !== theme.space.space20}
            //     messageTime={getMessageTime(message)}
            //     updateAttributes={(attribute) =>
            //       getSdkMessageObject(message).updateAttributes({
            //         ...attributes,
            //         ...attribute,
            //       })
            //     }
            //   />
            // </div>
          );
        })}
        {imagePreview
          ? (function () {
              const dateString = imagePreview?.message.dateCreated;
              const date = dateString ? new Date(dateString) : "";
              return (
                <ImagePreviewModal
                  image={imagePreview.file}
                  isOpen={!!imagePreview}
                  author={
                    imagePreview
                      ? getAuthorFriendlyName(imagePreview.message)
                      : ""
                  }
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
      </ChatLog>
    </CustomizationProvider>
  );
};

export default MessageList;
