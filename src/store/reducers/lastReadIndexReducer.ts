import { ActionType } from "../action-types";
import { Action } from "../actions";

const initialState = -1;

const reducer = (state: number = initialState, action: Action): number => {
  switch (action.type) {
    case ActionType.CONVERSATION_LAST_READ_INDEX:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
