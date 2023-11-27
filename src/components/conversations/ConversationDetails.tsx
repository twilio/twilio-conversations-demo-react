import { Box, Input } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import { EditIcon } from "@twilio-paste/icons/esm/EditIcon";

import ParticipantsView from "./ParticipantsView";
import Settings from "../settings/Settings";
import React, { useState, useEffect, useRef } from "react";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";

interface ConversationDetailsProps {
  convoSid: string;
  participants: ReduxParticipant[];
  convo: ReduxConversation;
  updateConvoName: (title: string) => void;
}

const ConversationDetails: React.FC<ConversationDetailsProps> = (
  props: ConversationDetailsProps
) => {
  const theme = useTheme();
  const [isManageParticipantOpen, setIsManageParticipantOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(
    props.convo.friendlyName ?? props.convo.sid
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleEditClick = () => {
    setEditedText(props.convo.friendlyName ?? props.convo.sid);
    setIsEditing(true);
  };

  const handleInputChange = (convoName: string) => {
    setEditedText(convoName);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        if (editedText !== props.convo.friendlyName) {
          props.updateConvoName(editedText);
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setIsEditing(false);
        if (editedText !== props.convo.friendlyName) {
          props.updateConvoName(editedText);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [editedText]);

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
          onClick={handleEditClick}
        >
          {isEditing ? (
            <Input
              type="text"
              value={editedText}
              onChange={(e) => handleInputChange(e.target.value)}
              ref={inputRef}
            />
          ) : (
            <>{props.convo.friendlyName ?? props.convo.sid}</>
          )}
          <EditIcon decorative={false} title="Edit conversation name" />
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
