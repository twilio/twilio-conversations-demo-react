import React from "react";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import { Button } from "@twilio-paste/button";
import { ArrowBackIcon } from "@twilio-paste/icons/esm/ArrowBackIcon";
import { AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";
import { useSelector } from "react-redux";

interface AddParticipantFooterProps {
  actionName: string;
  onBack: () => void;
  action: () => void;
  isSaveDisabled?: boolean;
}

const AddParticipantFooter: React.FC<AddParticipantFooterProps> = (
  props: AddParticipantFooterProps
) => {
  const local = useSelector((state: AppState) => state.local);
  const back = getTranslation(local, "back");
  const actionNameTxt = getTranslation(local, props.actionName);

  return (
    <>
      <ModalFooter>
        <ModalFooterActions justify="start">
          <Button
            variant="secondary"
            onClick={() => {
              props.onBack();
            }}
          >
            <ArrowBackIcon
              decorative={true}
              title="Back to manage participants"
              size="sizeIcon10"
            />
            {back}
          </Button>
        </ModalFooterActions>
        <ModalFooterActions>
          <Button
            disabled={props.isSaveDisabled ?? false}
            variant="primary"
            onClick={() => {
              props.action();
            }}
          >
            {actionNameTxt}
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </>
  );
};

export default AddParticipantFooter;
