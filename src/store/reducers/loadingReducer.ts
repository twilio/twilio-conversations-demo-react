import { ActionType } from "../action-types";
import { Action } from "../actions";

const reducer = (state = true, action: Action): boolean => {
  switch (action.type) {
    case ActionType.UPDATE_LOADING_STATE:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
