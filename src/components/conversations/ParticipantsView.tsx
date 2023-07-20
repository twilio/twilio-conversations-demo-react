import {
  Box,
  Popover,
  PopoverButton,
  PopoverContainer,
  Stack,
  Tooltip,
  Text,
} from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import styles from "../../styles";
import AvatarGroup from "../AvatarGroup";
import { useTheme } from "@twilio-paste/theme";
import React from "react";

const DEFAULT_MAX_DISPLAYED_PARTICIPANTS = 5;

interface ParticipantsViewProps {
  participants: ReduxParticipant[];
  onParticipantListOpen: () => void;
  maxDisplayedParticipants?: number;
}

const ParticipantsView: React.FC<ParticipantsViewProps> = (
  props: ParticipantsViewProps
) => {
  const theme = useTheme();
  if (props.participants.length == 1) {
    return (
      <>
        <Box style={styles.addParticipantsButton}>
          <Button
            fullWidth
            variant="secondary"
            onClick={props.onParticipantListOpen}
          >
            <PlusIcon decorative={false} title="Add participants" />
            {"Add participants"}
          </Button>
        </Box>
      </>
    );
  }

  const maxDisplayedParticipants =
    props.maxDisplayedParticipants ?? DEFAULT_MAX_DISPLAYED_PARTICIPANTS;

  const displayedParticipants = [];
  const hiddenParticipants = [];
  for (let i = 0; i < props.participants.length; i++) {
    const participant = props.participants[i];
    const identity = participant.identity ?? " ";
    if (i < maxDisplayedParticipants) {
      displayedParticipants.push(identity);
    } else {
      hiddenParticipants.push(identity);
    }
  }

  return (
    <>
      <Stack orientation="horizontal" spacing="space30">
        <AvatarGroup names={displayedParticipants} />
        {hiddenParticipants.length > 0 ? (
          <Tooltip
            text={hiddenParticipants.join(", ")}
            placement={"bottom-start"}
          >
            <span
              style={{
                verticalAlign: "top",
                paddingRight: 10,
                color: theme.textColors.colorText,
                fontWeight: theme.fontWeights.fontWeightSemibold,
              }}
            >
              and {hiddenParticipants.length} other Participants
            </span>
          </Tooltip>
        ) : null}
      </Stack>
    </>
  );
};

export default ParticipantsView;
