import { getMessageStatus } from "../../api";
import {
  ReduxMessage,
  MessageStatus as MessageStatusType,
} from "../../store/reducers/messageListReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import { useEffect, useState } from "react";
import SendingIcon from "../icons/Sending";
import FailedIcon from "../icons/Failed";
import ReadIcon from "../icons/Read";
import Sent from "../icons/Sent";
import Delivered from "../icons/Delivered";

type MessageStatusProps = {
  message: ReduxMessage;
  channelParticipants: ReduxParticipant[];
};

const statusStyle = {
  display: "inline-block",
  verticalAlign: "middle",
};

const statusIconStyle = {};

const MessageStatus: React.FC<MessageStatusProps> = (props) => {
  const [status, setStatus] = useState<MessageStatusType>();

  useEffect(() => {
    getMessageStatus(props.message, props.channelParticipants).then(
      (newStatus) => {
        setStatus(newStatus);
      }
    );
  }, [props.channelParticipants, props.message]);

  return (
    <>
      {status === MessageStatusType.Sending ||
      status == MessageStatusType.None ? (
        <SendingIcon style={{ ...statusStyle, ...statusIconStyle }} />
      ) : null}

      {status === MessageStatusType.Failed ? (
        <FailedIcon
          style={{ ...statusStyle, ...statusIconStyle }}
          color="red"
        />
      ) : null}

      {status === MessageStatusType.Sent ? (
        <Sent style={{ ...statusStyle, ...statusIconStyle }} />
      ) : null}

      {status === MessageStatusType.Delivered ? (
        <Delivered style={{ ...statusStyle, ...statusIconStyle }} />
      ) : null}

      {status === MessageStatusType.Read ? (
        <ReadIcon
          style={{ ...statusStyle, ...statusIconStyle }}
          color="green"
        />
      ) : null}
    </>
  );
};

export { MessageStatus };
