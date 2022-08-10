import { DeliveryAmount, JSONValue, Message } from "@twilio/conversations";
import { mediaMap, messagesMap } from "../../conversations-objects";
import { ActionType } from "../action-types";
import { Action } from "../actions";

export enum MessageStatus {
  Sending = "Sending",
  Sent = "Sent",
  Delivered = "Delivered",
  Failed = "Failed",
  None = "none (incoming)",
  Read = "Read",
}

export type ReduxMedia = {
  sid: string;
  filename: string | null;
  contentType: string;
  size: number;
  category: "media" | "body" | "history";
};

export type ReduxMessage = {
  sid: string;
  index: number;
  body: string | null;
  author: string | null;
  attributes: JSONValue;
  participantSid: string | null;
  dateCreated: Date | null;
  media?: ReduxMedia;
  aggregatedDeliveryReceipt: {
    total: number;
    sent: DeliveryAmount;
    delivered: DeliveryAmount;
    read: DeliveryAmount;
    undelivered: DeliveryAmount;
    failed: DeliveryAmount;
  } | null;
};

export type ChatMessagesState = Record<string, ReduxMessage[]>;

const initialState: ChatMessagesState = {};

const reduxifyMessage = (message: Message | ReduxMessage): ReduxMessage => ({
  sid: message.sid,
  index: message.index,
  body: message.body,
  author: message.author,
  participantSid: message.participantSid,
  attributes: message.attributes,
  dateCreated: message.dateCreated,
  aggregatedDeliveryReceipt: message.aggregatedDeliveryReceipt
    ? {
        total: message.aggregatedDeliveryReceipt.total,
        sent: message.aggregatedDeliveryReceipt.sent,
        delivered: message.aggregatedDeliveryReceipt.delivered,
        read: message.aggregatedDeliveryReceipt.read,
        undelivered: message.aggregatedDeliveryReceipt.undelivered,
        failed: message.aggregatedDeliveryReceipt.failed,
      }
    : null,
  ...(message.media
    ? {
        media: {
          sid: message.media.sid,
          filename: message.media.filename,
          contentType: message.media.contentType,
          size: message.media.size,
          category: message.media.category,
        },
      }
    : {}),
});

const reducer = (state = initialState, action: Action): ChatMessagesState => {
  switch (action.type) {
    case ActionType.PUSH_MESSAGES: {
      const { channelSid, messages: messagesToAdd } = action.payload;
      const existingMessages = state[channelSid] ?? [];

      for (const message of messagesToAdd) {
        messagesMap.set(message.sid, message);
        if (message.media) {
          mediaMap.set(message.media.sid, message.media);
        }
      }

      return Object.assign({}, state, {
        [channelSid]: existingMessages.concat(
          messagesToAdd.map(reduxifyMessage)
        ),
      }) as ChatMessagesState;
    }
    case ActionType.ADD_MESSAGES: {
      //get convo sid and messages to add from payload
      const { channelSid, messages: messagesToAdd } = action.payload;

      //get existing messages for the convo
      const existingMessages = state[channelSid] ?? [];

      const filteredExistingMessages = existingMessages.filter(
        (message: ReduxMessage) => {
          return !messagesToAdd.find(
            (value) =>
              value.body === message.body &&
              value.author === message.author &&
              value.media?.filename === message.media?.filename &&
              value.media?.size === message.media?.size &&
              (message.index === -1 || value.index === message.index)
          );
        }
      );

      //add new messages to exisiting, ignore duplicates
      const messagesUnique = [
        ...filteredExistingMessages,
        ...messagesToAdd.map(reduxifyMessage),
      ];

      for (const message of messagesToAdd) {
        if (message instanceof Message) {
          messagesMap.set(message.sid, message);
          if (message.media) {
            mediaMap.set(message.media.sid, message.media);
          }
        }
      }

      const sortedMessages = messagesUnique.sort((a, b) => {
        return a.index - b.index;
      });

      //overwrite the channelSid messages
      return Object.assign({}, state, {
        [channelSid]: sortedMessages,
      }) as ChatMessagesState;
    }
    case ActionType.REMOVE_MESSAGES: {
      const { channelSid, messages: messagesToRemove } = action.payload;
      const existingMessages = state[channelSid] ?? [];
      const messages = existingMessages.filter(
        ({ index }) =>
          !messagesToRemove.find(
            ({ index: messageIndex }) => messageIndex === index
          )
      );

      for (const message of messagesToRemove) {
        messagesMap.delete(message.sid);
        if (message.media) {
          mediaMap.delete(message.media.sid);
        }
      }

      return Object.assign({}, state, {
        [channelSid]: messages,
      }) as ChatMessagesState;
    }
    default:
      return state;
  }
};

export default reducer;
