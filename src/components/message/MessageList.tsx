import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { saveAs } from "file-saver";

import { useTheme } from "@twilio-paste/theme";
import {
  Conversation,
  Message,
  Media,
  Participant,
} from "@twilio/conversations";

import { getBlobFile, getMessageStatus } from "../../api";
import MessageView from "./MessageView";
import MessageFile from "./MessageFile";
import { actionCreators, AppState } from "../../store";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import Horizon from "./Horizon";
import {
  successNotification,
  unexpectedErrorNotification,
} from "../../helpers";
import type { ReactionsType } from "./Reactions";

interface MessageListProps {
  messages: Message[];
  conversation: Conversation;
  participants: Participant[];
  lastReadIndex: number;
}

function getMessageTime(message: Message) {
  const dateCreated = message.dateCreated;

  if (!dateCreated) {
    return "";
  }

  const today = new Date();
  const diffInDates = Math.floor(today.getTime() - dateCreated.getTime());
  const dayLength = 1000 * 60 * 60 * 24;
  const diffInDays = Math.floor(diffInDates / dayLength);
  const minutesLessThanTen = dateCreated.getMinutes() < 10 ? "0" : "";
  if (diffInDays === 0) {
    return (
      dateCreated.getHours().toString() +
      ":" +
      minutesLessThanTen +
      dateCreated.getMinutes().toString()
    );
  }
  return (
    dateCreated.getDate() +
    "/" +
    dateCreated.getMonth() +
    "/" +
    dateCreated.getFullYear().toString().substr(-2) +
    " " +
    dateCreated.getHours().toString() +
    ":" +
    minutesLessThanTen +
    dateCreated.getMinutes().toString()
  );
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
    message: Message;
    file: Blob;
  } | null>(null);
  const [fileLoading, setFileLoading] = useState<Record<string, boolean>>({});

  const [horizonAmount, setHorizonAmount] = useState<number>(0);
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
    if (lastReadIndex === -1 || horizonAmount) {
      return;
    }
    let showIndex = 0;

    setHorizonAmount(
      messages.filter(({ index }) => {
        if (index > lastReadIndex && !showIndex) {
          showIndex = index;
        }
        return index > lastReadIndex;
      }).length
    );

    setShowHorizonIndex(showIndex);
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

  const onDownloadAttachment = async (message: Message) => {
    if (!message.media) {
      return new Error("No media attached");
    }

    setFileLoading(Object.assign({}, fileLoading, { [message.sid]: true }));
    const blob = await getBlobFile(message.media, addNotifications);
    addAttachment(props.conversation.sid, message.sid, blob);
    setFileLoading(Object.assign({}, fileLoading, { [message.sid]: false }));
  };

  const onFileOpen = (file: Blob, { filename }: Media) => {
    saveAs(file, filename ?? "");
  };

  return (
    <>
      {messages.map((message, index) => {
        const isImage = message.media?.contentType?.includes("image");
        const fileBlob = conversationAttachments?.[message.sid] ?? null;
        const attributes = message.attributes as Record<
          string,
          ReactionsType | undefined
        >;

        return (
          <div
            key={
              (message.dateCreated?.getTime() ?? "") +
              (message.body ?? "") +
              message.media?.filename +
              message.sid
            }
          >
            {lastReadIndex !== -1 &&
            horizonAmount &&
            showHorizonIndex === message.index ? (
              <Horizon ref={myRef} amount={horizonAmount} />
            ) : null}
            <MessageView
              reactions={attributes["reactions"]}
              message={
                message.body ||
                (message.media ? (
                  <MessageFile
                    key={message.sid}
                    media={message.media}
                    type="view"
                    onDownload={() => onDownloadAttachment(message)}
                    isImage={isImage}
                    file={fileBlob}
                    sending={message.index === -1}
                    loading={fileLoading[message.sid]}
                    onOpen={
                      isImage && fileBlob
                        ? () =>
                            setImagePreview({
                              message,
                              file: fileBlob,
                            })
                        : () =>
                            message.media &&
                            onFileOpen(
                              conversationAttachments?.[message.sid],
                              message.media
                            )
                    }
                  />
                ) : (
                  ""
                ))
              }
              author={message.author ?? ""}
              getStatus={getMessageStatus(
                props.conversation,
                message,
                props.participants
              )}
              onDeleteMessage={async () => {
                try {
                  await message.remove();
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
                message.updateAttributes({
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
                onDownload={() =>
                  saveAs(
                    imagePreview.file,
                    imagePreview.message.media?.filename ?? ""
                  )
                }
              />
            );
          })()
        : null}
    </>
  );
};

export default MessageList;
