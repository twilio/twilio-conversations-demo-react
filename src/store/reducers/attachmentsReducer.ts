import { ActionType } from "../action-types";
import { Action } from "../actions";

const initialState = {};
export type AttachmentsState = {
  [p: string]: { [p: string]: Record<string, Blob> };
};

const reducer = (
  state: AttachmentsState = initialState,
  action: Action
): { [p: string]: { [p: string]: Record<string, Blob> } } => {
  switch (action.type) {
    case ActionType.ADD_ATTACHMENT: {
      const { channelSid, messageSid, mediaSid, attachment } = action.payload;
      state[channelSid] = state[channelSid] ?? {};
      state[channelSid][messageSid] = state[channelSid][messageSid] ?? {};

      return {
        ...state,
        [channelSid]: {
          ...(state[channelSid] || {}),
          [messageSid]: Object.assign(state[channelSid][messageSid], {
            [mediaSid]: attachment,
          }),
        },
      };
    }

    case ActionType.CLEAR_ATTACHMENTS: {
      const { channelSid, messageSid } = action.payload;

      return {
        ...state,
        [channelSid]: {
          ...(state[channelSid] || {}),
          [messageSid]: {},
        },
      };
    }
    default:
      return state;
  }
};

export default reducer;
