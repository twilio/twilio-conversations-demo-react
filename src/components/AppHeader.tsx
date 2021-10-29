import { ProductConversationsIcon } from "@twilio-paste/icons/esm/ProductConversationsIcon";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { Avatar } from "@twilio-paste/avatar";
import { Menu, MenuButton, useMenuState, MenuItem } from "@twilio-paste/menu";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import React from "react";
import styles from "../styles";

type AppHeaderProps = {
  user: string;
  onSignOut: () => void;
};
const AppHeader: React.FC<AppHeaderProps> = ({ user, onSignOut }) => {
  const menu = useMenuState();
  return (
    <div style={styles.appHeader}>
      <div style={styles.flex}>
        <ProductConversationsIcon
          color="colorTextInverse"
          size="sizeIcon70"
          decorative={false}
          title="app logo"
        />
        <div style={styles.appLogoTitle}>Twilio Conversations</div>
      </div>
      <div style={styles.userTile}>
        <Avatar size="sizeIcon70" name="avatar example" icon={UserIcon} />
        <div
          style={{
            padding: "0 10px",
          }}
        >
          {user}
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
        </Menu>
      </div>
    </div>
  );
};

export default AppHeader;
