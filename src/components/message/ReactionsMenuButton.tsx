import { Button } from "@twilio-paste/button";
import {
  Box,
  Popover,
  PopoverButton,
  PopoverContainer,
  PopoverStateReturn,
} from "@twilio-paste/core";
import React from "react";

interface ReactionsMenuButtonProps {
  reactions?: string;
  popover: PopoverStateReturn;
}

const ReactionsMenuButton: React.FC<ReactionsMenuButtonProps> = (
  props: ReactionsMenuButtonProps
) => {
  const saveButtonRef = React.createRef();
  return (
    <PopoverContainer state={props.popover} placement="top">
      <PopoverButton variant="primary">Open popover</PopoverButton>
      <Popover
        aria-label="Update API key permissions"
        initialFocusRef={saveButtonRef}
      >
        <Box padding="space30">
          <Button variant="link">👍</Button>
          <Button variant="link">😄</Button>
          <Button variant="link">😢</Button>
          <Button variant="link">😡</Button>
          <Button variant="link">👎</Button>
        </Box>
      </Popover>
    </PopoverContainer>
  );
};

export default ReactionsMenuButton;
