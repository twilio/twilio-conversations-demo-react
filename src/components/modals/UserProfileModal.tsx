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
  Input,
  Text,
} from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";
import React, { useState, useEffect } from "react";
import { User } from "@twilio/conversations";
import { updateFriendlyName } from "../../api";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, AppState } from "../../store";
import { getTranslation, languageOptions } from "./../../utils/localUtils";
import { getUserSettings, updateUserSettings } from "../../supabase/queries";
import { useToaster } from "@twilio-paste/core";

interface UserProfileModalProps {
  isModalOpen: boolean;
  handleClose: () => void;
  user?: User;
}

const DEFAULT_PHONE = "+18447256591";

const UserProfileModal: React.FC<UserProfileModalProps> = (props) => {
  const identity = props.user?.identity ?? "";
  const dispatch = useDispatch();
  const toaster = useToaster();

  const [friendlyName, setFriendlyName] = useState(
    props.user?.friendlyName ?? ""
  );
  const [businessSettings, setBusinessSettings] = useState({
    business_name: "",
    twilio_phone_number: DEFAULT_PHONE,
  });

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

  // Translations
  const userProfileTxt = getTranslation(local, "userProfileTxt");
  const identityTxt = getTranslation(local, "identityTxt");
  const friendlyNameTxt = getTranslation(local, "friendlyNameTxt");
  const selectLocal = getTranslation(local, "selectLocal");
  const clockFormat = getTranslation(local, "clockFormat");
  const clockHelper = getTranslation(local, "clockHelper");
  const save = getTranslation(local, "save");
  const cancel = getTranslation(local, "cancel");

  useEffect(() => {
    loadBusinessSettings();
  }, []);

  const loadBusinessSettings = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setBusinessSettings({
          business_name: settings.business_name || "",
          twilio_phone_number: settings.twilio_phone_number || DEFAULT_PHONE,
        });
      }
    } catch (error) {
      console.error("Error loading business settings:", error);
      toaster.push({
        message: "Failed to load settings",
        variant: "error",
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      // Save friendly name
      await updateFriendlyName(friendlyName, props.user);

      // Save time format and locale
      updateTimeFormat(on);
      updateLocal(selectedLocal);

      // Save business settings
      await updateUserSettings({
        business_name: businessSettings.business_name,
        twilio_phone_number: businessSettings.twilio_phone_number,
      });

      toaster.push({
        message: "Settings saved successfully",
        variant: "success",
      });

      props.handleClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      toaster.push({
        message: "Failed to save settings",
        variant: "error",
      });
    }
  };

  return (
    <ConvoModal
      handleClose={props.handleClose}
      isModalOpen={props.isModalOpen}
      title={userProfileTxt}
      modalBody={
        <ModalBody>
          <Box
            as="form"
            onKeyPress={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                await handleSaveAll();
              }
            }}
          >
            <ModalInputField
              label={identityTxt}
              input={identity}
              onChange={() => null}
              readonly={true}
            />
            <br />
            <ModalInputField
              isFocused={true}
              label={friendlyNameTxt}
              input={friendlyName}
              onChange={setFriendlyName}
              maxLength={255}
            />
            <br />
            <Label htmlFor="business_name" required>
              Business Name
            </Label>
            <Input
              id="business_name"
              type="text"
              value={businessSettings.business_name}
              onChange={(e) =>
                setBusinessSettings((prev) => ({
                  ...prev,
                  business_name: e.target.value,
                }))
              }
              placeholder="Enter your business name"
            />
            <br />
            <Label htmlFor="twilio_phone_number" required>
              Twilio Phone Number
            </Label>
            <Input
              id="twilio_phone_number"
              type="tel"
              value={businessSettings.twilio_phone_number}
              onChange={(e) =>
                setBusinessSettings((prev) => ({
                  ...prev,
                  twilio_phone_number: e.target.value,
                }))
              }
              placeholder="+1 (XXX) XXX-XXXX"
            />
            <Text as="p" fontSize="fontSize20" color="colorTextWeak">
              Default number: {DEFAULT_PHONE}
            </Text>
            <br />
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
            <br />
            <Switch
              checked={on}
              onChange={() => setOn(!on)}
              helpText={clockHelper}
            >
              {clockFormat}
            </Switch>
          </Box>
        </ModalBody>
      }
      modalFooter={
        <ModalFooter>
          <ModalFooterActions justify="start">
            <Button variant="secondary" onClick={props.handleClose}>
              {cancel}
            </Button>
          </ModalFooterActions>
          <ModalFooterActions>
            <Button variant="primary" onClick={handleSaveAll}>
              {save}
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      }
    />
  );
};

export default UserProfileModal;
