import { ActionType } from "../action-types";
import { Action } from "../actions";

const initialState = {};
export type AttachmentsState = Record<string, Record<string, Blob>>;

const reducer = (
  state: AttachmentsState = initialState,
  action: Action
): Record<string, Record<string, Blob>> => {
  switch (action.type) {
    case ActionType.ADD_ATTACHMENT:
      const { channelSid, messageIndex, attachment } = action.payload;
      return {
        ...state,
        [channelSid]: {
          ...(state[channelSid] || {}),
          [messageIndex]: attachment,
        },
      };
    default:
      return state;
  }
};

export default reducer;
