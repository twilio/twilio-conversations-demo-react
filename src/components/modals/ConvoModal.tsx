import { createRef } from "react";
import { Modal, ModalHeader, ModalHeading } from "@twilio-paste/modal";
import { Conversation, Client } from "@twilio/conversations";

interface ConvoModalProps {
  handleClose: () => void;
  isModalOpen: boolean;
  title: string;
  modalBody: JSX.Element;
  modalFooter?: JSX.Element;
  participantNr?: number;
  convo?: Conversation;
  client?: Client;
}

const ConvoModal: React.FC<ConvoModalProps> = (props: ConvoModalProps) => {
  const nameInputRef = createRef<HTMLInputElement>();

  return (
    <Modal
      ariaLabelledby="add-convo-modal"
      isOpen={props.isModalOpen}
      onDismiss={() => props.handleClose()}
      initialFocusRef={nameInputRef}
      size="default"
    >
      <ModalHeader>
        <ModalHeading as="h3">{props.title}</ModalHeading>
      </ModalHeader>
      {props.modalBody}
      {props.modalFooter}
    </Modal>
  );
};

export default ConvoModal;
