import axios from "axios";
import {
  Conversation,
  Message,
  Participant,
  Media,
  Client,
  Paginator,
} from "@twilio/conversations";

import { MessageStatus } from "./store/reducers/messageListReducer";
import {
  CONVERSATION_MESSAGES,
  CONVERSATION_PAGE_SIZE,
  PARTICIPANT_MESSAGES,
  UNEXPECTED_ERROR_MESSAGE,
} from "./constants";
import { NotificationsType } from "./store/reducers/notificationsReducer";
import { successNotification, unexpectedErrorNotification } from "./helpers";

type ParticipantResponse = ReturnType<typeof Conversation.prototype.add>;

export async function addConversation(
  name: string,
  updateParticipants: (participants: Participant[], sid: string) => void,
  client?: Client,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<Conversation> {
  if (name.length > 0 && client !== undefined) {
    try {
      const conversation = await client.createConversation({
        friendlyName: name,
      });
      await conversation.join();

      const participants = await getConversationParticipants(conversation);
      updateParticipants(participants, conversation.sid);

      successNotification({
        message: CONVERSATION_MESSAGES.CREATED,
        addNotifications,
      });

      return conversation;
    } catch (e) {
      unexpectedErrorNotification(addNotifications);

      return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
    }
  }
  return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
}

export async function addParticipant(
  name: string,
  proxyName: string,
  chatParticipant: boolean,
  convo?: Conversation,
  addNotifications?: (notifications: NotificationsType) => void
): Promise<ParticipantResponse> {
  if (chatParticipant && name.length > 0 && convo !== undefined) {
    try {
      const result = await convo.add(name);
      successNotification({
        message: PARTICIPANT_MESSAGES.ADDED,
        addNotifications,
      });
      return result;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  if (
    !chatParticipant &&
    name.length > 0 &&
    proxyName.length > 0 &&
    convo !== undefined
  ) {
    try {
      const result = await convo.addNonChatParticipant(proxyName, name, {
        friendlyName: name,
      });
      successNotification({
        message: PARTICIPANT_MESSAGES.ADDED,
        addNotifications,
      });

      return result;
    } catch (e) {
      unexpectedErrorNotification(addNotifications);

      return Promise.reject(e);
    }
  }
  return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
}

export async function getToken(
  username: string,
  password: string
): Promise<string> {
  const requestAddress = process.env.REACT_APP_ACCESS_TOKEN_SERVICE_URL;

  try {
    const response = await axios.get(requestAddress as string, {
      params: { identity: username, password: password },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return Promise.reject(error);
    }

    process.stderr?.write(`ERROR received from ${requestAddress}: ${error}\n`);
    return Promise.reject(`ERROR received from ${requestAddress}: ${error}\n`);
  }
}

export async function getMessageStatus(
  conversation: Conversation,
  message: Message,
  channelParticipants: Participant[]
): Promise<{
  [MessageStatus.Delivered]?: number;
  [MessageStatus.Read]?: number;
  [MessageStatus.Failed]?: number;
  [MessageStatus.Sending]?: number;
}> {
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
    const receipts = await message.getDetailedDeliveryReceipts();
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

export const getConversationParticipants = async (
  conversation: Conversation
): Promise<Participant[]> => await conversation.getParticipants();

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
  } catch {
    unexpectedErrorNotification(addNotifications);
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
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
    unexpectedErrorNotification(addNotifications);
    return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
  }
};

export const getFileUrl = async (media: Media): Promise<string> => {
  return await media.getContentTemporaryUrl().then();
};

export const getMessages = async (
  conversation: Conversation
): Promise<Paginator<Message>> =>
  await conversation.getMessages(CONVERSATION_PAGE_SIZE);
