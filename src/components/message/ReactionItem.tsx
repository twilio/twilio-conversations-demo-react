import { Text } from "@twilio-paste/text";
import { Reactions, ReactionsType } from "../../types";

const ReactionItem: React.FC<{
  reactions?: ReactionsType;
  emoji: string;
  reactionId: Reactions;
  count?: number;
  user: string;
  onAction?: (reaction: Reactions) => void;
}> = ({ reactions, emoji, reactionId, count, user, onAction }) => (
  <button
    type="button"
    onClick={() => {
      if (onAction) {
        onAction(reactionId);
      }
    }}
    style={{
      border: 0,
      padding: "2px 2px",
      margin: "0 2px",
      fontSize: 14,
      lineHeight: "22px",
      cursor: "pointer",
      borderRadius: 8,
      backgroundColor: "transparent",
    }}
  >
    {emoji}{" "}
    <Text
      as="span"
      color={
        reactions?.[reactionId]?.includes(user) ? "colorTextLink" : "colorText"
      }
    >
      {" "}
      {count}
    </Text>
  </button>
);

export default ReactionItem;
