import axios from "axios";
import { Conversation } from "@twilio/conversations/lib/conversation";
import Client from "@twilio/conversations";
import { Message } from "@twilio/conversations/lib/message";
import { Participant } from "@twilio/conversations/lib/participant";
import { Media } from "@twilio/conversations/lib";

import { MessageStatus } from "./store/reducers/messageListReducer";

export async function addConversation(
  name: string,
  client?: Client
): Promise<Conversation> {
  if (name.length > 0 && client !== undefined) {
    const conversation = await client.createConversation({
      friendlyName: name,
    });
    await conversation.join();
    return conversation;
  }
  return Promise.reject("Unexpected error");
}

export async function addParticipant(
  name: string,
  proxyName: string,
  chatParticipant: boolean,
  convo?: Conversation
): Promise<{
  success: boolean;
  errorText?: string;
}> {
  if (chatParticipant && name.length > 0 && convo !== undefined) {
    try {
      await convo.add(name);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        errorText: e.message,
      };
    }
  }
  if (
    !chatParticipant &&
    name.length > 0 &&
    proxyName.length > 0 &&
    convo !== undefined
  ) {
    try {
      await convo.addNonChatParticipant(proxyName, name, {
        friendlyName: name,
      });
      return { success: true };
    } catch (e) {
      return {
        success: false,
        errorText: e.message,
      };
    }
  }
  return Promise.reject("Unexpected error");
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
  participant: Participant
): Promise<void> => await conversation.removeParticipant(participant);

export const getBlobFile = async (media: Media): Promise<Blob> => {
  const url = await getFileUrl(media);
  const response = await fetch(url);
  return response.blob();
};

export const getFileUrl = async (media: Media): Promise<string> => {
  return await media.getContentTemporaryUrl().then();
};
