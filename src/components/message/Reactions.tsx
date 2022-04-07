import React, { ReactElement } from "react";
import { Box, Text } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { Menu, MenuButton, useMenuState } from "@twilio-paste/menu";
import AddReaction from "../icons/AddReaction";

enum Reactions {
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

type ReactionsProps = {
  reactions?: ReactionsType;
  onReactionsChanged: (reactions: ReactionsType) => void;
};

const reactionsExist = (reactions: ReactionsType) =>
  reactions &&
  (reactions[Reactions.HEART]?.length ||
    reactions[Reactions.THUMBS_DOWN]?.length ||
    reactions[Reactions.THUMBS_UP]?.length ||
    reactions[Reactions.POUTING]?.length ||
    reactions[Reactions.SAD]?.length ||
    reactions[Reactions.LAUGH]?.length);

export const ReactionsBox: React.FC<ReactionsProps> = ({
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
        ? reactionUsers.filter((participant) => participant != user)
        : [...reactionUsers, user],
    });
  };

  const allReactionsByCurrentUser = () =>
    Object.keys(reactions)
      .filter((reaction) => reactions[reaction as Reactions]?.length)
      .every((reaction) => reactions[reaction as Reactions]?.includes(user));

  const ReactionItem = ({
    emoji,
    reactionId,
    count,
  }: {
    emoji: string;
    reactionId: Reactions;
    count?: number;
  }) => (
    <button
      type="button"
      onClick={() => {
        menu.hide();
        onUpdateReaction(reactionId);
      }}
      style={{
        border: 0,
        padding: "2px 10px",
        margin: "0 2px",
        fontSize: 20,
        lineHeight: "28px",
        cursor: "pointer",
        borderRadius: 8,
        backgroundColor:
          reactions?.[reactionId]?.includes(user) && !count
            ? "blue"
            : "transparent",
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

  const isReactionsByCurrentUser = allReactionsByCurrentUser();

  const reactionsBorderColor = isReactionsByCurrentUser
    ? theme.textColors.colorTextLink
    : theme.textColors.colorTextIconInverse;

  const reactionsBackgroundColor = isReactionsByCurrentUser
    ? theme.backgroundColors.colorBackgroundPrimaryLighter
    : theme.backgroundColors.colorBackgroundBody;

  return (
    <Box
      style={{
        display: "flex",
      }}
    >
      {reactionsExist(reactions) ? (
        <Box
          style={{
            border: "1px solid " + reactionsBorderColor,
            borderRadius: 4,
            margin: "4px 4px 0 0",
            backgroundColor: reactionsBackgroundColor,
          }}
        >
          {reactions?.[Reactions.HEART]?.length ? (
            <ReactionItem
              emoji="&#129505;"
              reactionId={Reactions.HEART}
              count={reactions?.[Reactions.HEART]?.length}
            />
          ) : null}
          {reactions?.[Reactions.THUMBS_UP]?.length ? (
            <ReactionItem
              emoji="&#128077;"
              reactionId={Reactions.THUMBS_UP}
              count={reactions?.[Reactions.THUMBS_UP]?.length}
            />
          ) : null}
          {reactions?.[Reactions.LAUGH]?.length ? (
            <ReactionItem
              emoji="&#128514;"
              reactionId={Reactions.LAUGH}
              count={reactions?.[Reactions.LAUGH]?.length}
            />
          ) : null}
          {reactions?.[Reactions.SAD]?.length ? (
            <ReactionItem
              emoji="&#128542;"
              reactionId={Reactions.SAD}
              count={reactions?.[Reactions.SAD]?.length}
            />
          ) : null}
          {reactions?.[Reactions.POUTING]?.length ? (
            <ReactionItem
              emoji="&#128545;"
              reactionId={Reactions.POUTING}
              count={reactions?.[Reactions.POUTING]?.length}
            />
          ) : null}
          {reactions?.[Reactions.THUMBS_DOWN]?.length ? (
            <ReactionItem
              emoji="&#128078;"
              reactionId={Reactions.THUMBS_DOWN}
              count={reactions?.[Reactions.THUMBS_DOWN]?.length}
            />
          ) : null}
        </Box>
      ) : null}
      <Box
        style={{
          padding: "6px 10px",
          border: "1px solid #8891AA",
          borderRadius: 4,
          maxWidth: 42,
          maxHeight: 42,
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
            padding: "8px 4px",
            zIndex: 99,
          }}
        >
          <div style={{ display: "flex" }}>
            <ReactionItem emoji="&#129505;" reactionId={Reactions.HEART} />
            <ReactionItem emoji="&#128077;" reactionId={Reactions.THUMBS_UP} />
            <ReactionItem emoji="&#128514;" reactionId={Reactions.LAUGH} />
            <ReactionItem emoji="&#128542;" reactionId={Reactions.SAD} />
            <ReactionItem emoji="&#128545;" reactionId={Reactions.POUTING} />
            <ReactionItem
              emoji="&#128078;"
              reactionId={Reactions.THUMBS_DOWN}
            />
          </div>
        </Menu>
      </Box>
    </Box>
  );
};

export default ReactionsBox;
