import { ModalBody, Box } from "@twilio-paste/core";
import { RefObject } from "react";
import ModalInputField from "./ModalInputField";
import AddParticipantFooter from "./addParticipantFooter";
import { ActionName } from "../../types";
import ConvoModal from "./ConvoModal";

interface AddWhatsAppParticipantModalProps {
  name: string;
  isModalOpen: boolean;
  title: string;
  proxyName: string;
  setName: (name: string) => void;
  setProxyName: (name: string) => void;
  error: string;
  errorProxy: string;
  nameInputRef: RefObject<HTMLInputElement>;
  onBack: () => void;
  action: () => void;
  handleClose: () => void;
}

const AddWhatsAppParticipantModal: React.FC<AddWhatsAppParticipantModalProps> =
  (props: AddWhatsAppParticipantModalProps) => {
    return (
      <>
        <ConvoModal
          handleClose={() => props.handleClose()}
          isModalOpen={props.isModalOpen}
          title={props.title}
          modalBody={
            <ModalBody>
              <h3>Add WhatsApp participant</h3>
              <Box as="form">
                <ModalInputField
                  isFocused={true}
                  label="WhatsApp number"
                  input={props.name}
                  placeholder="123456789012"
                  onChange={props.setName}
                  error={props.error}
                  help_text="The WhatsApp phone number of the participant."
                  prefixType="WhatsApp"
                />
                <ModalInputField
                  label="Proxy phone number"
                  input={props.proxyName}
                  placeholder="123456789012"
                  onChange={props.setProxyName}
                  error={props.errorProxy}
                  help_text="The Twilio phone number used by the participant in Conversations."
                  prefixType="WhatsApp"
                />
              </Box>
            </ModalBody>
          }
          modalFooter={
            <AddParticipantFooter
              isSaveDisabled={
                !props.name.trim() || !props.proxyName.trim() || !!props.error
              }
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

export default AddWhatsAppParticipantModal;
