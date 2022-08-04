import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import { MessageStatus } from "../../store/reducers/messageListReducer";
import SendingIcon from "../icons/Sending";
import DeliveredIcon from "../icons/Delivered";
import ReadIcon from "../icons/Read";
import FailedIcon from "../icons/Failed";
import { AppState } from "../../store";
import MessageActions from "./MessageActions";
import Reactions, { ReactionsType } from "./Reactions";

type MessageStatuses = {
  [MessageStatus.Delivered]?: number;
  [MessageStatus.Read]?: number;
  [MessageStatus.Failed]?: number;
  [MessageStatus.Sending]?: number;
};

interface SingleMessageProps {
  getStatus: Promise<MessageStatuses>;
  author: string;
  topPadding: number;
  lastMessageBottomPadding: number;
  sameAuthorAsPrev: boolean;
  messageTime: string;
  onDeleteMessage: () => void;
  updateAttributes: (reactions: { reactions: ReactionsType }) => void;
  reactions?: ReactionsType;
  text: string;
  media: JSX.Element | null;
}

const statusStyle = {
  display: "inline-block",
  verticalAlign: "middle",
  marginLeft: "4px",
};

const statusIconStyle = {
  marginLeft: "10px",
};

const MessageView: React.FC<SingleMessageProps> = (
  props: SingleMessageProps
) => {
  const theme = useTheme();
  const { text, getStatus, onDeleteMessage } = props;

  const [status, setStatus] = useState<MessageStatuses>({});
  const sid = useSelector((state: AppState) => state.sid);
  const participants =
    useSelector((state: AppState) => state.participants)[sid] ?? [];

  useEffect(() => {
    getStatus.then((value) => setStatus(value));
  }, [getStatus]);

  return (
    <>
      {props.author === localStorage.getItem("username") && (
        <>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              paddingTop: props.topPadding,
              paddingBottom: props.lastMessageBottomPadding,
            }}
          >
            <Box
              style={{
                backgroundColor: theme.backgroundColors.colorBackgroundPrimary,
                color: theme.backgroundColors.colorBackgroundBody,
                fontFamily: theme.fonts.fontFamilyText,
                fontSize: theme.fontSizes.fontSize30,
                fontWeight: theme.fontWeights.fontWeightNormal,
                lineHeight: theme.lineHeights.lineHeight30,
                paddingTop: theme.space.space40,
                paddingBottom: theme.space.space40,
                paddingLeft: theme.space.space30,
                paddingRight: theme.space.space30,
                borderRadius: theme.space.space30,
              }}
            >
              {props.media}
              <Box
                style={{
                  paddingTop: theme.space.space30,
                }}
              >
                {props.text}
              </Box>
              <Box
                style={{
                  display: "flex",
                  flexGrow: 10,
                  paddingTop: theme.space.space30,
                  justifyContent: "space-between",
                }}
              >
                <Box fontSize={theme.fontSizes.fontSize20}>
                  {props.messageTime}
                </Box>
                <Box
                  style={{
                    paddingLeft: theme.space.space30,
                    display: "flex",
                  }}
                >
                  {status[MessageStatus.Delivered] ? (
                    <>
                      <DeliveredIcon
                        color="#fff"
                        style={{ ...statusStyle, ...statusIconStyle }}
                      />
                      {participants.length > 2 && (
                        <span style={statusStyle}>
                          {status[MessageStatus.Delivered]}
                        </span>
                      )}
                    </>
                  ) : null}

                  {status[MessageStatus.Sending] ? (
                    <>
                      <SendingIcon
                        color="#fff"
                        style={{ ...statusStyle, ...statusIconStyle }}
                      />
                    </>
                  ) : null}

                  {status[MessageStatus.Failed] ? (
                    <>
                      <FailedIcon
                        color="#fff"
                        style={{ ...statusStyle, ...statusIconStyle }}
                      />
                      {participants.length > 2 && (
                        <span style={statusStyle}>
                          {status[MessageStatus.Failed]}
                        </span>
                      )}
                    </>
                  ) : null}

                  {status[MessageStatus.Read] ? (
                    <>
                      <ReadIcon
                        color="#fff"
                        style={{ ...statusStyle, ...statusIconStyle }}
                      />
                      {participants.length > 2 && (
                        <span style={statusStyle}>
                          {status[MessageStatus.Read]}
                        </span>
                      )}
                    </>
                  ) : null}

                  <MessageActions
                    messageText={text}
                    onMessageDelete={onDeleteMessage}
                  />
                </Box>
              </Box>
            </Box>

            {status[MessageStatus.Failed] ? (
              <div style={{ textAlign: "right", paddingTop: "4px" }}>
                <span style={{ color: "#D61F1F" }}>
                  An error has occurred.
                  {/*Tap for more info.*/}
                </span>
              </div>
            ) : null}

            {status[MessageStatus.Delivered] || status[MessageStatus.Read] ? (
              <Reactions
                reactions={props.reactions}
                onReactionsChanged={(reactions) =>
                  props.updateAttributes({ reactions })
                }
              />
            ) : null}
          </Box>
        </>
      )}
      {props.author !== localStorage.getItem("username") && (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            paddingTop: props.topPadding,
            paddingBottom: props.lastMessageBottomPadding,
          }}
        >
          <Box
            style={{
              color: theme.textColors.colorTextIcon,
              fontFamily: theme.fonts.fontFamilyText,
              fontSize: theme.fontSizes.fontSize30,
              fontWeight: theme.fontWeights.fontWeightNormal,
              lineHeight: theme.lineHeights.lineHeight30,
            }}
          >
            {props.sameAuthorAsPrev && props.author}
          </Box>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Box
              style={{
                backgroundColor: theme.backgroundColors.colorBackground,
                color: theme.textColors.colorText,
                fontFamily: theme.fonts.fontFamilyText,
                fontSize: theme.fontSizes.fontSize30,
                fontWeight: theme.fontWeights.fontWeightNormal,
                lineHeight: theme.lineHeights.lineHeight30,
                paddingTop: theme.space.space40,
                paddingBottom: theme.space.space40,
                paddingLeft: theme.space.space30,
                paddingRight: theme.space.space30,
                borderRadius: theme.space.space30,
              }}
            >
              {props.media}
              {props.text}
              <Box
                paddingTop="space30"
                fontSize={theme.fontSizes.fontSize20}
                color={theme.textColors.colorTextIcon}
              >
                {props.messageTime}
              </Box>
            </Box>
          </Box>

          <Reactions
            reactions={props.reactions}
            onReactionsChanged={(reactions) =>
              props.updateAttributes({ reactions })
            }
          />
        </Box>
      )}
    </>
  );
};

export default MessageView;
