import { Conversation, Message, Participant } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { ReduxConversation } from "../reducers/convoReducer";
import { ReduxMessage } from "../reducers/messageListReducer";
import { NotificationsType } from "../reducers/notificationsReducer";

interface LoginAction {
  type: ActionType.LOGIN;
  payload: string;
}

interface LogOutAction {
  type: ActionType.LOGOUT;
}

interface AddConversation {
  type: ActionType.ADD_CONVERSATION;
  payload: Conversation;
}

interface RemoveConversation {
  type: ActionType.REMOVE_CONVERSATION;
  payload: string;
}

interface UpdateCurrentConversation {
  type: ActionType.UPDATE_CURRENT_CONVERSATION;
  payload: string;
}

interface SetLastReadIndex {
  type: ActionType.CONVERSATION_LAST_READ_INDEX;
  payload: number;
}

interface AddMessages {
  type: ActionType.ADD_MESSAGES;
  payload: { channelSid: string; messages: (Message | ReduxMessage)[] };
}

interface PushMessages {
  type: ActionType.PUSH_MESSAGES;
  payload: { channelSid: string; messages: Message[] };
}

interface RemoveMessages {
  type: ActionType.REMOVE_MESSAGES;
  payload: { channelSid: string; messages: Message[] };
}

interface UpdateLoadingState {
  type: ActionType.UPDATE_LOADING_STATE;
  payload: boolean;
}

interface UpdateParticipants {
  type: ActionType.UPDATE_PARTICIPANTS;
  payload: { participants: Participant[]; sid: string };
}

interface UpdateUnreadMessages {
  type: ActionType.UPDATE_UNREAD_MESSAGES;
  payload: { channelSid: string; unreadCount: number };
}

interface UpdateConversation {
  type: ActionType.UPDATE_CONVERSATION;
  payload: { channelSid: string; parameters: Partial<ReduxConversation> };
}

interface AddAttachment {
  type: ActionType.ADD_ATTACHMENT;
  payload: {
    channelSid: string;
    messageSid: string;
    mediaSid: string;
    attachment: Blob;
  };
}

interface ClearAttachments {
  type: ActionType.CLEAR_ATTACHMENTS;
  payload: {
    channelSid: string;
    messageSid: string;
  };
}

interface TypingStarted {
  type: ActionType.TYPING_STARTED;
  payload: { channelSid: string; participant: string };
}

interface TypingEnded {
  type: ActionType.TYPING_ENDED;
  payload: { channelSid: string; participant: string };
}

interface AddNotifications {
  type: ActionType.ADD_NOTIFICATIONS;
  payload: NotificationsType;
}

interface RemoveNotifications {
  type: ActionType.REMOVE_NOTIFICATIONS;
  payload: number;
}

export type Action =
  | LoginAction
  | LogOutAction
  | AddConversation
  | RemoveConversation
  | UpdateCurrentConversation
  | SetLastReadIndex
  | AddMessages
  | PushMessages
  | RemoveMessages
  | UpdateLoadingState
  | UpdateParticipants
  | UpdateUnreadMessages
  | UpdateConversation
  | AddAttachment
  | ClearAttachments
  | TypingStarted
  | TypingEnded
  | AddNotifications
  | RemoveNotifications;
