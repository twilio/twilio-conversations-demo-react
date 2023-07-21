import { JSONValue, User } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { Action } from "../actions";
import {participantsMap} from "../../conversations-objects";
import {ParticipantsType} from "./participantsReducer";

export type ReduxUser = {
    identity: string;
    friendlyName: string;
};

const initialState = {};

const reduxifyUser = (user: User): ReduxUser => ({
    identity: user.identity,
    friendlyName: user.attributes
});

const reducer = (
    user: User = initialState,
    action: Action
): ReduxUser => {
    switch (action.type) {
        case ActionType.UPDATE_PARTICIPANTS:
            const { participants, sid } = action.payload;

            for (const participant of participants) {
                participantsMap.set(participant.sid, participant);
            }

            return Object.assign({}, state, {
                [sid]: participants.map(reduxifyParticipant),
            });
        default:
            return state;
    }
};

export default reducer;



