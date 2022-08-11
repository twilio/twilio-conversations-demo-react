import {
  Conversation,
  Media,
  Message,
  Participant,
} from "@twilio/conversations";
import { ReduxConversation } from "./store/reducers/convoReducer";
import { ReduxMedia, ReduxMessage } from "./store/reducers/messageListReducer";
import { ReduxParticipant } from "./store/reducers/participantsReducer";

export const conversationsMap = new Map<string, Conversation>();
export const messagesMap = new Map<string, Message>();
export const mediaMap = new Map<string, Media>();
export const participantsMap = new Map<string, Participant>();

const capitalize = (string: string): string =>
  `${string[0].toUpperCase()}${string.substring(1)}`;

const getSdkObject = <T>(
  objectMap: Map<string, T>,
  sid: string,
  type: "conversation" | "message" | "media" | "participant"
): T => {
  const sdkObject = objectMap.get(sid);

  if (!sdkObject) {
    throw new Error(`${capitalize(type)} with SID ${sid} was not found.`);
  }

  return sdkObject;
};

export const getSdkConversationObject = (
  reduxConversation: ReduxConversation
): Conversation =>
  getSdkObject(conversationsMap, reduxConversation.sid, "conversation");

export const getSdkMessageObject = (reduxMessage: ReduxMessage): Message =>
  getSdkObject(messagesMap, reduxMessage.sid, "message");

export const getSdkMediaObject = (reduxMedia: ReduxMedia): Media =>
  getSdkObject(mediaMap, reduxMedia.sid, "media");

export const getSdkParticipantObject = (
  reduxParticipany: ReduxParticipant
): Participant =>
  getSdkObject(participantsMap, reduxParticipany.sid, "participant");
