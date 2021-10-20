import { Action, combineReducers } from "redux";
import { Conversation } from "@twilio/conversations/lib/conversation";

import tokenReducer from "./tokenReducer";
import convoReducer from "./convoReducer";
import sidReducer from "./currentConvoReducer";
import messageReducer, { ChatMessagesState } from "./messageListReducer";
import loadingReducer from "./loadingReducer";
import participantReducer, { ParticipantsType } from "./participantsReducer";
import unreadMessagesReducer, {
  UnreadMessagesState,
} from "./unreadMessagesReducer";
import attachmentsReducer, { AttachmentsState } from "./attachmentsReducer";
import { ActionType } from "../action-types";
import typingDataReducer, { TypingDataState } from "./typingDataReducer";
import lastReadIndexReducer from "./lastReadIndexReducer";

export type AppState = {
  token: string;
  convos: Conversation[];
  sid: string;
  messages: ChatMessagesState;
  unreadMessages: UnreadMessagesState;
  loadingStatus: boolean;
  participants: ParticipantsType;
  attachments: AttachmentsState;
  typingData: TypingDataState;
  lastReadIndex: number;
};

export const initialState = {
  token: "",
  sid: "",
  messages: {},
  attachments: {},
  participants: {},
  convos: [],
  unreadMessages: {},
  loadingStatus: true,
  typingData: {},
  lastReadIndex: -1,
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
  unreadMessages: unreadMessagesReducer,
  attachments: attachmentsReducer,
  typingData: typingDataReducer,
});

export default reducers;
