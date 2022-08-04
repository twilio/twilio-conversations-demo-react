import { Conversation } from "@twilio/conversations";
import { ReduxConversation } from "./store/reducers/convoReducer";

export const ConversationsMap = new Map<string, Conversation>();

export const getSdkConversationObject = (
  reduxConversation: ReduxConversation
): Conversation => {
  const sdkConversation = ConversationsMap.get(reduxConversation.sid);

  if (!sdkConversation) {
    throw new Error(
      `Conversation with sid ${reduxConversation.sid} was not found.`
    );
  }

  return sdkConversation;
};
