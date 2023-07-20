import { Box } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";

import ParticipantsView from "./ParticipantsView";
import Settings from "../settings/Settings";
import React, { useState } from "react";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";

interface ConversationDetailsProps {
  convoSid: string;
  participants: ReduxParticipant[];
  convo: ReduxConversation;
}

const ConversationDetails: React.FC<ConversationDetailsProps> = (
  props: ConversationDetailsProps
) => {
  const theme = useTheme();
  const [isManageParticipantOpen, setIsManageParticipantOpen] = useState(false);

  return (
    <Box
      style={{
        minHeight: 65,
        maxHeight: 65,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomStyle: "solid",
        borderBottomWidth: 1,
        borderBottomColor: theme.borderColors.colorBorderWeak,
      }}
    >
      <Box
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
          color="colorText"
          fontFamily="fontFamilyText"
          fontSize="fontSize50"
          lineHeight="lineHeight80"
          fontWeight="fontWeightBold"
          maxHeight="100%"
        >
          {props.convo.friendlyName ?? props.convo.sid}
        </Box>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ParticipantsView
            participants={props.participants}
            onParticipantListOpen={() => setIsManageParticipantOpen(true)}
          />

          <Settings
            convo={props.convo}
            participants={props.participants}
            isManageParticipantOpen={isManageParticipantOpen}
            setIsManageParticipantOpen={setIsManageParticipantOpen}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationDetails;
