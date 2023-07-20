import {
  Box,
  Popover,
  PopoverButton,
  PopoverContainer,
  Stack,
  Tooltip,
} from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import styles from "../../styles";
import AvatarGroup from "../AvatarGroup";

const MAX_DISPLAYED_PARTICIPANTS = 5;

interface ParticipantsViewProps {
  participants: ReduxParticipant[];
  onParticipantListOpen: () => void;
  maxDisplayedParticipants?: number;
}

const ParticipantsView: React.FC<ParticipantsViewProps> = (
  props: ParticipantsViewProps
) => {
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

  return (
    <>
      <Stack orientation="horizontal" spacing="space10">
        <AvatarGroup
          names={props.participants.map(
            (participant) => participant.identity ?? " "
          )}
        />
        <Tooltip text={"Bottom Text"} placement={"bottom-start"}>
          <Button variant="link" size={"small"}>
            and N other Participants
          </Button>
        </Tooltip>
      </Stack>
    </>
  );
};

export default ParticipantsView;
