import { ModalBody, Box } from "@twilio-paste/core";
import { RefObject } from "react";
import ModalInputField from "./ModalInputField";
import AddParticipantFooter from "./addParticipantFooter";
import { ActionName } from "../../types";
import ConvoModal from "./ConvoModal";

interface AddSMSParticipantModalProps {
  name: string;
  isModalOpen: boolean;
  title: string;
  proxyName: string;
  setName: (name: string) => void;
  setProxyName: (name: string) => void;
  error: string;
  errorProxy: string;
  nameInputRef: RefObject<HTMLInputElement>;
  handleClose: () => void;
  onBack: () => void;
  action: () => void;
}

const AddSMSParticipantModal: React.FC<AddSMSParticipantModalProps> = (
  props: AddSMSParticipantModalProps
) => {
  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title={props.title}
        modalBody={
          <ModalBody>
            <h3>Add SMS participant</h3>
            <Box as="form">
              <ModalInputField
                isFocused={true}
                label="Phone number"
                input={props.name}
                placeholder="123456789012"
                onChange={props.setName}
                error={props.error}
                // error_text="Enter a valid phone number."
                help_text="The phone number of the participant."
                prefixType="SMS"
              />
              <ModalInputField
                label="Proxy phone number"
                input={props.proxyName}
                placeholder="123456789012"
                onChange={props.setProxyName}
                error={props.errorProxy}
                // error_text="Enter a valid Twilio phone number."
                help_text="The Twilio phone number used by the participant in Conversations."
                prefixType="SMS"
              />
            </Box>
          </ModalBody>
        }
        modalFooter={
          <AddParticipantFooter
            isSaveDisabled={!props.name || !props.proxyName || !!props.error}
            actionName={ActionName.Save}
            onBack={() => {
              props.onBack();
            }}
            action={props.action}
          />
        }
      />
    </>
  );
};

export default AddSMSParticipantModal;
