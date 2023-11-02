import { ActionType } from "../action-types";
import { Action } from "../actions";

const reducer = (state = false, action: Action): boolean => {
  console.log("action", action);
  switch (action.type) {
    case ActionType.UPDATE_TIME_FORMAT: {
      console.log("action.payload", action.payload);
      return action.payload;
    }
    default:
      return state;
  }
};

export default reducer;
