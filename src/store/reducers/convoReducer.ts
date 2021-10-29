import { Conversation } from "@twilio/conversations";
import { ActionType } from "../action-types";
import { Action } from "../actions";

const initialState: Conversation[] = [];

const reducer = (
  state: Conversation[] = initialState,
  action: Action
): Conversation[] => {
  switch (action.type) {
    case ActionType.LIST_CONVERSATIONS:
      return action.payload.sort((a, b) => {
        return (
          (b.lastMessage?.dateCreated || b.dateUpdated) -
          (a.lastMessage?.dateCreated || a.dateUpdated)
        );
      });
    case ActionType.UPDATE_CONVERSATION: {
      const stateCopy = [...state];
      let target = stateCopy.find(
        (convo: Conversation) => convo.sid === action.payload.channelSid
      );

      target =
        target &&
        ({
          ...target,
          ...action.payload.parameters,
        } as Conversation);

      return stateCopy;
    }
    case ActionType.REMOVE_CONVERSATION: {
      const stateCopy = [...state];

      return stateCopy.filter(
        (convo: Conversation) => convo.sid !== action.payload
      );
    }
    default:
      return state;
  }
};

export default reducer;
