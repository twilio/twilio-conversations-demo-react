import { useEffect, useState } from "react";
import { Conversation, Message, Participant } from "@twilio/conversations";
import { SetSidType, SetUreadMessagesType } from "../../types";
import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { MessageStatus } from "../../store/reducers/messageListReducer";
import { getMessageStatus } from "../../api";
import SendingIcon from "../icons/Sending";
import DeliveredIcon from "../icons/Delivered";
import ReadIcon from "../icons/Read";
import FailedIcon from "../icons/Failed";

interface SingleConvoProps {
  convoId: string;
  setSid: SetSidType;
  currentConvoSid: string;
  lastMessage: string;
  myMessage: Message | false;
  unreadMessagesCount: number;
  convo: Conversation;
  updateUnreadMessages: SetUreadMessagesType;
  onClick: () => void;
  participants: Participant[];
  messages: Message[];
  typingInfo: string[];
}

function calculateUnreadMessagesWidth(count: number) {
  if (count === 0 || !count) {
    return 0;
  }
  const countAsString = count.toString();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }
  context.font = "bold 14px Inter";
  const width = context.measureText(countAsString).width;
  return width + 32;
}

function truncateMiddle(text: string, countWidth: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return text;
  }
  context.font = "bold 14px Inter";
  const width = context.measureText(text).width;
  if (width > 288 - countWidth) {
    const textLength = text.length;
    const avgLetterSize = width / textLength;
    const nrOfLetters = (288 - countWidth) / avgLetterSize;
    const delEachSide = (textLength - nrOfLetters + 1) / 2;
    const endLeft = Math.floor(textLength / 2 - delEachSide);
    const startRight = Math.ceil(textLength / 2 + delEachSide);
    return text.substr(0, endLeft) + "..." + text.substr(startRight);
  }
  return text;
}

function getLastMessageTime(messages: Message[]) {
  if (messages === undefined || messages === null || messages.length === 0) {
    return "";
  }
  const lastMessageDate = messages[messages.length - 1].dateCreated;
  const today = new Date();
  const diffInDates = Math.floor(today.getTime() - lastMessageDate.getTime());
  const dayLength = 1000 * 60 * 60 * 24;
  const weekLength = dayLength * 7;
  const yearLength = weekLength * 52;
  const diffInDays = Math.floor(diffInDates / dayLength);
  const diffInWeeks = Math.floor(diffInDates / weekLength);
  const diffInYears = Math.floor(diffInDates / yearLength);
  if (diffInDays < 0) {
    return "";
  }
  if (diffInDays === 0) {
    const minutesLessThanTen = lastMessageDate.getMinutes() < 10 ? "0" : "";
    return (
      lastMessageDate.getHours().toString() +
      ":" +
      minutesLessThanTen +
      lastMessageDate.getMinutes().toString()
    );
  }
  if (diffInDays === 1) {
    return "1 day ago";
  }
  if (diffInDays < 7) {
    return diffInDays + " days ago";
  }
  if (diffInDays < 14) {
    return "1 week ago";
  }
  if (diffInWeeks < 52) {
    return diffInWeeks + " weeks ago";
  }
  if (diffInYears < 2) {
    return "1 year ago";
  }
  return diffInYears + " years ago";
}

const ConversationView: React.FC<SingleConvoProps> = (
  props: SingleConvoProps
) => {
  const [backgroundColor, setBackgroundColor] = useState();
  const title = truncateMiddle(
    props.convo.friendlyName ?? props.convo.sid,
    calculateUnreadMessagesWidth(props.unreadMessagesCount)
  );
  const theme = useTheme();
  const textColor =
    props.unreadMessagesCount > 0
      ? theme.textColors.colorText
      : theme.textColors.colorTextIcon;

  const [lastMsgStatus, setLastMsgStatus] = useState("");
  const time = getLastMessageTime(props.messages);

  useEffect(() => {
    if (props.currentConvoSid === props.convo.sid) {
      setBackgroundColor(theme.backgroundColors.colorBackgroundStrong);
      return;
    }
    setBackgroundColor(theme.backgroundColors.colorBackgroundRowStriped);
  }, [props.currentConvoSid, props.convo.sid]);

  useEffect(() => {
    if (props.myMessage && !props.typingInfo.length) {
      getMessageStatus(props.convo, props.myMessage, props.participants).then(
        (statuses) => {
          if (statuses[MessageStatus.Read]) {
            setLastMsgStatus(MessageStatus.Read);
            return;
          }
          if (statuses[MessageStatus.Delivered]) {
            setLastMsgStatus(MessageStatus.Delivered);
            return;
          }
          if (statuses[MessageStatus.Failed]) {
            setLastMsgStatus(MessageStatus.Failed);
            return;
          }
          if (statuses[MessageStatus.Sending]) {
            setLastMsgStatus(MessageStatus.Sending);
            return;
          }
        }
      );
    }
  }, [
    props.convo,
    props.myMessage,
    props.lastMessage,
    props.participants,
    props.typingInfo,
  ]);

  return (
    <Box
      style={{
        width: 320,
        paddingTop: 14,
        paddingBottom: 14,
        paddingLeft: 16,
        paddingRight: 16,
        cursor: "pointer",
        backgroundColor: backgroundColor,
      }}
      id={props.convoId}
      className="name"
      onMouseOver={() => {
        if (props.convo.sid === props.currentConvoSid) {
          return;
        }
        setBackgroundColor(theme.backgroundColors.colorBackgroundStrong);
      }}
      onMouseOut={() => {
        if (props.convo.sid === props.currentConvoSid) {
          return;
        }
        setBackgroundColor(theme.backgroundColors.colorBackgroundRowStriped);
      }}
      onClick={props.onClick}
    >
      <Box
        style={{
          backgroundColor: backgroundColor,
        }}
      >
        <Box display="flex">
          <Box
            style={{
              width: 288,
              fontFamily: "Inter",
              fontWeight: theme.fontWeights.fontWeightMedium,
              fontSize: 14,
              color: theme.textColors.colorText,
            }}
          >
            {title}
          </Box>
          {props.unreadMessagesCount > 0 && (
            <Box paddingLeft="space30">
              <Box
                backgroundColor="colorBackgroundBrandStronger"
                color="colorTextInverse"
                fontFamily="fontFamilyText"
                fontWeight="fontWeightBold"
                fontSize="fontSize30"
                lineHeight="lineHeight30"
                paddingLeft="space30"
                paddingRight="space30"
                style={{ borderRadius: 12 }}
              >
                {props.unreadMessagesCount}
              </Box>
            </Box>
          )}
        </Box>
        <Box
          style={{
            paddingTop: 4,
            color: textColor,
            fontWeight: theme.fontWeights.fontWeightNormal,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {!props.typingInfo.length ? (
              <Box>
                {lastMsgStatus === MessageStatus.Sending && props.myMessage && (
                  <Box style={{ paddingRight: 6 }}>
                    <SendingIcon />
                  </Box>
                )}
                {lastMsgStatus === MessageStatus.Delivered && props.myMessage && (
                  <Box style={{ paddingRight: 6 }}>
                    <DeliveredIcon />
                  </Box>
                )}
                {lastMsgStatus === MessageStatus.Failed && props.myMessage && (
                  <Box style={{ paddingRight: 6 }}>
                    <FailedIcon />
                  </Box>
                )}
                {lastMsgStatus === MessageStatus.Read && props.myMessage && (
                  <Box style={{ paddingRight: 6 }}>
                    <ReadIcon />
                  </Box>
                )}
              </Box>
            ) : null}
            <Box
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {props.lastMessage}
            </Box>
          </Box>
          <Box style={{ whiteSpace: "nowrap", paddingLeft: 4 }}>{time}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationView;
