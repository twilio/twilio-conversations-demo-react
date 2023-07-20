import { Box } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import styles from "../../styles";
import AvatarGroup from "../AvatarGroup";
import Avatar from "../Avatar";

interface ParticipantsViewProps {
  participants: ReduxParticipant[];
  onParticipantListOpen: () => void;
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

  const participantAvatars: JSX.Element[] = props.participants.map(
    (participant) => {
      return <Avatar name={participant.identity ?? " "} />;
    }
  );

  return (
    <>
      <AvatarGroup participants={props.participants} />
    </>
  );
};

export default ParticipantsView;
