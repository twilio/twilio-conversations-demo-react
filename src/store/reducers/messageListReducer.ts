import { Message } from "@twilio/conversations";

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

export type ChatMessagesState = Record<string, Message[]>;

const initialState: ChatMessagesState = {};

const reducer = (state = initialState, action: Action): ChatMessagesState => {
  switch (action.type) {
    case ActionType.PUSH_MESSAGES: {
      const { channelSid, messages: messagesToAdd } = action.payload;
      const existingMessages = state[channelSid] ?? [];

      return Object.assign({}, state, {
        [channelSid]: existingMessages.concat(messagesToAdd),
      }) as ChatMessagesState;
    }
    case ActionType.ADD_MESSAGES: {
      //get convo sid and messages to add from payload
      const { channelSid, messages: messagesToAdd } = action.payload;

      //get existing messages for the convo
      const existingMessages = state[channelSid] ?? [];

      const filteredExistingMessages = existingMessages.filter(
        (message: Message) => {
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
      const messagesUnique = [...filteredExistingMessages, ...messagesToAdd];

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

      return Object.assign({}, state, {
        [channelSid]: messages,
      }) as ChatMessagesState;
    }
    default:
      return state;
  }
};

export default reducer;
