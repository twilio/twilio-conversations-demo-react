import { ActionType } from "../action-types";
import { Action } from "../actions";

const initialState = "";

const reducer = (state: string = initialState, action: Action): string => {
  switch (action.type) {
    case ActionType.UPDATE_LOCAL:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
