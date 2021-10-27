import { ActionType } from "../action-types";
import { Action } from "../actions";

export type NotificationVariantType =
  | "error"
  | "neutral"
  | "success"
  | "warning";
export type NotificationsType = {
  id?: number;
  message: string;
  variant: NotificationVariantType;
  dismissAfter: number;
}[];

const reducer = (
  state: NotificationsType = [],
  action: Action
): NotificationsType => {
  switch (action.type) {
    case ActionType.ADD_NOTIFICATIONS:
      return [...state, ...action.payload];
    case ActionType.REMOVE_NOTIFICATIONS: {
      const removeCount = action.payload;
      if (removeCount + 1 > state.length) {
        return [];
      }
      return state.slice(removeCount, state.length);
    }
    default:
      return state;
  }
};

export default reducer;
