import { conversationsMap } from "../../conversations-objects";
import { ActionType } from "../action-types";
import { Action } from "../actions";

export type ReduxConversation = {
  sid: string;
  friendlyName: string | null;
  dateUpdated: Date | null;
  notificationLevel: "default" | "muted";
  lastReadMessageIndex: number | null;
  lastMessage?: {
    index?: number;
    dateCreated?: Date;
  };
};

const initialState: ReduxConversation[] = [];

const convoSorter = (a: ReduxConversation, b: ReduxConversation) =>
  (b.lastMessage?.dateCreated?.getTime() ?? b.dateUpdated?.getTime() ?? 0) -
  (a.lastMessage?.dateCreated?.getTime() ?? a.dateUpdated?.getTime() ?? 0);

const reducer = (
  state: ReduxConversation[] = initialState,
  action: Action
): ReduxConversation[] => {
  switch (action.type) {
    case ActionType.ADD_CONVERSATION:
      const {
        sid,
        friendlyName,
        dateUpdated,
        notificationLevel,
        lastReadMessageIndex,
        lastMessage,
      } = action.payload;
      const filteredClone = state.filter(
        (conversation) => conversation.sid !== action.payload.sid
      );

      conversationsMap.set(action.payload.sid, action.payload);

      return [
        ...filteredClone,
        {
          sid,
          friendlyName,
          dateUpdated,
          notificationLevel,
          lastReadMessageIndex,
          lastMessage: {
            ...lastMessage,
          },
        },
      ].sort(convoSorter);
    case ActionType.UPDATE_CONVERSATION: {
      const stateCopy = [...state];
      const target = stateCopy.find(
        (convo: ReduxConversation) => convo.sid === action.payload.channelSid
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

      conversationsMap.delete(action.payload);

      return stateCopy.filter(
        (convo: ReduxConversation) => convo.sid !== action.payload
      );
    }
    default:
      return state;
  }
};

export default reducer;
