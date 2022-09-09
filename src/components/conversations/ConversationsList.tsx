import { bindActionCreators } from "redux";
import { useDispatch, useSelector } from "react-redux";
import ConversationView from "./ConversationView";
import {
  SetParticipantsType,
  SetSidType,
  SetUnreadMessagesType,
} from "../../types";
import { actionCreators, AppState } from "../../store";
import { getTypingMessage, unexpectedErrorNotification } from "../../helpers";
import { UNEXPECTED_ERROR_MESSAGE } from "../../constants";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { getSdkConversationObject } from "../../conversations-objects";
import { ReduxMessage } from "../../store/reducers/messageListReducer";

function getLastMessage(messages: ReduxMessage[], typingData: string[]) {
  if (messages === undefined || messages === null) {
    return "Loading...";
  }
  if (typingData.length) {
    return getTypingMessage(typingData);
  }
  if (messages.length === 0) {
    return "No messages";
  }
  return messages[messages.length - 1].body || "Media message";
}

function isMyMessage(messages: ReduxMessage[]) {
  if (messages === undefined || messages === null || messages.length === 0) {
    return false;
  }
  return messages[messages.length - 1].author ===
    localStorage.getItem("username")
    ? messages[messages.length - 1]
    : false;
}

async function updateCurrentConvo(
  setSid: SetSidType,
  convo: ReduxConversation,
  updateParticipants: SetParticipantsType
) {
  setSid(convo.sid);

  try {
    const participants = await getSdkConversationObject(
      convo
    ).getParticipants();
    updateParticipants(participants, convo.sid);
  } catch {
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
  }
}

function setUnreadMessagesCount(
  currentconvoSid: string,
  convoSid: string,
  unreadMessages: Record<string, number>,
  updateUnreadMessages: SetUnreadMessagesType
) {
  if (currentconvoSid == convoSid && unreadMessages[convoSid] !== 0) {
    updateUnreadMessages(convoSid, 0);
    return 0;
  }
  if (currentconvoSid == convoSid) {
    return 0;
  }
  return unreadMessages[convoSid];
}

const ConversationsList: React.FC = () => {
  const sid = useSelector((state: AppState) => state.sid);
  const conversations = useSelector((state: AppState) => state.convos);
  const messages = useSelector((state: AppState) => state.messages);
  const unreadMessages = useSelector((state: AppState) => state.unreadMessages);
  const participants = useSelector((state: AppState) => state.participants);
  const typingData = useSelector((state: AppState) => state.typingData);

  const dispatch = useDispatch();
  const {
    updateCurrentConversation,
    updateParticipants,
    updateUnreadMessages,
    setLastReadIndex,
    addNotifications,
  } = bindActionCreators(actionCreators, dispatch);

  if (conversations === undefined || conversations === null) {
    return <div className="empty" />;
  }

  return (
    <div id="conversation-list">
      {conversations.map((convo) => (
        <ConversationView
          key={convo.sid}
          convoId={convo.sid}
          setSid={updateCurrentConversation}
          currentConvoSid={sid}
          lastMessage={
            getLastMessage(messages[convo.sid], typingData[convo.sid] ?? []) ??
            ""
          }
          messages={messages[convo.sid]}
          typingInfo={typingData[convo.sid] ?? []}
          myMessage={isMyMessage(messages[convo.sid])}
          unreadMessagesCount={setUnreadMessagesCount(
            sid,
            convo.sid,
            unreadMessages,
            updateUnreadMessages
          )}
          updateUnreadMessages={updateUnreadMessages}
          participants={participants[convo.sid] ?? []}
          convo={convo}
          onClick={async () => {
            try {
              setLastReadIndex(convo.lastReadMessageIndex ?? -1);
              await updateCurrentConvo(
                updateCurrentConversation,
                convo,
                updateParticipants
              );
              //update unread messages
              updateUnreadMessages(convo.sid, 0);
              //set messages to be read
              const lastMessage =
                messages[convo.sid].length &&
                messages[convo.sid][messages[convo.sid].length - 1];
              if (lastMessage && lastMessage.index !== -1) {
                await getSdkConversationObject(
                  convo
                ).updateLastReadMessageIndex(lastMessage.index);
              }
            } catch {
              unexpectedErrorNotification(addNotifications);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ConversationsList;
