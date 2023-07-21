import ModalInputField from "./ModalInputField";
import ConvoModal from "./ConvoModal";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import { Box, ModalBody } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import React, { useState } from "react";
import { User } from "@twilio/conversations";
import ModalTextAreaField from "./ModalTextArea";

interface UserProfileModalProps {
  isModalOpen: boolean;
  handleClose: () => void;
  user?: User;
}

const UserProfileModal: React.FC<UserProfileModalProps> = (
  props: UserProfileModalProps
) => {
  const identity = props.user?.identity ?? "";

  const [friendlyName, setFriendlyName] = useState(
    props.user?.friendlyName ?? ""
  );

  const [attributes, setAttributes] = useState(
    JSON.stringify(props.user?.attributes ?? "")
  );

  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title="User profile"
        modalBody={
          <ModalBody>
            <Box as="form"></Box>
            <ModalInputField
              label="Identity"
              input={identity}
              onChange={() => null}
              readonly={true}
            />
            <br></br>
            <ModalInputField
              isFocused={true}
              label="Name(friendly_name)"
              input={friendlyName}
              onChange={setFriendlyName}
              maxLength={255}
            />
            <br></br>
            <ModalTextAreaField
              isFocused={true}
              label="Attributes"
              input={attributes}
              onChange={setAttributes}
              maxLength={16000}
            />
          </ModalBody>
        }
        modalFooter={
          <ModalFooter>
            <ModalFooterActions justify="start">
              <Button
                variant="secondary"
                onClick={() => {
                  props.handleClose();
                }}
              >
                Close
              </Button>
            </ModalFooterActions>
            <ModalFooterActions>
              <Button
                disabled={false}
                variant="primary"
                onClick={() => {
                  props.user?.updateFriendlyName(friendlyName);
                  if (attributes) {
                    props.user?.updateAttributes(JSON.parse(attributes));
                  } else {
                    props.user?.updateAttributes("{}");
                  }
                  props.handleClose();
                }}
              >
                Save
              </Button>
            </ModalFooterActions>
          </ModalFooter>
        }
      />
    </>
  );
};

export default UserProfileModal;
