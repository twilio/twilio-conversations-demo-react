import { Conversation, Media, Message } from "@twilio/conversations";
import { ReduxConversation } from "./store/reducers/convoReducer";
import { ReduxMedia, ReduxMessage } from "./store/reducers/messageListReducer";

export const conversationsMap = new Map<string, Conversation>();
export const messagesMap = new Map<string, Message>();
export const mediaMap = new Map<string, Media>();

export const getSdkConversationObject = (
  reduxConversation: ReduxConversation
): Conversation => {
  const sdkConversation = conversationsMap.get(reduxConversation.sid);

  if (!sdkConversation) {
    throw new Error(
      `Conversation with SID ${reduxConversation.sid} was not found.`
    );
  }

  return sdkConversation;
};

export const getSdkMessageObject = (reduxMessage: ReduxMessage): Message => {
  const sdkMessage = messagesMap.get(reduxMessage.sid);

  if (!sdkMessage) {
    throw new Error(`Message with SID ${reduxMessage.sid} was not found.`);
  }

  return sdkMessage;
};

export const getSdkMediaObject = (reduxMedia: ReduxMedia): Media => {
  const sdkMedia = mediaMap.get(reduxMedia.sid);

  if (!sdkMedia) {
    throw new Error(`Media with SID ${reduxMedia.sid} was not found.`);
  }

  return sdkMedia;
};
