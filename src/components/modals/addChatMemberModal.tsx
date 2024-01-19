import { ModalBody, Box } from "@twilio-paste/core";
import { RefObject } from "react";
import ModalInputField from "./ModalInputField";
import AddParticipantFooter from "./addParticipantFooter";
import { ActionName } from "../../types";
import ConvoModal from "./ConvoModal";
import { AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";
import { useSelector } from "react-redux";

interface AddChatParticipantModalProps {
  name: string;
  setName: (name: string) => void;
  error: string;
  nameInputRef: RefObject<HTMLInputElement>;
  onBack: () => void;
  action: () => void;
  handleClose: () => void;
  isModalOpen: boolean;
  title: string;
}

const AddChatParticipantModal: React.FC<AddChatParticipantModalProps> = (
  props: AddChatParticipantModalProps
) => {
  const local = useSelector((state: AppState) => state.local);
  const addChatParticipant = getTranslation(local, "addChatParticipant");
  const userIdentity = getTranslation(local, "userIdentity");
  const userIdentityHelperTxt = getTranslation(local, "userIdentityHelperTxt");

  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title={props.title}
        modalBody={
          <ModalBody>
            <h3>{addChatParticipant}</h3>
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
                label={userIdentity}
                isFocused={true}
                input={props.name}
                placeholder="exampleusername"
                onChange={props.setName}
                error={props.error}
                // error_text="Enter a valid user identity."
                help_text={userIdentityHelperTxt}
              />
            </Box>
          </ModalBody>
        }
        modalFooter={
          <AddParticipantFooter
            isSaveDisabled={!props.name.trim() || !!props.error}
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

export default AddChatParticipantModal;
