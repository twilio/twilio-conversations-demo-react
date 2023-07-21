import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { Avatar } from "./Avatar";
import { Text } from "@twilio-paste/core";
import { Menu, MenuButton, useMenuState, MenuItem } from "@twilio-paste/menu";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import React, { useMemo, useState } from "react";
import styles from "../styles";
import { Client, ConnectionState, User } from "@twilio/conversations";
import { LogoTwilioIcon } from "@twilio-paste/icons/esm/LogoTwilioIcon";
import UserProfileModal from "./modals/UserProfileModal";
import { readUserProfile } from "../api";

type AppHeaderProps = {
  user: string;
  onSignOut: () => void;
  connectionState: ConnectionState;
  client?: Client;
};
const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut,
  connectionState,
  client,
}) => {
  const menu = useMenuState();

  const [showUserProfileModal, setUserProfileModal] = useState(false);

  const [userProfile, setUserProfile] = useState<User | undefined>(undefined);

  const handleUserProfileModalClose = () => setUserProfileModal(false);

  const label: "online" | "connecting" | "offline" = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return "online";
      case "connecting":
        return "connecting";
      default:
        return "offline";
    }
  }, [connectionState]);

  const handleUserProfileModalOpen = async () => {
    const userProfileTemp = await readUserProfile(user, client);
    setUserProfile(userProfileTemp);
    setUserProfileModal(true);
  };

  return (
    <div style={styles.appHeader}>
      <div style={styles.flex}>
        <div style={styles.appLogoWrapper}>
          <LogoTwilioIcon
            decorative={false}
            color={"colorTextBrandHighlight"}
            size={"sizeIcon40"}
            title="app logo"
          />
        </div>
        <div style={styles.appLogoTitle}>
          Twilio Conversations
          <div style={styles.appLogoSubTitle}>Demo application</div>
        </div>
      </div>
      <div style={styles.userTile}>
        <Avatar name={user} />
        <div
          style={{
            padding: "0 10px",
          }}
        >
          <Text as="span" style={styles.userName}>
            {user}
          </Text>
          <Text
            as="span"
            color={
              label === "online"
                ? "colorTextPrimaryWeak"
                : label === "connecting"
                ? "colorTextIconBusy"
                : "colorTextWeaker"
            }
            style={styles.userStatus}
          >
            {label === "online"
              ? "Online"
              : label === "connecting"
              ? "Connecting…"
              : "Offline"}
          </Text>
        </div>
        <MenuButton {...menu} variant="link" size="reset">
          <ChevronDownIcon
            color="colorTextInverse"
            decorative={false}
            title="Settings"
          />
        </MenuButton>
        <Menu {...menu} aria-label="Preferences">
          <MenuItem {...menu} onClick={onSignOut}>
            Sign Out
          </MenuItem>
          <MenuItem {...menu} onClick={handleUserProfileModalOpen}>
            User Profile
          </MenuItem>
        </Menu>
      </div>
      {showUserProfileModal && (
        <UserProfileModal
          isModalOpen={showUserProfileModal}
          handleClose={handleUserProfileModalClose}
          user={userProfile}
        ></UserProfileModal>
      )}
    </div>
  );
};

export default AppHeader;
