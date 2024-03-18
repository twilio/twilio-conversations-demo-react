import { Reactions } from "../types";

export const emojiMapping: Record<Reactions, string> = {
  [Reactions.HEART]: "❤️",
  [Reactions.THUMBS_UP]: "👍",
  [Reactions.LAUGH]: "😄",
  [Reactions.SAD]: "😢",
  [Reactions.POUTING]: "😡",
  [Reactions.THUMBS_DOWN]: "👎",
};
