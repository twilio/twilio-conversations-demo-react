import { uniq } from "lodash";
import { ActionType } from "../action-types";
import { Action } from "../actions";

export type TypingDataState = Record<string, string[]>;

const initialState: TypingDataState = {};

const reducer = (state = initialState, action: Action): TypingDataState => {
  switch (action.type) {
    case ActionType.TYPING_STARTED: {
      const { channelSid, participant } = action.payload;
      const existedUsers = state[channelSid] ?? [];
      existedUsers.push(participant);
      return Object.assign({}, state, { [channelSid]: uniq(existedUsers) });
    }
    case ActionType.TYPING_ENDED: {
      const { channelSid, participant } = action.payload;
      const filteredUsers = (state[channelSid] ?? []).filter(
        (user) => user !== participant
      );
      return Object.assign({}, state, { [channelSid]: filteredUsers });
    }
    default:
      return state;
  }
};

export default reducer;
