import { JSONValue, Participant, ParticipantType } from "@twilio/conversations";
import { participantsMap } from "../../conversations-objects";

import { ActionType } from "../action-types";
import { Action } from "../actions";

export type ReduxParticipant = {
  sid: string;
  attributes: JSONValue;
  identity: string | null;
  type: ParticipantType;
  lastReadMessageIndex: number | null;
};

export type ParticipantsType = Record<string, ReduxParticipant[]>;

const initialState: ParticipantsType = {};

const reduxifyParticipant = (participant: Participant): ReduxParticipant => ({
  sid: participant.sid,
  attributes: participant.attributes,
  identity: participant.identity,
  type: participant.type,
  lastReadMessageIndex: participant.lastReadMessageIndex,
});

const reducer = (
  state: ParticipantsType = initialState,
  action: Action
): ParticipantsType => {
  switch (action.type) {
    case ActionType.UPDATE_PARTICIPANTS:
      const { participants, sid } = action.payload;

      for (const participant of participants) {
        participantsMap.set(sid, participant);
      }

      return Object.assign({}, state, {
        [sid]: participants.map(reduxifyParticipant),
      });
    default:
      return state;
  }
};

export default reducer;
