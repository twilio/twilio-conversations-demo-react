import { User } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { Action } from "../actions";
import { usersMap } from "../../conversations-objects";

export type ReduxUser = {
  identity: string;
  friendlyName: string;
};

export type UsersState = {
  [identity: string]: ReduxUser;
};

const initialState: UsersState = {};

const reduxifyUser = (user: User): ReduxUser => ({
  identity: user.identity,
  friendlyName: user.friendlyName ?? "",
});

const reducer = (
  state: UsersState = initialState,
  action: Action
): UsersState => {
  switch (action.type) {
    case ActionType.UPDATE_USER:
      const user = action.payload;
      usersMap.set(user.identity, user);

      return {
        ...state,
        [user.identity]: reduxifyUser(user),
      };
    default:
      return state;
  }
};

export default reducer;
