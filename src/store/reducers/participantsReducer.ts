import { Participant } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { Action } from "../actions";

export type ParticipantsType = Record<string, Participant[]>;
const initialState: ParticipantsType = {};

const reducer = (
  state: ParticipantsType = initialState,
  action: Action
): ParticipantsType => {
  switch (action.type) {
    case ActionType.UPDATE_PARTICIPANTS:
      const { participants, sid } = action.payload;
      return Object.assign({}, state, { [sid]: participants });
    default:
      return state;
  }
};

export default reducer;
