import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { StyleSheet, View } from "react-native";

import { Conversation, Client } from "@twilio/conversations";
import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import { actionCreators, AppState } from "../../store";
import ConversationDetails from "./ConversationDetails";
import MessagesBox from "../message/MessagesBox";
import MessageInputField from "../message/MessageInputField";

interface ConvoContainerProps {
  conversation?: Conversation;
  client?: Client;
}

const ConversationContainer: React.FC<ConvoContainerProps> = (
  props: ConvoContainerProps
) => {
  const theme = useTheme();

  const sid = useSelector((state: AppState) => state.sid);
  const loadingStatus = useSelector((state: AppState) => state.loadingStatus);
  const participants =
    useSelector((state: AppState) => state.participants)[sid] ?? [];
  const messages = useSelector((state: AppState) => state.messages);
  const typingData =
    useSelector((state: AppState) => state.typingData)[sid] ?? [];
  const lastReadIndex = useSelector((state: AppState) => state.lastReadIndex);

  const dispatch = useDispatch();
  const { addMessages } = bindActionCreators(actionCreators, dispatch);

  return (
    <View style={styles.convosWrapper}>
      {sid && props.conversation && props.client ? (
        <>
          <ConversationDetails
            convoSid={sid}
            convo={props.conversation}
            participants={participants}
          />

          <MessagesBox
            convoSid={sid}
            convo={props.conversation}
            addMessage={addMessages}
            client={props.client}
            messages={messages}
            loadingState={loadingStatus}
            participants={participants}
            lastReadIndex={lastReadIndex}
          />

          <MessageInputField
            convoSid={sid}
            client={props.client}
            messages={messages}
            convo={props.conversation}
            typingData={typingData}
          />
        </>
      ) : (
        <>
          <Box
            style={{
              display: "flex",
              height: "100%",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "Inter",
              fontSize: theme.fontSizes.fontSize30,
              fontWeight: theme.fontWeights.fontWeightNormal,
              lineHeight: 20,
              color: theme.textColors.colorTextIcon,
            }}
          >
            Select a conversation on the left to get started.
          </Box>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  convosWrapper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

export default ConversationContainer;
