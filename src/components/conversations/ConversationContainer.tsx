import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";

import { Client } from "@twilio/conversations";
import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import { actionCreators, AppState } from "../../store";
import ConversationDetails from "./ConversationDetails";
import MessagesBox from "../message/MessagesBox";
import MessageInputField from "../message/MessageInputField";
import styles from "../../styles";
import { ReduxConversation } from "../../store/reducers/convoReducer";

interface ConvoContainerProps {
  conversation?: ReduxConversation;
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
  const { pushMessages } = bindActionCreators(actionCreators, dispatch);

  return (
    <Box style={styles.convosWrapperBox}>
      {sid && props.conversation && props.client ? (
        <>
          <ConversationDetails
            convoSid={sid}
            convo={props.conversation}
            participants={participants}
          />

          <MessagesBox
            key={sid}
            convoSid={sid}
            convo={props.conversation}
            addMessage={pushMessages}
            client={props.client}
            messages={messages[sid]}
            loadingState={loadingStatus}
            participants={participants}
            lastReadIndex={lastReadIndex}
          />

          <MessageInputField
            convoSid={sid}
            client={props.client}
            messages={messages[sid]}
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
              lineHeight: "20px",
              color: theme.textColors.colorTextIcon,
            }}
          >
            Select a conversation on the left to get started.
          </Box>
        </>
      )}
    </Box>
  );
};

export default ConversationContainer;
