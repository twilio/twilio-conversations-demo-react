import React, { useState } from "react";
import {
  MenuButton,
  Menu,
  MenuItem,
  MenuSeparator,
  useMenuState,
} from "@twilio-paste/menu";
import {
  MediaObject,
  MediaFigure,
  MediaBody,
} from "@twilio-paste/media-object";
import { MoreIcon } from "@twilio-paste/icons/esm/MoreIcon";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { EditIcon } from "@twilio-paste/icons/esm/EditIcon";
import { ArrowBackIcon } from "@twilio-paste/icons/esm/ArrowBackIcon";
import { Text } from "@twilio-paste/text";
import { StyleSheet, View } from "react-native";
import ConversationTitleModal from "../modals/ConversationTitleModal";
import { Conversation } from "@twilio/conversations/lib/conversation";

interface SettingsMenuProps {
  leaveConvo: () => void;
  updateConvo: (val: string) => Promise<void>;
  conversation: Conversation;
  onParticipantListOpen: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = (
  props: SettingsMenuProps
) => {
  const menu = useMenuState();
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const { friendlyName } = props.conversation;

  return (
    <View style={styles.settingsWrapper}>
      <MenuButton {...menu} variant="link" size="reset">
        <MoreIcon decorative={false} title="Settings" />
      </MenuButton>
      <Menu {...menu} aria-label="Preferences">
        <View style={styles.optionWrapper}>
          <MenuItem {...menu}>
            <MediaObject verticalAlign="center">
              <MediaFigure spacing="space20">
                <EditIcon
                  decorative={false}
                  title="edit"
                  color="colorTextIcon"
                />
              </MediaFigure>
              <MediaBody onClick={() => setIsTitleModalOpen(true)}>
                Edit Conversation name
              </MediaBody>
              <ConversationTitleModal
                title={friendlyName}
                type="edit"
                isModalOpen={isTitleModalOpen}
                onCancel={() => {
                  setIsTitleModalOpen(false);
                }}
                onSave={async (title) => {
                  await props.updateConvo(title);
                  setIsTitleModalOpen(false);
                }}
              />
            </MediaObject>
          </MenuItem>
        </View>
        {/*<MenuItem {...menu}>*/}
        {/*  <MediaObject verticalAlign="center">*/}
        {/*    <MediaFigure spacing="space20">*/}
        {/*      <img src="NotificationsOn.png" />*/}
        {/*    </MediaFigure>*/}
        {/*    <MediaBody>Unmute Conversation</MediaBody>*/}
        {/*  </MediaObject>*/}
        {/*</MenuItem>*/}
        <MenuItem {...menu} onClick={props.onParticipantListOpen}>
          <MediaObject verticalAlign="center">
            <MediaFigure spacing="space20">
              <UserIcon
                decorative={false}
                title="information"
                color="colorTextIcon"
              />
            </MediaFigure>
            <MediaBody>Manage Participants</MediaBody>
          </MediaObject>
        </MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu} onClick={props.leaveConvo}>
          <MediaObject verticalAlign="center">
            <MediaFigure spacing="space20">
              <ArrowBackIcon
                decorative={false}
                title="information"
                color="colorTextError"
              />
            </MediaFigure>
            <MediaBody>
              <Text as="span" color="colorTextError">
                Leave Conversation
              </Text>
            </MediaBody>
          </MediaObject>
        </MenuItem>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsWrapper: {
    zIndex: 1,
    paddingTop: 22,
  },
  optionWrapper: {
    width: 232,
  },
});

export default SettingsMenu;
