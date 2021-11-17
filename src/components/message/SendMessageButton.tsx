import { Button } from "@twilio-paste/button";
import { Box } from "@twilio-paste/core";
import styles from "../../styles";

interface SendMessageButtonProps {
  message: string;
  onClick: () => void;
}

const SendMessageButton: React.FC<SendMessageButtonProps> = (
  props: SendMessageButtonProps
) => {
  return (
    <Box style={styles.buttonWrapper}>
      <Button
        variant="primary"
        onClick={() => {
          props.onClick();
        }}
      >
        Send
      </Button>
    </Box>
  );
};

export default SendMessageButton;
