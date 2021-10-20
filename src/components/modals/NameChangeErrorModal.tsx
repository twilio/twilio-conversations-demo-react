import {
  Modal,
  ModalFooter,
  ModalFooterActions,
  ModalHeader,
  ModalHeading,
} from "@twilio-paste/modal";
import { ModalBody } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import React from "react";

type NameChangeErrorModalProps = {
  isOpened: boolean;
  onClose: () => void;
  error?: {
    code: number;
    message: string;
  };
};

const NameChangeErrorModal: React.FC<NameChangeErrorModalProps> = ({
  isOpened,
  onClose,
  error = {},
}) => (
  <Modal
    ariaLabelledby="name-change-error"
    isOpen={isOpened}
    size="default"
    onDismiss={onClose}
  >
    <ModalHeader>
      <ModalHeading as="h3">Unable to save Conversation name</ModalHeading>
    </ModalHeader>
    <ModalBody>
      <div>
        Only creators of the Conversation can edit the Conversation name.
        <br />
        <br />
        Error code [{error.code}]: {error.message}
      </div>
    </ModalBody>
    <ModalFooter>
      <ModalFooterActions>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </ModalFooterActions>
    </ModalFooter>
  </Modal>
);

export default NameChangeErrorModal;
