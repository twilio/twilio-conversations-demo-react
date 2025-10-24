import axios from "axios";
import {
  Client,
  Conversation,
  DeliveryAmount,
  Media,
  Message,
  Paginator,
  Participant,
  User,
} from "@twilio/conversations";

import {
  MessageStatus,
  ReduxMessage,
} from "./store/reducers/messageListReducer";
import {
  CONVERSATION_MESSAGES,
  CONVERSATION_PAGE_SIZE,
  PARTICIPANT_MESSAGES,
  USER_PROFILE_MESSAGES,
} from "./constants";
import { NotificationsType } from "./store/reducers/notificationsReducer";
import { successNotification, unexpectedErrorNotification } from "./helpers";
import { ReduxParticipant } from "./store/reducers/participantsReducer";

type ParticipantResponse = ReturnType<typeof Conversation.prototype.add>;

export async function addConversation(
  name: string,
  updateParticipants: (participants: Participant[], sid: string) => void,
  client?: Client,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<Conversation> {
  if (client === undefined) {
    throw new Error(
      "Client is suddenly undefined, are you sure everything is ok?"
    );
  }

  if (name.length === 0) {
    throw new Error("Conversation name is empty");
  }

  try {
    const conversation = await client.createConversation({
      friendlyName: name,
    });
    await conversation.join();

    const participants = await conversation.getParticipants();
    updateParticipants(participants, conversation.sid);

    successNotification({
      message: CONVERSATION_MESSAGES.CREATED,
      addNotifications,
    });

    return conversation;
  } catch (e) {
    unexpectedErrorNotification(e.message, addNotifications);
    throw e;
  }
}

export async function addChatParticipant(
  name: string,
  convo?: Conversation,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<ParticipantResponse> {
  if (convo === undefined) {
    throw new Error(
      "Conversation is suddenly undefined, are you sure everything is ok?"
    );
  }

  if (name.length === 0) {
    throw new Error("Participant name is empty");
  }

  try {
    const result = await convo.add(name);
    successNotification({
      message: PARTICIPANT_MESSAGES.ADDED,
      addNotifications,
    });
    return result;
  } catch (e) {
    unexpectedErrorNotification(e.message, addNotifications);
    throw e;
  }
}

export async function addNonChatParticipant(
  number: string,
  proxyNumber: string,
  convo?: Conversation,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<ParticipantResponse> {
  if (convo === undefined) {
    throw new Error(
      "Conversation is suddenly undefined, are you sure everything is ok?"
    );
  }

  if (number.length === 0 || proxyNumber.length === 0) {
    throw new Error(
      "Both participant number and proxy number must be specified"
    );
  }

  try {
    const result = await convo.addNonChatParticipant(proxyNumber, number, {
      friendlyName: number,
    });
    successNotification({
      message: PARTICIPANT_MESSAGES.ADDED,
      addNotifications,
    });

    return result;
  } catch (e) {
    unexpectedErrorNotification(e.message, addNotifications);
    throw e;
  }
}

export async function readUserProfile(
  identity: string,
  client?: Client
): Promise<User | undefined> {
  try {
    return await client?.getUser(identity);
  } catch (e) {
    unexpectedErrorNotification(e.message);
    throw e;
  }
}

export async function updateFriendlyName(
  friendlyName: string,
  user?: User
): Promise<User | undefined> {
  try {
    const result = await user?.updateFriendlyName(friendlyName);
    successNotification({
      message: USER_PROFILE_MESSAGES.FRIENDLY_NAME_UPDATED,
    });

    return result;
  } catch (e) {
    unexpectedErrorNotification(e.message);
    throw e;
  }
}

export async function getToken(
  username: string,
  password: string
): Promise<string> {
  const requestAddress = process.env
    .REACT_APP_ACCESS_TOKEN_SERVICE_URL as string;
  if (!requestAddress) {
    throw new Error(
      "REACT_APP_ACCESS_TOKEN_SERVICE_URL is not configured, cannot login"
    );
  }

  try {
    const response = await axios.get(requestAddress, {
      params: { identity: username, password: password },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error(error.response.data ?? "Authentication error.");
    }

    console.error(`ERROR received from ${requestAddress}: ${error}\n`);
    throw new Error(`ERROR received from ${requestAddress}: ${error}\n`);
  }
}

const getChatParticipantStatuses = (
  channelParticipants: ReduxParticipant[],
  message: ReduxMessage
): {
  [MessageStatus.Delivered]?: number;
  [MessageStatus.Read]?: number;
  [MessageStatus.Failed]?: number;
  [MessageStatus.Sending]?: number;
} => {
  const statuses = {
    [MessageStatus.Failed]: 0,
    [MessageStatus.Read]: 0,
    [MessageStatus.Delivered]: 0,
    [MessageStatus.Sending]: 0,
  };

  channelParticipants.forEach((participant) => {
    if (
      participant.identity === localStorage.getItem("username") ||
      participant.type !== "chat"
    ) {
      return;
    }

    if (
      participant.lastReadMessageIndex &&
      participant.lastReadMessageIndex >= message.index
    ) {
      statuses[MessageStatus.Read] += 1;
    } else if (participant.lastReadMessageIndex !== -1) {
      statuses[MessageStatus.Delivered] += 1;
    }
  });

  return statuses;
};

const getAggregatedMessageStatus = (aggregatedDelivery: {
  total: number;
  sent: DeliveryAmount;
  delivered: DeliveryAmount;
  read: DeliveryAmount;
  failed: DeliveryAmount;
}): MessageStatus => {
  if (aggregatedDelivery.failed !== "none") {
    return MessageStatus.Failed;
  }
  if (aggregatedDelivery.read === "all") {
    return MessageStatus.Read;
  }
  if (aggregatedDelivery.delivered === "all") {
    return MessageStatus.Delivered;
  }
  if (aggregatedDelivery.sent === "all") {
    return MessageStatus.Sent;
  }
  return MessageStatus.Sent;
};

const getFinalMessageStatus = (
  channelParticipants: ReduxParticipant[],
  message: ReduxMessage
): MessageStatus => {
  // If we have aggregated delivery data (for non-chat participants), use it first
  if (message.aggregatedDeliveryReceipt) {
    const aggregatedStatus = getAggregatedMessageStatus(
      message.aggregatedDeliveryReceipt
    );

    // If aggregated data shows failure or issues, return that immediately
    if (aggregatedStatus === MessageStatus.Failed) {
      return aggregatedStatus;
    }
  }

  // Get chat participant statuses
  const chatStatuses = getChatParticipantStatuses(channelParticipants, message);
  const totalChatParticipants = Object.values(chatStatuses).reduce(
    (sum, count) => sum + count,
    0
  );

  // If no chat participants, fall back to aggregated status
  if (totalChatParticipants === 0) {
    return message.aggregatedDeliveryReceipt
      ? getAggregatedMessageStatus(message.aggregatedDeliveryReceipt)
      : MessageStatus.Sent;
  }

  // If all chat participants have read the message
  if (chatStatuses[MessageStatus.Read] === totalChatParticipants) {
    return MessageStatus.Read;
  }

  // Default to sent if we have any participant data
  return MessageStatus.Sent;
};

export async function getMessageStatus(
  message: ReduxMessage,
  channelParticipants: ReduxParticipant[]
): Promise<MessageStatus> {
  // FIXME should be: return statuses[message.sid];
  // after this modification:
  // message.on("updated", ({ message, updateReasons }) => {
  // if reason includes "deliveryReceipt" {
  //   // paginate detailed receipts
  //   const receipts = await message.getDetailedDeliveryReceipts(); // paginated backend query every time
  // }
  // });
  return getFinalMessageStatus(channelParticipants, message);
}

export const removeParticipant = async (
  conversation: Conversation,
  participant: Participant,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<void> => {
  try {
    await conversation.removeParticipant(participant);
    successNotification({
      message: PARTICIPANT_MESSAGES.REMOVED,
      addNotifications,
    });
  } catch (e) {
    unexpectedErrorNotification(e.message, addNotifications);
    throw e;
  }
};

export const getBlobFile = async (
  media: Media,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<Blob> => {
  try {
    const url = await getFileUrl(media);
    const response = await fetch(url);
    return response.blob();
  } catch (e) {
    unexpectedErrorNotification(e.message, addNotifications);
    throw e;
  }
};

export const getFileUrl = async (media: Media): Promise<string> => {
  return await media.getContentTemporaryUrl().then();
};

export const getMessages = async (
  conversation: Conversation
): Promise<Paginator<Message>> =>
  await conversation.getMessages(CONVERSATION_PAGE_SIZE);
