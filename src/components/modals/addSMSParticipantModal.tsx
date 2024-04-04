import { ModalBody, Box } from "@twilio-paste/core";
import { RefObject } from "react";
import ModalInputField from "./ModalInputField";
import AddParticipantFooter from "./addParticipantFooter";
import { ActionName } from "../../types";
import ConvoModal from "./ConvoModal";
import { AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";
import { useSelector } from "react-redux";

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
  const local = useSelector((state: AppState) => state.local);
  const proxyNum = getTranslation(local, "proxyNum");
  const proxyNumHelpTxt = getTranslation(local, "proxyNumHelpTxt");
  const smsNum = getTranslation(local, "smsNum");
  const smsHelpTxt = getTranslation(local, "smsHelpTxt");
  const addSMSParticipant = getTranslation(local, "addSMSParticipant");

  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title={props.title}
        modalBody={
          <ModalBody>
            <h3>{addSMSParticipant}</h3>
            <Box
              as="form"
              onKeyPress={async (e) => {
                if (e.key === "Enter") {
                  if (props.action) {
                    e.preventDefault();
                    props.action();
                  }
                }
              }}
            >
              <ModalInputField
                isFocused={true}
                label={smsNum}
                input={props.name}
                placeholder="123456789012"
                onChange={props.setName}
                error={props.error}
                // error_text="Enter a valid phone number."
                help_text={smsHelpTxt}
                prefixType="SMS"
              />
              <ModalInputField
                label={proxyNum}
                input={props.proxyName}
                placeholder="123456789012"
                onChange={props.setProxyName}
                error={props.errorProxy}
                // error_text="Enter a valid Twilio phone number."
                help_text={proxyNumHelpTxt}
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
