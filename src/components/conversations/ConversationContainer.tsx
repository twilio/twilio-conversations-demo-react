import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { useMemo, useState } from "react";

import { Client } from "@twilio/conversations";
import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import { actionCreators, AppState } from "../../store";
import ConversationDetails from "./ConversationDetails";
import MessagesBox from "../message/MessagesBox";
import MessageInputField from "../message/MessageInputField";
import styles from "../../styles";
import { ReduxConversation } from "../../store/reducers/convoReducer";

import { getSdkConversationObject } from "../../conversations-objects";
import { successNotification } from "../../helpers";
import { CONVERSATION_MESSAGES, ERROR_MODAL_MESSAGES } from "../../constants";
import ActionErrorModal from "../modals/ActionErrorModal";
import { getTranslation } from "./../../utils/localUtils";

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
  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );
  const local = useSelector((state: AppState) => state.local);
  const greeting = getTranslation(local, "greeting");

  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);

  const dispatch = useDispatch();
  const { pushMessages, updateConversation, addNotifications } =
    bindActionCreators(actionCreators, dispatch);

  const [showError, setErrorToShow] = useState<
    | {
        title: string;
        description: string;
      }
    | false
  >();
  const [errorData, setErrorData] = useState<
    | {
        message: string;
        code: number;
      }
    | undefined
  >();

  const sdkConvo = useMemo(() => {
    if (props.conversation) {
      const conversation = getSdkConversationObject(props.conversation);
      if (conversation) {
        return conversation;
      }
    }
    return;
  }, [props.conversation?.sid]);

  const handleDroppedFiles = (droppedFiles: File[]) => {
    setDroppedFiles(droppedFiles);
  };

  return (
    <Box style={styles.convosWrapperBox}>
      <ActionErrorModal
        errorText={showError || ERROR_MODAL_MESSAGES.CHANGE_CONVERSATION_NAME}
        isOpened={!!showError}
        onClose={() => {
          setErrorToShow(false);
          setErrorData(undefined);
        }}
        error={errorData}
      />
      {sid && props.conversation && props.client ? (
        <>
          <ConversationDetails
            convoSid={sid}
            convo={props.conversation}
            participants={participants}
            updateConvoName={(val: string) => {
              sdkConvo
                ?.updateFriendlyName(val)
                .then((convo) => {
                  updateConversation(convo.sid, convo);
                  successNotification({
                    message: CONVERSATION_MESSAGES.NAME_CHANGED,
                    addNotifications,
                  });
                })
                .catch((e) => {
                  setErrorData(e);
                  setErrorToShow(ERROR_MODAL_MESSAGES.CHANGE_CONVERSATION_NAME);
                });
            }}
          />

          <MessagesBox
            key={sid}
            convoSid={sid}
            convo={props.conversation}
            upsertMessage={pushMessages}
            client={props.client}
            messages={messages[sid]}
            loadingState={loadingStatus}
            participants={participants}
            lastReadIndex={lastReadIndex}
            use24hTimeFormat={use24hTimeFormat}
            handleDroppedFiles={handleDroppedFiles}
          />

          <MessageInputField
            convoSid={sid}
            client={props.client}
            messages={messages[sid]}
            convo={props.conversation}
            typingData={typingData}
            droppedFiles={droppedFiles}
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
              fontSize: theme.fontSizes.fontSize30,
              fontWeight: theme.fontWeights.fontWeightNormal,
              lineHeight: "20px",
              color: theme.textColors.colorTextIcon,
            }}
          >
            {greeting}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ConversationContainer;
