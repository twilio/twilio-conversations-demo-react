import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { debounce } from "lodash";

import { Conversation, Message, Client } from "@twilio/conversations";
import { AttachIcon } from "@twilio-paste/icons/esm/AttachIcon";
import { Box, Button } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { Text } from "@twilio-paste/text";

import { actionCreators } from "../../store";
import { MAX_FILE_SIZE, UNEXPECTED_ERROR_MESSAGE } from "../../constants";
import { getTypingMessage, unexpectedErrorNotification } from "../../helpers";
import MessageInput from "./MessageInput";
import SendMessageButton from "./SendMessageButton";

interface SendMessageProps {
  convoSid: string;
  client: Client;
  messages: Message[];
  convo: Conversation;
  typingData: string[];
}

const MessageInputField: React.FC<SendMessageProps> = (
  props: SendMessageProps
) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  // needed to clear input type=file
  const [filesInputKey, setFilesInputKey] = useState<string>("input-key");

  const theme = useTheme();
  const typingInfo = getTypingMessage(props.typingData);

  const dispatch = useDispatch();
  const { addMessages, addNotifications } = bindActionCreators(
    actionCreators,
    dispatch
  );

  useEffect(() => {
    setMessage("");
    setFiles([]);
    setFilesInputKey(Date.now().toString());
  }, [props.convo]);

  useEffect(() => {
    if (!files.length) {
      setFilesInputKey(Date.now().toString());
    }
  }, [files]);

  const onFilesChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { files: assets } = event.target;
    if (!assets?.length) {
      return;
    }

    const validFiles = Array.from(assets).filter(
      ({ size }) => size < MAX_FILE_SIZE + 1
    );

    if (validFiles.length < assets.length) {
      // TODO: show error
    }

    setFiles([...files, ...validFiles]);
  };

  const onFileRemove = (file: string) => {
    const fileIdentity = file.split("_");
    const existentFiles = files.filter(
      ({ name, size }) =>
        name !== fileIdentity[0] && size !== Number(fileIdentity[1])
    );

    setFiles(existentFiles);
  };

  const onMessageSend = async () => {
    const { convo, client, messages } = props;
    const messagesToSend = [];
    const messagesData = [];
    const currentDate: Date = new Date();

    if (message) {
      const newMessage: Message = Object.assign({}, messages[messages.length], {
        ...(messages[messages.length] as Message),
        author: client.user.identity,
        body: message,
        attributes: {},
        dateCreated: currentDate,
        index: -1,
        participantSid: "",
        sid: convo.sid,
        aggregatedDeliveryReceipt: null,
      }) as Message;
      //add message to state
      messagesToSend.push(newMessage);
      messagesData.push(message);
      //if promise is filled then is sent. If not failed. Update state of message
      //change state for the message to sent (or failed)
    }

    for (const file of files) {
      const newMessage: Message = Object.assign({}, messages[messages.length], {
        ...(messages[messages.length] as Message),
        author: client.user.identity,
        body: null,
        attributes: {},
        dateCreated: currentDate,
        index: -1,
        participantSid: "",
        sid: convo.sid,
        aggregatedDeliveryReceipt: null,
        media: {
          size: file.size,
          filename: file.name,
          contentType: file.type,
        },
      }) as Message;
      //add message to state
      messagesToSend.push(newMessage);
      const fileData = new FormData();
      fileData.set(file.name, file, file.name);
      messagesData.push(fileData);
    }

    addMessages(convo.sid, messagesToSend);
    setMessage("");
    setFiles([]);

    try {
      const indexes = [];
      for (const msg of messagesData) {
        const index = await convo.sendMessage(msg);
        indexes.push(index);
      }
      await convo.updateLastReadMessageIndex(Math.max(...indexes));
    } catch (e) {
      unexpectedErrorNotification(addNotifications);
      return Promise.reject(UNEXPECTED_ERROR_MESSAGE);
    }
  };

  return (
    <Box
      display="flex"
      flexBasis="60px"
      flexGrow={10}
      flexDirection="column"
      borderTopStyle="solid"
      borderTopWidth="borderWidth10"
      style={{
        borderTopColor: theme.borderColors.colorBorderWeak,
        backgroundColor: theme.backgroundColors.colorBackgroundBody,
      }}
    >
      <Box
        paddingBottom="space20"
        paddingTop="space50"
        paddingLeft="space150"
        hidden={!props.typingData.length}
      >
        <Text as="p" color="colorTextIcon">
          {typingInfo}
        </Text>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        height="100%"
        flexGrow={10}
        paddingBottom="space30"
        paddingTop="space40"
      >
        <Box
          paddingBottom="space30"
          paddingLeft="space50"
          paddingRight="space10"
          paddingTop="space20"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="start"
        >
          <Button variant="link">
            <label htmlFor="file-input">
              <AttachIcon
                decorative={true}
                title="Attach file"
                size="sizeIcon50"
              />
            </label>
            <input
              id="file-input"
              key={filesInputKey}
              type="file"
              style={{ display: "none" }}
              onChange={onFilesChange}
            />
          </Button>
        </Box>
        <Box paddingRight="space50" flexGrow={10}>
          <MessageInput
            assets={files}
            message={message}
            onChange={(e: string) => {
              debounce(() => {
                props.convo.typing();
              }, 2000)();
              setMessage(e);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onMessageSend();
              }
            }}
            onFileRemove={onFileRemove}
          />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="start"
        >
          {message || files.length ? (
            <SendMessageButton message={message} onClick={onMessageSend} />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageInputField;
