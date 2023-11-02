import ModalInputField from "./ModalInputField";
import ConvoModal from "./ConvoModal";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import { Box, ModalBody, Switch } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import React, { useState } from "react";
import { User } from "@twilio/conversations";
import { updateFriendlyName } from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, AppState } from "../../store";

interface UserProfileModalProps {
  isModalOpen: boolean;
  handleClose: () => void;
  user?: User;
}

const UserProfileModal: React.FC<UserProfileModalProps> = (
  props: UserProfileModalProps
) => {
  const identity = props.user?.identity ?? "";

  const dispatch = useDispatch();

  const [friendlyName, setFriendlyName] = useState(
    props.user?.friendlyName ?? ""
  );

  const { updateTimeFormat } = bindActionCreators(actionCreators, dispatch);
  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );
  const [on, setOn] = useState(use24hTimeFormat);

  const handleTimeFormatUpdate = async () => {
    updateTimeFormat(on);
  };

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
              <Switch
                checked={on}
                onChange={() => setOn(!on)}
                helpText="format for timestamps"
              >
                24 hour clock
              </Switch>
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
                  handleTimeFormatUpdate();
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
