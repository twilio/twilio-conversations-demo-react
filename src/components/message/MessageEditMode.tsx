import { Box, Button, Input } from "@twilio-paste/core";
import { ReduxMessage } from "../../store/reducers/messageListReducer";
import { AcceptIcon } from "@twilio-paste/icons/esm/AcceptIcon";
import { CloseIcon } from "@twilio-paste/icons/cjs/CloseIcon";
import styles from "../../styles";
import { useRef } from "react";

interface MessageEditModeProps {
  message: ReduxMessage;
  variant?: "inbound" | "outbound";
  cancelEdit: () => void;
  editAction: (message: ReduxMessage, editedText: string) => void;
}

const MessageEditMode: React.FC<MessageEditModeProps> = (
  props: MessageEditModeProps
) => {
  const messageBody = props.message.body ?? "";
  const messageLength = props.message.body?.length ?? 0;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleEditAction = () => {
    if (inputRef.current) {
      props.editAction(props.message, inputRef.current.value);
    }
  };

  return (
    <Box
      style={{
        width: `${messageLength * 8 + 100}px`,
        alignSelf: props.variant === "inbound" ? "flex-start" : "flex-end",
        flexDirection: props.variant === "inbound" ? "row" : "row-reverse",
        ...styles.messageEditInput,
      }}
    >
      <Input type="text" defaultValue={messageBody} autoFocus ref={inputRef} />
      <Box style={styles.flex}>
        <Button variant="link" onClick={handleEditAction}>
          <AcceptIcon decorative={false} title="Edit message" />
        </Button>
        <Button variant="link" onClick={props.cancelEdit}>
          <CloseIcon decorative={false} title="Cancel edit message" />
        </Button>
      </Box>
    </Box>
  );
};

export default MessageEditMode;
