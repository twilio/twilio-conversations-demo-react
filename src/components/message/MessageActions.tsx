import React from "react";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuSeparator,
  useMenuState,
} from "@twilio-paste/menu";
import { MoreIcon } from "@twilio-paste/icons/esm/MoreIcon";
import {
  MediaBody,
  MediaFigure,
  MediaObject,
} from "@twilio-paste/media-object";
import { Text } from "@twilio-paste/text";
import { DeleteIcon } from "@twilio-paste/icons/cjs/DeleteIcon";
import { CopyIcon } from "@twilio-paste/icons/cjs/CopyIcon";
import { Box, Toaster, useToaster } from "@twilio-paste/core";
import { COPY_SUCCESS_MESSAGE } from "../../constants";

type MessageActionsProps = {
  messageText: string;
  onMessageDelete: () => void;
};

const MessageActions: React.FC<MessageActionsProps> = ({
  messageText,
  onMessageDelete,
}: MessageActionsProps) => {
  const menu = useMenuState();
  const toaster = useToaster();

  return (
    <Box
      style={{
        zIndex: 6,
        paddingLeft: 6,
      }}
    >
      {/* TODO: move toaster to the App component level*/}
      <Toaster {...toaster} />
      <MenuButton {...menu} variant="link" size="reset">
        <MoreIcon
          decorative={false}
          title="Settings"
          color="colorTextBrandInverse"
        />
      </MenuButton>
      <Menu {...menu} aria-label="MessageActions">
        {messageText ? (
          <>
            <MenuItem
              {...menu}
              onClick={() => {
                navigator.clipboard.writeText(messageText);
                toaster.push({
                  message: COPY_SUCCESS_MESSAGE,
                  variant: "success",
                });
                menu.hide();
              }}
            >
              <MediaObject verticalAlign="center">
                <MediaFigure spacing="space20">
                  <CopyIcon
                    decorative={false}
                    title="Copy"
                    color="colorTextIcon"
                  />
                </MediaFigure>
                <MediaBody>Copy</MediaBody>
              </MediaObject>
            </MenuItem>
            <MenuSeparator {...menu} />
          </>
        ) : null}
        <MenuItem {...menu} onClick={onMessageDelete}>
          <MediaObject verticalAlign="center">
            <MediaFigure spacing="space20">
              <DeleteIcon
                decorative={false}
                title="Delete"
                color="colorTextErrorStrong"
              />
            </MediaFigure>
            <MediaBody>
              <Text as="span" color="colorTextErrorStrong">
                Delete Message
              </Text>
            </MediaBody>
          </MediaObject>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MessageActions;
