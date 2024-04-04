import { Message, Participant } from "@twilio/conversations";

export type AddMessagesType = (channelSid: string, messages: Message[]) => void;
export type SetSidType = (sid: string) => void;

export type SetParticipantsType = (
  participants: Participant[],
  sid: string
) => void;

export type SetUnreadMessagesType = (
  channelSid: string,
  unreadCount: number
) => void;

export enum ActionName {
  Save = "save",
  Create = "create",
  Manage = "manage",
}

export enum InputType {
  Text = "text",
  Password = "password",
}

export enum Content {
  AddChat = "Add chat participant",
  AddSMS = "Add SMS participant",
  AddWhatsApp = "Add WhatsApp participant",
}
