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

export type MenuElement = {
  id: string;
  label: string;
  onClick?: () => void;
  customComponent?: React.ReactNode | ((props: unknown) => React.ReactNode);
  enabled?: boolean;
  hideOnClick?: boolean;
};

export enum Reactions {
  HEART = "heart",
  THUMBS_UP = "thumbs_up",
  LAUGH = "laugh",
  SAD = "sad",
  POUTING = "pouting",
  THUMBS_DOWN = "thumbs_down",
}

export type ReactionsType = {
  [Reactions.HEART]?: string[];
  [Reactions.THUMBS_DOWN]?: string[];
  [Reactions.THUMBS_UP]?: string[];
  [Reactions.SAD]?: string[];
  [Reactions.POUTING]?: string[];
  [Reactions.LAUGH]?: string[];
};
