import { Avatar as PasteAvatar } from "@twilio-paste/avatar";
import { UserIcon } from "@twilio-paste/icons/cjs/UserIcon";
import type { IconSize } from "@twilio-paste/style-props";
import { Tooltip } from "@twilio-paste/core";

type AvatarProps = {
  name: string;
  size?: IconSize;
};

// name = friendlyName ?? identity
const Avatar: React.FC<AvatarProps> = ({ name, size }) => {
  if (
    name.startsWith("whatsapp:") ||
    name.startsWith("sms:") ||
    name.startsWith("+")
  ) {
    return (
      <Tooltip text={name} placement={"bottom-start"}>
        <PasteAvatar
          size={size ?? "sizeIcon70"}
          variant="user"
          name={name}
          icon={UserIcon}
        />
      </Tooltip>
    );
  }
  return (
    <Tooltip text={name} placement={"bottom-start"}>
      <PasteAvatar size={size ?? "sizeIcon70"} variant="user" name={name} />
    </Tooltip>
  );
  // use src for specified avatar images - once we have them!
};

export { Avatar };
export default Avatar;
