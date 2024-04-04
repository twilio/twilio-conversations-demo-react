import { Box } from "@twilio-paste/core";
import { ChatComposer } from "@twilio-paste/core/chat-composer";
import {
  $getRoot,
  ClearEditorPlugin,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_LOW,
  EditorState,
  KEY_ENTER_COMMAND,
  useLexicalComposerContext,
} from "@twilio-paste/lexical-library";
import { useEffect } from "react";
import MessageFile from "./MessageFile";
import { useSelector } from "react-redux";
import { AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";

interface MessageInputProps {
  message: string;
  onChange: (message: string) => void;
  onEnterKeyPress: () => void;
  onFileRemove: (file: string) => void;
  assets: File[];
}

interface EnterKeyPluginProps {
  onEnterKeyPress: () => void;
}

const EnterKeyPlugin = (props: EnterKeyPluginProps) => {
  const { onEnterKeyPress } = props;
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        onEnterKeyPress();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, onEnterKeyPress]);

  return null;
};

// when message gets cleared and given it's a prop passed in to MessageInput
// we need to clear the Lexical editor.
// TODO: there has to be a simpler way of doing a basic binding like this with Lexical

interface MessagePropPluginProps {
  message: string;
}

const MessagePropPlugin = (props: MessagePropPluginProps) => {
  const { message } = props;
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (message === undefined || message === null || message.length === 0) {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    }
  }, [editor, message]);

  return null;
};

const MessageInput: React.FC<MessageInputProps> = (
  props: MessageInputProps
) => {
  const { onEnterKeyPress, message } = props;

  const local = useSelector((state: AppState) => state.local);
  const convoPlaceholder = getTranslation(local, "convoPlaceholder");

  return (
    <Box>
      <Box marginLeft={"space40"}>
        <ChatComposer
          config={{
            namespace: "message-input",
            onError: (e) => {
              throw e;
            },
          }}
          ariaLabel="A basic chat composer"
          placeholder={convoPlaceholder}
          onChange={(editorState: EditorState): void => {
            editorState.read(() => {
              const text = $getRoot().getTextContent();
              props.onChange(text);
            });
          }}
        >
          <ClearEditorPlugin />
          <MessagePropPlugin message={message} />
          <EnterKeyPlugin onEnterKeyPress={onEnterKeyPress} />
        </ChatComposer>
      </Box>
      {props.assets.length > 0 && (
        <Box
          style={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {props.assets.map(({ name, size }) => (
            <MessageFile
              key={`${name + "_" + size}`}
              media={{ filename: name, size }}
              onRemove={() => props.onFileRemove(name + "_" + size)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MessageInput;
