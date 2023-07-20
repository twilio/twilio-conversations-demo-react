import { Box } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";
import styles from "../../styles";

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
          <Button fullWidth variant="secondary" onClick={props.onParticipantListOpen}>
            <PlusIcon decorative={false} title="Add participants" />
            {"Add participants"}
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
        color="colorTextWeak"
        fontFamily="fontFamilyText"
        fontSize="fontSize30"
        lineHeight="lineHeight40"
        fontWeight="fontWeightNormal"
        paddingRight="space60"
      >
        {`${props.participants.length} participants`}
      </Box>
    </>
  );
};

export default ParticipantsView;
