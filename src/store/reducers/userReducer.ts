import { User } from "@twilio/conversations";

import { ActionType } from "../action-types";
import { Action } from "../actions";
import {participantsMap, usersMap} from "../../conversations-objects";

export type ReduxUser = {
    identity: string;
    friendlyName: string;
};

export type ReduxUserType = Record<string, ReduxUser>;

const initialState: ReduxUserType = {}

const reduxifyUser = (user: User): ReduxUser => ({
    identity: user.identity,
    friendlyName: user.friendlyName ?? ""
});

const reducer = (
    state: ReduxUserType = initialState,
    action: Action
): ReduxUserType => {
    switch (action.type) {
        case ActionType.UPDATE_USER:
            const user = action.payload;
            usersMap.set(user.identity, user);
            return Object.assign({}, state, {
                [user.identity]: reduxifyUser(user),
            });
        default:
            return state;
    }
};

export default reducer;



