import { Action, combineReducers } from "redux";

import tokenReducer from "./tokenReducer";
import convoReducer, { ReduxConversation } from "./convoReducer";
import sidReducer from "./currentConvoReducer";
import messageReducer, { ChatMessagesState } from "./messageListReducer";
import loadingReducer from "./loadingReducer";
import participantReducer, { ParticipantsType } from "./participantsReducer";
import userReducer, { UsersState } from "./userReducer";
import unreadMessagesReducer, {
  UnreadMessagesState,
} from "./unreadMessagesReducer";
import attachmentsReducer, { AttachmentsState } from "./attachmentsReducer";
import { ActionType } from "../action-types";
import typingDataReducer, { TypingDataState } from "./typingDataReducer";
import lastReadIndexReducer from "./lastReadIndexReducer";
import notificationsReducer, {
  NotificationsType,
} from "./notificationsReducer";
import timeReducer from "./timeReducer";
import localReducer from "./localReducer";

export type AppState = {
  token: string;
  convos: ReduxConversation[];
  sid: string;
  messages: ChatMessagesState;
  unreadMessages: UnreadMessagesState;
  loadingStatus: boolean;
  participants: ParticipantsType;
  users: UsersState;
  attachments: AttachmentsState;
  typingData: TypingDataState;
  lastReadIndex: number;
  notifications: NotificationsType;
  use24hTimeFormat: boolean;
  local: string;
};

export const initialState = {
  token: "",
  sid: "",
  messages: {},
  attachments: {},
  participants: {},
  users: {},
  convos: [],
  unreadMessages: {},
  loadingStatus: true,
  typingData: {},
  lastReadIndex: -1,
  notifications: [],
  use24hTimeFormat: false,
  local: "",
};

const reducers = (
  state: AppState | undefined,
  action: Action
): ReturnType<typeof appReducer> => {
  if (action.type === ActionType.LOGOUT) {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    return appReducer(initialState, action);
  }

  return appReducer(state, action);
};

const appReducer = combineReducers({
  token: tokenReducer,
  convos: convoReducer,
  sid: sidReducer,
  lastReadIndex: lastReadIndexReducer,
  messages: messageReducer,
  loadingStatus: loadingReducer,
  participants: participantReducer,
  users: userReducer,
  unreadMessages: unreadMessagesReducer,
  attachments: attachmentsReducer,
  typingData: typingDataReducer,
  notifications: notificationsReducer,
  use24hTimeFormat: timeReducer,
  local: localReducer,
});

export default reducers;
