import React from "react";
import { Box, Stack, Tooltip } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { useTheme } from "@twilio-paste/theme";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import styles from "../../styles";
import AvatarGroup from "../AvatarGroup";
import { AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";
import { useSelector } from "react-redux";

const DEFAULT_MAX_DISPLAYED_PARTICIPANTS = 5;
const MAX_HIDDEN_PARTICIPANTS = 50;

interface ParticipantsViewProps {
  participants: ReduxParticipant[];
  onParticipantListOpen: () => void;
  maxDisplayedParticipants?: number;
}

function fetchName(participant: ReduxParticipant): string {
  let name: string = participant.identity ?? "unknown";
  if (participant.attributes != null) {
    const friendlyName: string | null =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      participant.attributes["friendlyName"];
    if (friendlyName != null) {
      name = friendlyName;
    }
  }
  return name;
}

const ParticipantsView: React.FC<ParticipantsViewProps> = (
  props: ParticipantsViewProps
) => {
  const local = useSelector((state: AppState) => state.local);
  const addParticipants = getTranslation(local, "addParticipants");
  const otherParticipants = getTranslation(local, "otherParticipants");
  const singularParticipant = getTranslation(local, "singularParticipant");

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
            {addParticipants}
          </Button>
        </Box>
      </>
    );
  }

  const theme = useTheme();
  // Display only a limited number of participant avatars
  // Hide the rest behind a text element with a tooltip
  const maxDisplayedParticipants =
    props.maxDisplayedParticipants ?? DEFAULT_MAX_DISPLAYED_PARTICIPANTS;

  const displayedParticipants = [];
  const hiddenParticipants = [];

  for (let i = 0; i < props.participants.length; i++) {
    const participant = props.participants[i];
    const name = fetchName(participant);
    if (i < maxDisplayedParticipants) {
      displayedParticipants.push(name);
    } else {
      hiddenParticipants.push(name);
    }

    if (hiddenParticipants.length == MAX_HIDDEN_PARTICIPANTS) {
      // Limit number of hidden participants, as we don't want the tooltip to grow up to 1000+ participants large
      hiddenParticipants.push("...");
      break;
    }
  }

  const count = props.participants.length - displayedParticipants.length;
  let participantCount = "";
  if (count === 1) {
    participantCount = singularParticipant;
  } else {
    participantCount = otherParticipants.replace("{count}", count.toString());
  }

  return (
    <>
      <Stack
        orientation={["vertical", "horizontal", "horizontal"]}
        spacing="space30"
      >
        <Button variant={"reset"} onClick={props.onParticipantListOpen}>
          <AvatarGroup names={displayedParticipants} />
        </Button>
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
              {participantCount}
            </span>
          </Tooltip>
        ) : null}
      </Stack>
    </>
  );
};

export default ParticipantsView;
