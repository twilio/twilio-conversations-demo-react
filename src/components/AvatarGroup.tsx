import React from "react";
import { AvatarGroup as PasteAvatarGroup } from "@twilio-paste/avatar";
import Avatar from "./Avatar";
import { IconSize } from "@twilio-paste/style-props";

type AvatarGroupProps = {
  names: string[];
  size?: IconSize;
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({ names, size }) => {
  return (
    <PasteAvatarGroup
      size={size ?? "sizeIcon70"}
      variant="user"
      children={names.map((name, index) => (
        <Avatar name={name} size={size} key={index} />
      ))}
    />
  );
};

export { AvatarGroup };
export default AvatarGroup;
