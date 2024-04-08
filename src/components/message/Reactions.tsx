import React from "react";
import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { Menu, MenuButton, useMenuState } from "@twilio-paste/menu";
import AddReaction from "../icons/AddReaction";
import { Tooltip } from "@twilio-paste/core/tooltip";
import { Reactions, ReactionsType } from "../../types";
import ReactionItem from "./ReactionItem";
import { reactionsMapping } from "../../utils/reactionsMapping";

type ReactionsProps = {
  reactions?: ReactionsType;
  onReactionsChanged: (reactions: ReactionsType) => void;
  showAddReactionButton?: boolean;
  showAsLabel?: boolean;
  showReactionsCount?: boolean;
  callback?: () => void;
};

const ReactionsBox: React.FC<ReactionsProps> = ({
  reactions = {},
  onReactionsChanged,
  showAddReactionButton = true,
  showAsLabel = false,
  showReactionsCount = true,
  callback,
}: ReactionsProps) => {
  const menu = useMenuState({
    placement: "top-start",
  });
  const user = localStorage.getItem("username") ?? "";
  const theme = useTheme();

  const onUpdateReaction = (reaction: Reactions) => {
    menu.hide();
    callback && callback();
    const reactionUsers = reactions?.[reaction] ?? [];

    onReactionsChanged({
      ...reactions,
      [reaction]: reactions?.[reaction]?.includes(user)
        ? reactionUsers.filter((participant) => participant !== user)
        : [...reactionUsers, user],
    });
  };

  const getReactionEmoji = (
    reactionId: Reactions,
    count: number
  ): React.ReactNode => {
    const emoji = reactionsMapping[reactionId];
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
              onAction={onUpdateReaction}
              user={user}
            />
          </Box>
        </Tooltip>
      );
    }
    return null;
  };

  const renderReactionBox = (reactionId: Reactions, count?: number) =>
    count ? getReactionEmoji(reactionId, count) : null;

  const renderReactionButton = () => (
    <Box
      style={{
        ...reactionButtonStyle,
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
        {showAsLabel ? "Add reaction" : <AddReaction />}
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
              emoji={reactionsMapping[reactionId]}
              reactionId={reactionId}
              onAction={onUpdateReaction}
              user={user}
            />
          ))}
        </div>
      </Menu>
    </Box>
  );

  const reactionButtonStyle = showAsLabel
    ? {
        textDecoration: "none",
      }
    : {
        padding: "6px 10px",
        border: "1px solid #8891AA",
        borderRadius: 4,
        maxWidth: 28,
        maxHeight: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "4px",
      };

  return (
    <Box style={{ display: "flex" }}>
      {showReactionsCount &&
        Object.entries(reactions).map(([reactionId, users]) =>
          renderReactionBox(reactionId as Reactions, users.length)
        )}
      {showAddReactionButton && (
        <>
          {!showAsLabel ? (
            <Tooltip text="Add reaction">{renderReactionButton()}</Tooltip>
          ) : (
            <>{renderReactionButton()}</>
          )}
        </>
      )}
    </Box>
  );
};

export default ReactionsBox;
