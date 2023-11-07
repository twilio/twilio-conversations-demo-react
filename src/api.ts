import axios from "axios";
import {
  Conversation,
  Message,
  Participant,
  Media,
  Client,
  Paginator,
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
import { getSdkMessageObject } from "./conversations-objects";
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

export async function getMessageStatus(
  message: ReduxMessage,
  channelParticipants: ReduxParticipant[]
): Promise<{
  [MessageStatus.Delivered]?: number;
  [MessageStatus.Read]?: number;
  [MessageStatus.Failed]?: number;
  [MessageStatus.Sending]?: number;
}> {
  // FIXME should be: return statuses[message.sid];
  // after this modification:
  // message.on("updated", ({ message, updateReasons }) => {
  // if reason includes "deliveryReceipt" {
  //   // paginate detailed receipts
  //   const receipts = await message.getDetailedDeliveryReceipts(); // paginated backend query every time
  // }
  // });

  const statuses = {
    [MessageStatus.Delivered]: 0,
    [MessageStatus.Read]: 0,
    [MessageStatus.Failed]: 0,
    [MessageStatus.Sending]: 0,
  };

  if (message.index === -1) {
    return Promise.resolve({
      ...statuses,
      [MessageStatus.Sending]: 1,
    });
  }

  channelParticipants.forEach((participant) => {
    if (
      participant.identity == localStorage.getItem("username") ||
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

  if (message.aggregatedDeliveryReceipt) {
    const sdkMessage = getSdkMessageObject(message);
    const receipts = await sdkMessage.getDetailedDeliveryReceipts(); // paginated backend query every time

    receipts.forEach((receipt) => {
      if (receipt.status === "read") {
        statuses[MessageStatus.Read] += 1;
      }

      if (receipt.status === "delivered") {
        statuses[MessageStatus.Delivered] += 1;
      }

      if (receipt.status === "failed" || receipt.status === "undelivered") {
        statuses[MessageStatus.Failed] += 1;
      }

      if (receipt.status === "sent" || receipt.status === "queued") {
        statuses[MessageStatus.Sending] += 1;
      }
    });
  }

  return statuses;
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
