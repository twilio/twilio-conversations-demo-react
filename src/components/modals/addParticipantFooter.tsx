import React from "react";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import { Button } from "@twilio-paste/button";
import { ArrowBackIcon } from "@twilio-paste/icons/esm/ArrowBackIcon";

interface AddParticipantFooterProps {
  actionName: string;
  onBack: () => void;
  action: () => void;
  isSaveDisabled?: boolean;
}

const AddParticipantFooter: React.FC<AddParticipantFooterProps> = (
  props: AddParticipantFooterProps
) => {
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
            Back
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
            {props.actionName}
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </>
  );
};

export default AddParticipantFooter;
