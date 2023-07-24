import {
  Conversation,
  Media,
  Message,
  Participant,
  User,
} from "@twilio/conversations";
import { ReduxConversation } from "./store/reducers/convoReducer";
import { ReduxMedia, ReduxMessage } from "./store/reducers/messageListReducer";
import { ReduxParticipant } from "./store/reducers/participantsReducer";
import { ReduxUser } from "./store/reducers/userReducer";

export const conversationsMap = new Map<string, Conversation>();
export const messagesMap = new Map<string, Message>();
export const usersMap = new Map<string, User>();
export const mediaMap = new Map<string, Media>();
export const participantsMap = new Map<string, Participant>();

const capitalize = (string: string): string =>
  `${string[0].toUpperCase()}${string.substring(1)}`;

const getSdkObject = <T>(
  objectMap: Map<string, T>,
  sid: string,
  type: "conversation" | "message" | "media" | "participant" | "user"
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

export const getSdkUserObject = (reduxUser: ReduxUser): User =>
  getSdkObject(usersMap, reduxUser.identity, "user");

export const getSdkMediaObject = (reduxMedia: ReduxMedia): Media =>
  getSdkObject(mediaMap, reduxMedia.sid, "media");

export const getSdkParticipantObject = (
  reduxParticipant: ReduxParticipant
): Participant =>
  getSdkObject(participantsMap, reduxParticipant.sid, "participant");
