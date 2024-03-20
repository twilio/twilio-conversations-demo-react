import {
  Badge,
  Box,
  ChatBubble,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  Separator,
} from "@twilio-paste/core";
import {
  ReduxMedia,
  ReduxMessage,
} from "../../store/reducers/messageListReducer";
import React, { ReactNode, useState } from "react";
import MessageEditMode from "./MessageEditMode";
import MessageMedia from "./MessageMedia";
import { CONVERSATION_MESSAGES, MAX_MESSAGE_LINE_WIDTH } from "../../constants";
import wrap from "word-wrap";
import { getSdkMessageObject } from "../../conversations-objects";
import Reactions from "./Reactions";
import MenuMessageButton from "./MenuMessageButton";
import { MessageStatus } from "./MessageStatus";
import { getMessageTime } from "../../utils/timestampUtils";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import {
  successNotification,
  unexpectedErrorNotification,
} from "../../helpers";
import { NotificationsType } from "../../store/reducers/notificationsReducer";
import { ReactionsType } from "../../types";

const today = new Date().toDateString();

interface MessageItemProps {
  message: ReduxMessage;
  conversationAttachments: Record<string, Record<string, Blob>>;
  onDownloadAttachments: (message: ReduxMessage) => Promise<Error | undefined>;
  onFileOpen: (file: Blob, { filename }: ReduxMedia) => void;
  setImagePreview: (imagePreview: {
    message: ReduxMessage;
    file: Blob;
    sid: string;
  }) => void;
  getAuthorFriendlyName: (message: ReduxMessage) => string;
  participants: ReduxParticipant[];
  use24hTimeFormat: boolean;
  firstMessagePerDay: string[];
  addNotifications: (notification: NotificationsType) => void;
}

const MessageItem: React.FC<MessageItemProps> = (props: MessageItemProps) => {
  const {
    message,
    conversationAttachments,
    onDownloadAttachments,
    onFileOpen,
    setImagePreview,
    getAuthorFriendlyName,
    participants,
    use24hTimeFormat,
    firstMessagePerDay,
    addNotifications,
  } = props;
  const [isEditingMessage, setIsEditingMessage] = useState(false);
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

  const isOutbound = message.author === localStorage.getItem("username");

  const MetaItemWithMargin: React.FC<{ children: ReactNode }> = (props) => (
    <ChatMessageMetaItem>
      <div style={{ marginTop: "5px" }}>{props.children}</div>
    </ChatMessageMetaItem>
  );

  const handleDeleteMessage = async (message: ReduxMessage) => {
    try {
      await getSdkMessageObject(message).remove();
      successNotification({
        message: CONVERSATION_MESSAGES.MESSAGE_DELETED,
        addNotifications,
      });
    } catch (e) {
      unexpectedErrorNotification(
        `${CONVERSATION_MESSAGES.MESSAGE_DELETE_FAILED} ${e.message}`,
        addNotifications
      );
    }
  };

  const handleEditMessage = async (
    message: ReduxMessage,
    editedText: string
  ) => {
    try {
      await getSdkMessageObject(message).updateBody(editedText);
      message.body = editedText;
      successNotification({
        message: `${CONVERSATION_MESSAGES.MESSAGE_EDITED}`,
        addNotifications,
      });
      setIsEditingMessage(false);
    } catch (e) {
      unexpectedErrorNotification(
        `${CONVERSATION_MESSAGES.MESSAGE_EDIT_FAILED} ${e.message}`,
        addNotifications
      );
    }
  };

  let metaItems = [
    <ChatMessageMetaItem key={0}>
      <Reactions
        showAddReactionButton={!isOutbound}
        reactions={attributes.reactions}
        onReactionsChanged={(reactions) => {
          getSdkMessageObject(message).updateAttributes({
            ...attributes,
            reactions,
          });
        }}
      />
      {isOutbound && (
        <MenuMessageButton
          menuElements={[
            {
              id: "reactions",
              label: "",
              enabled: true,
              hideOnClick: false,
              customComponent: (handleCloseMenu) => (
                <Reactions
                  callback={handleCloseMenu as () => void}
                  showAsLabel
                  showReactionsCount={false}
                  reactions={attributes.reactions}
                  onReactionsChanged={(reactions) => {
                    getSdkMessageObject(message).updateAttributes({
                      ...attributes,
                      reactions,
                    });
                  }}
                />
              ),
            },
            {
              id: "edit",
              label: "Edit",
              enabled: true,
              onClick: () => {
                setIsEditingMessage(true);
              },
            },
            {
              id: "delete",
              label: "Delete",
              enabled: true,
              onClick: async () => {
                await handleDeleteMessage(message);
              },
            },
          ]}
        />
      )}
    </ChatMessageMetaItem>,
    <MetaItemWithMargin key={1}>
      <MessageStatus message={message} channelParticipants={participants} />
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
    <div>
      {currentDateCreated && firstMessagePerDay.includes(message.sid) && (
        <>
          <Separator orientation="horizontal" verticalSpacing="space50" />
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
        {isEditingMessage ? (
          <MessageEditMode
            message={message}
            cancelEdit={() => setIsEditingMessage(false)}
            editAction={handleEditMessage}
            variant={isOutbound ? "outbound" : "inbound"}
          />
        ) : (
          <ChatBubble>
            {wrappedBody}
            <MessageMedia
              key={message.sid}
              attachments={conversationAttachments?.[message.sid]}
              onDownload={async () => await onDownloadAttachments(message)}
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
                    file: conversationAttachments?.[message.sid][mediaSid],
                    sid: mediaSid,
                  });
                }
              }}
            />
          </ChatBubble>
        )}
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
};

export default MessageItem;
