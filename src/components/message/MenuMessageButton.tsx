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

interface MenuMessageButtonProps {
  menuElements: MenuElement[];
}

const MenuMessageButton: React.FC<MenuMessageButtonProps> = (
  props: MenuMessageButtonProps
) => {
  const menu = useMenuState();
  return (
    <Box>
      <MenuButton {...menu} variant="link" size="reset">
        <Box style={styles.rotateIcon}>
          <MoreIcon decorative={true} />
        </Box>
      </MenuButton>
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
                menu.hide();
              }}
              disabled={!menuElement.enabled}
            >
              {menuElement.customComponent}
              <Box>{menuElement.label}</Box>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default MenuMessageButton;
