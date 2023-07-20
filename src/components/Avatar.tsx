import { Avatar as PasteAvatar } from "@twilio-paste/avatar";
import { UserIcon } from "@twilio-paste/icons/cjs/UserIcon";
import { IconSize } from "@twilio-paste/style-props";

type AvatarProps = {
  name: string;
  size?: IconSize;
};

// name = friendlyName ?? identity
const Avatar: React.FC<AvatarProps> = ({ name, size }) => {
	if (name.startsWith("whatsapp:") || name.startsWith("sms:") || name.startsWith("+")) {
		return <PasteAvatar size={size ?? "sizeIcon70"} variant="user" name={name} icon={UserIcon} />
	}
	return <PasteAvatar size={size ?? "sizeIcon70"} variant="user" name={name} />
	// use src for specified avatar images - once we have them!
};

export { Avatar };
export default Avatar;
