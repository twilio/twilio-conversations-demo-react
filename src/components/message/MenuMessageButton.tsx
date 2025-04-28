import { Box } from "@twilio-paste/core";
import { MoreIcon } from "@twilio-paste/icons/esm/MoreIcon";
import {
  Menu,
  MenuButton,
  MenuItem,
  useMenuState,
} from "@twilio-paste/core/menu";
import styles from "../../styles";
import { MenuElement } from "../../types";
import React from "react";

interface MenuMessageButtonProps {
  menuElements: MenuElement[];
}

const MenuMessageButton: React.FC<MenuMessageButtonProps> = (
  props: MenuMessageButtonProps
) => {
  const menu = useMenuState();
  const handleCloseMenu = () => {
    menu.hide();
  };

  return (
    <Box>
      <Box
        style={{
          padding: "6px 10px",
          border: "1px solid #8891AA",
          borderRadius: 4,
          maxWidth: 28,
          maxHeight: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "4px",
        }}
      >
        <MenuButton {...menu} variant="link" size="reset">
          <Box style={styles.rotateIcon}>
            <MoreIcon decorative={true} />
          </Box>
        </MenuButton>
      </Box>
      <Menu {...menu} aria-label="Message Options">
        {props.menuElements.map((menuElement) => {
          return (
            <MenuItem
              key={menuElement.id}
              {...menu}
              onClick={() => {
                if (menuElement.onClick) {
                  menuElement.onClick();
                }
                if (menuElement.hideOnClick) {
                  handleCloseMenu();
                }
              }}
              disabled={!menuElement.enabled}
            >
              {menuElement.customComponent &&
              typeof menuElement.customComponent === "function"
                ? menuElement.customComponent(handleCloseMenu)
                : menuElement.customComponent}
              {menuElement.label && <Box as="span">{menuElement.label}</Box>}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default MenuMessageButton;
