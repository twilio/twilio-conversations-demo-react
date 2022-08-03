import { Dispatch } from "redux";

import { Conversation, Message, Participant } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { Action } from "../actions";
import { NotificationsType } from "../reducers/notificationsReducer";
import { ReduxMessage } from "../reducers/messageListReducer";

export const login = (token: string) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.LOGIN,
      payload: token,
    });
  };
};

export const logout = () => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.LOGOUT,
    });
  };
};

export const addConversation = (convo: Conversation) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.ADD_CONVERSATION,
      payload: convo,
    });
  };
};

export const removeConversation = (sid: string) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.REMOVE_CONVERSATION,
      payload: sid,
    });
  };
};

export const updateCurrentConversation = (sid: string) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.UPDATE_CURRENT_CONVERSATION,
      payload: sid,
    });
  };
};

export const setLastReadIndex = (index: number) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.CONVERSATION_LAST_READ_INDEX,
      payload: index,
    });
  };
};

export const addMessages = (
  channelSid: string,
  messages: (Message | ReduxMessage)[]
) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.ADD_MESSAGES,
      payload: { channelSid, messages },
    });
  };
};

export const pushMessages = (channelSid: string, messages: Message[]) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.PUSH_MESSAGES,
      payload: { channelSid, messages },
    });
  };
};

export const removeMessages = (channelSid: string, messages: Message[]) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.REMOVE_MESSAGES,
      payload: { channelSid, messages },
    });
  };
};

export const updateLoadingState = (loadingStatus: boolean) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.UPDATE_LOADING_STATE,
      payload: loadingStatus,
    });
  };
};

export const updateParticipants = (
  participants: Participant[],
  sid: string
) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.UPDATE_PARTICIPANTS,
      payload: { participants, sid },
    });
  };
};

export const updateUnreadMessages = (
  channelSid: string,
  unreadCount: number
) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.UPDATE_UNREAD_MESSAGES,
      payload: { channelSid, unreadCount },
    });
  };
};

export const updateConversation = (
  channelSid: string,
  parameters: Partial<Conversation>
) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.UPDATE_CONVERSATION,
      payload: { channelSid, parameters },
    });
  };
};

export const addAttachment = (
  channelSid: string,
  messageSid: string,
  mediaSid: string,
  attachment: Blob
) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.ADD_ATTACHMENT,
      payload: { channelSid, messageSid, mediaSid, attachment },
    });
  };
};

export const clearAttachments = (channelSid: string, messageSid: string) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.CLEAR_ATTACHMENTS,
      payload: { channelSid, messageSid },
    });
  };
};

export const startTyping = (channelSid: string, participant: string) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.TYPING_STARTED,
      payload: { channelSid, participant },
    });
  };
};

export const endTyping = (channelSid: string, participant: string) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.TYPING_ENDED,
      payload: { channelSid, participant },
    });
  };
};

export const addNotifications = (notifications: NotificationsType) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.ADD_NOTIFICATIONS,
      payload: notifications,
    });
  };
};

export const removeNotifications = (toIndex: number) => {
  return (dispatch: Dispatch<Action>): void => {
    dispatch({
      type: ActionType.REMOVE_NOTIFICATIONS,
      payload: toIndex,
    });
  };
};
