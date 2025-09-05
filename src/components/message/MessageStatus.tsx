import { getMessageStatus } from "../../api";
import {
  ReduxMessage,
  MessageStatus as MessageStatusType,
} from "../../store/reducers/messageListReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import { useEffect, useState } from "react";
import DeliveredIcon from "../icons/Delivered";
import SendingIcon from "../icons/Sending";
import FailedIcon from "../icons/Failed";
import ReadIcon from "../icons/Read";

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
      {status === MessageStatusType.Delivered ? (
        <>
          <DeliveredIcon
            style={{ ...statusStyle, ...statusIconStyle }}
            color="green"
          />
          {/*{props.channelParticipants.length > 2 && (*/}
          {/*  <span style={statusStyle}>*/}
          {/*    {status[MessageStatusType.Delivered]}*/}
          {/*  </span>*/}
          {/*)}*/}
        </>
      ) : null}
      {status === MessageStatusType.Sent ? (
        <>
          <SendingIcon style={{ ...statusStyle, ...statusIconStyle }} />
        </>
      ) : null}

      {status === MessageStatusType.Failed ? (
        <>
          <FailedIcon
            style={{ ...statusStyle, ...statusIconStyle }}
            color="red"
          />
          {/*{props.channelParticipants.length > 2 && (*/}
          {/*  <span style={statusStyle}>{status[MessageStatusType.Failed]}</span>*/}
          {/*)}*/}
        </>
      ) : null}

      {status === MessageStatusType.Read ? (
        <>
          <ReadIcon
            style={{ ...statusStyle, ...statusIconStyle }}
            color="green"
          />
          {/*{props.channelParticipants.length > 2 && (*/}
          {/*  <span style={statusStyle}>{status[MessageStatusType.Read]}</span>*/}
          {/*)}*/}
        </>
      ) : null}
    </>
  );
};

export { MessageStatus };
