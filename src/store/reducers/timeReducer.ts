import { ActionType } from "../action-types";
import { Action } from "../actions";

const reducer = (state = false, action: Action): boolean => {
  switch (action.type) {
    case ActionType.UPDATE_TIME_FORMAT: {
      return action.payload;
    }
    default:
      return state;
  }
};

export default reducer;
