import React from "react";
import { Box, Text } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { Menu, MenuButton, useMenuState } from "@twilio-paste/menu";
import AddReaction from "../icons/AddReaction";
import { Tooltip } from "@twilio-paste/core/tooltip";

enum Reactions {
  HEART = "heart",
  THUMBS_UP = "thumbs_up",
  LAUGH = "laugh",
  SAD = "sad",
  POUTING = "pouting",
  THUMBS_DOWN = "thumbs_down",
}

const emojiMapping: Record<Reactions, string> = {
  [Reactions.HEART]: "❤️",
  [Reactions.THUMBS_UP]: "👍",
  [Reactions.LAUGH]: "😄",
  [Reactions.SAD]: "😢",
  [Reactions.POUTING]: "😡",
  [Reactions.THUMBS_DOWN]: "👎",
};

export type ReactionsType = {
  [Reactions.HEART]?: string[];
  [Reactions.THUMBS_DOWN]?: string[];
  [Reactions.THUMBS_UP]?: string[];
  [Reactions.SAD]?: string[];
  [Reactions.POUTING]?: string[];
  [Reactions.LAUGH]?: string[];
};

type ReactionsProps = {
  reactions?: ReactionsType;
  onReactionsChanged: (reactions: ReactionsType) => void;
};

const ReactionsBox: React.FC<ReactionsProps> = ({
  reactions = {},
  onReactionsChanged,
}: ReactionsProps) => {
  const menu = useMenuState({
    placement: "top-start",
  });
  const user = localStorage.getItem("username") ?? "";
  const theme = useTheme();

  const onUpdateReaction = (reaction: Reactions) => {
    const reactionUsers = reactions?.[reaction] ?? [];

    onReactionsChanged({
      ...reactions,
      [reaction]: reactions?.[reaction]?.includes(user)
        ? reactionUsers.filter((participant) => participant !== user)
        : [...reactionUsers, user],
    });
  };

  const ReactionItem: React.FC<{
    emoji: string;
    reactionId: Reactions;
    count?: number;
  }> = ({ emoji, reactionId, count }) => (
    <button
      type="button"
      onClick={() => {
        menu.hide();
        onUpdateReaction(reactionId);
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
          reactions?.[reactionId]?.includes(user)
            ? "colorTextLink"
            : "colorText"
        }
      >
        {" "}
        {count}
      </Text>
    </button>
  );

  const getReactionEmoji = (
    reactionId: Reactions,
    count: number
  ): React.ReactNode => {
    const emoji = emojiMapping[reactionId];
    const reactionUsers = reactions?.[reactionId] || [];
    const userIncluded = reactionUsers.includes(user);

    if (emoji) {
      return (
        <Tooltip
          key={reactionId}
          text={
            userIncluded
              ? `You${reactionUsers.length > 1 ? " and" : ""} ${reactionUsers
                  .filter((name) => name !== user)
                  .join(", ")} reacted with :${reactionId}`
              : `${reactionUsers.join(", ")} reacted with :${reactionId}`
          }
        >
          <Box
            key={reactionId}
            style={{
              border: `1px solid ${
                userIncluded
                  ? theme.textColors.colorTextLink
                  : theme.textColors.colorTextIconInverse
              }`,
              borderRadius: 4,
              margin: "4px 4px 0 0",
              backgroundColor: userIncluded
                ? "#e8f4f8"
                : theme.backgroundColors.colorBackgroundBody,
            }}
          >
            <ReactionItem
              emoji={emoji}
              reactionId={reactionId}
              count={count}
              key={reactionId}
            />
          </Box>
        </Tooltip>
      );
    }
    return null;
  };

  const renderReactionBox = (reactionId: Reactions, count?: number) =>
    count ? getReactionEmoji(reactionId, count) : null;

  return (
    <Box style={{ display: "flex" }}>
      {Object.entries(reactions).map(([reactionId, users]) =>
        renderReactionBox(reactionId as Reactions, users.length)
      )}
      <Tooltip text="Add reaction">
        <Box
          style={{
            padding: "6px 10px",
            border: "1px solid #8891AA",
            borderRadius: 4,
            maxWidth: 28,
            maxHeight: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "4px",
          }}
        >
          <MenuButton
            {...menu}
            variant="link"
            size="reset"
            style={{
              padding: 4,
            }}
          >
            <AddReaction />
          </MenuButton>
          <Menu
            {...menu}
            placement="top-start"
            aria-label="MessageReactions"
            style={{
              padding: "8px 8px",
              zIndex: 99,
            }}
          >
            <div style={{ display: "flex" }}>
              {Object.values(Reactions).map((reactionId) => (
                <ReactionItem
                  key={reactionId}
                  emoji={emojiMapping[reactionId]}
                  reactionId={reactionId}
                />
              ))}
            </div>
          </Menu>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default ReactionsBox;
