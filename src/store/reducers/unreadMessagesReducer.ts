import { ActionType } from "../action-types";
import { Action } from "../actions";

export type UnreadMessagesState = Record<string, number>;

const initialState: UnreadMessagesState = {};

const reducer = (state = initialState, action: Action): UnreadMessagesState => {
  switch (action.type) {
    case ActionType.UPDATE_UNREAD_MESSAGES:
      //get convo sid and messages to add from payload
      const { channelSid, unreadCount } = action.payload;
      //overwrite the channelSid unread count
      return Object.assign({}, state, { [channelSid]: unreadCount });
    default:
      return state;
  }
};

export default reducer;
