import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { saveAs } from "file-saver";

import { useTheme } from "@twilio-paste/theme";

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

interface MessageListProps {
  messages: ReduxMessage[];
  conversation: ReduxConversation;
  participants: ReduxParticipant[];
  lastReadIndex: number;
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
  const myRef = useRef<HTMLInputElement>(null);
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
    const showIndex = 0;
    getSdkConversationObject(conversation)
      .getUnreadMessagesCount()
      .then((count) => {
        setHorizonMessageCount(count ?? 0);
        setShowHorizonIndex(showIndex);
      });
  }, [messages, lastReadIndex]);

  function setTopPadding(index: number) {
    if (
      props.messages[index] !== undefined &&
      props.messages[index - 1] !== undefined &&
      props.messages[index].author === props.messages[index - 1].author
    ) {
      return theme.space.space20;
    }
    return theme.space.space50;
  }

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

  return (
    <>
      {messages.map((message, index) => {
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

        return (
          <div key={message.sid + "message"}>
            {lastReadIndex !== -1 &&
            horizonMessageCount &&
            showHorizonIndex === message.index ? (
              <Horizon ref={myRef} messageCount={horizonMessageCount} />
            ) : null}
            <MessageView
              reactions={attributes["reactions"]}
              text={message.body ?? ""}
              media={
                message.attachedMedia?.length ? (
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
                ) : null
              }
              author={message.author ?? ""}
              getStatus={getMessageStatus(message, props.participants)}
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
              lastMessageBottomPadding={index === messagesLength - 1 ? 16 : 0}
              sameAuthorAsPrev={setTopPadding(index) !== theme.space.space20}
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
      })}
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
