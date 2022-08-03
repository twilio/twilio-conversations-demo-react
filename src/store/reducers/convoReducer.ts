import { Conversation } from "@twilio/conversations";
import { ActionType } from "../action-types";
import { Action } from "../actions";

const initialState: Conversation[] = [];

const convoSorter = (a: Conversation, b: Conversation) =>
  (b.lastMessage?.dateCreated?.getTime() ?? b.dateUpdated?.getTime() ?? 0) -
  (a.lastMessage?.dateCreated?.getTime() ?? a.dateUpdated?.getTime() ?? 0);

const reducer = (
  state: Conversation[] = initialState,
  action: Action
): Conversation[] => {
  switch (action.type) {
    case ActionType.ADD_CONVERSATION:
      const filteredClone = state.filter(
        (conversation) => conversation.sid !== action.payload.sid
      );
      return [...filteredClone, action.payload].sort(convoSorter);
    case ActionType.UPDATE_CONVERSATION: {
      const stateCopy = [...state];
      const target = stateCopy.find(
        (convo: Conversation) => convo.sid === action.payload.channelSid
      );

      if (target) {
        Object.assign(target, {
          ...action.payload.parameters,
        });
      }

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
