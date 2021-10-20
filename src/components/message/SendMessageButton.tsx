import { Button } from "@twilio-paste/button";
import { StyleSheet, View } from "react-native";

interface SendMessageButtonProps {
  message: string;
  onClick: () => void;
}

const SendMessageButton: React.FC<SendMessageButtonProps> = (
  props: SendMessageButtonProps
) => {
  return (
    <View style={styles.buttonWrapper}>
      <Button
        variant="primary"
        onClick={() => {
          props.onClick();
        }}
      >
        Send
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    flexDirection: "row",
    paddingRight: 16,
  },
});

export default SendMessageButton;
