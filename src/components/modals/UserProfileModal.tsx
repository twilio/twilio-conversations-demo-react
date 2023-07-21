import ModalInputField from "./ModalInputField";
import ConvoModal from "./ConvoModal";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import { Box, ModalBody } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import React, { useState } from "react";
import { User } from "@twilio/conversations";
import { updateFriendlyName } from "../../api";

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

  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title="User profile"
        modalBody={
          <ModalBody>
            <Box
              as="form"
              onKeyPress={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  await updateFriendlyName(friendlyName, props.user);
                  props.handleClose();
                }
              }}
            >
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
            </Box>
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
                onClick={async () => {
                  await updateFriendlyName(friendlyName, props.user);
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
