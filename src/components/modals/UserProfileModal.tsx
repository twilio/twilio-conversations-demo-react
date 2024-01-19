import ModalInputField from "./ModalInputField";
import ConvoModal from "./ConvoModal";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import {
  Box,
  ModalBody,
  Switch,
  Select,
  Option,
  Label,
} from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import React, { useState } from "react";
import { User } from "@twilio/conversations";
import { updateFriendlyName } from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, AppState } from "../../store";
import { getTranslation, languageOptions } from "./../../utils/localUtils";

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

  const { updateTimeFormat, updateLocal } = bindActionCreators(
    actionCreators,
    dispatch
  );
  const use24hTimeFormat = useSelector(
    (state: AppState) => state.use24hTimeFormat
  );
  const local = useSelector((state: AppState) => state.local);
  const [on, setOn] = useState(use24hTimeFormat);
  const [selectedLocal, setSelectedLocal] = useState(local);
  const userProfileTxt = getTranslation(local, "userProfileTxt");
  const identityTxt = getTranslation(local, "identityTxt");
  const friendlyNameTxt = getTranslation(local, "friendlyNameTxt");
  const selectLocal = getTranslation(local, "selectLocal");
  const clockFormat = getTranslation(local, "clockFormat");
  const clockHelper = getTranslation(local, "clockHelper");
  const save = getTranslation(local, "save");
  const cancel = getTranslation(local, "cancel");

  const handleTimeFormatUpdate = async () => {
    updateTimeFormat(on);
  };

  const handleLocalUpdate = async () => {
    updateLocal(selectedLocal);
  };

  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title={userProfileTxt}
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
                label={identityTxt}
                input={identity}
                onChange={() => null}
                readonly={true}
              />
              <br></br>
              <ModalInputField
                isFocused={true}
                label={friendlyNameTxt}
                input={friendlyName}
                onChange={setFriendlyName}
                maxLength={255}
              />
              <br></br>
              <Label htmlFor="local">{selectLocal}</Label>
              <Select
                id="local"
                value={selectedLocal}
                onChange={(event) => setSelectedLocal(event.target.value)}
              >
                {languageOptions.languages.map((language) => (
                  <Option key={language.code} value={language.code}>
                    {language.flag}
                  </Option>
                ))}
              </Select>
              <br></br>
              <Switch
                checked={on}
                onChange={() => setOn(!on)}
                helpText={clockHelper}
              >
                {clockFormat}
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
                {cancel}
              </Button>
            </ModalFooterActions>
            <ModalFooterActions>
              <Button
                disabled={false}
                variant="primary"
                onClick={async () => {
                  await updateFriendlyName(friendlyName, props.user);
                  handleTimeFormatUpdate();
                  handleLocalUpdate();
                  props.handleClose();
                }}
              >
                {save}
              </Button>
            </ModalFooterActions>
          </ModalFooter>
        }
      />
    </>
  );
};

export default UserProfileModal;
