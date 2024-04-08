import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { saveAs } from "file-saver";

import { ChatLog } from "@twilio-paste/core";
import { CustomizationProvider } from "@twilio-paste/core/customization";

import { getBlobFile } from "../../api";
import { actionCreators, AppState } from "../../store";
import ImagePreviewModal from "../modals/ImagePreviewModal";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import {
  ReduxMedia,
  ReduxMessage,
} from "../../store/reducers/messageListReducer";
import {
  getSdkMediaObject,
  getSdkParticipantObject,
} from "../../conversations-objects";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import { getFirstMessagePerDate } from "./../../utils/timestampUtils";
import { useDropzone } from "react-dropzone";
import { MAX_FILE_SIZE } from "../../constants";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: ReduxMessage[];
  conversation: ReduxConversation;
  participants: ReduxParticipant[];
  lastReadIndex: number;
  use24hTimeFormat: boolean;
  handleDroppedFiles: (droppedFiles: File[]) => void;
}

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
          return (
            <MessageItem
              key={message.sid}
              message={message}
              conversationAttachments={conversationAttachments}
              onDownloadAttachments={onDownloadAttachments}
              onFileOpen={onFileOpen}
              setImagePreview={setImagePreview}
              getAuthorFriendlyName={getAuthorFriendlyName}
              participants={props.participants}
              use24hTimeFormat={use24hTimeFormat}
              firstMessagePerDay={firstMessagePerDay}
              addNotifications={addNotifications}
            />
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
