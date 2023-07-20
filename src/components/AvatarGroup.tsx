import { AvatarGroup as PasteAvatarGroup } from "@twilio-paste/avatar";
import { UserIcon } from "@twilio-paste/icons/cjs/UserIcon";
import { IconSize } from "@twilio-paste/style-props";
import React from "react";
import { ReduxParticipant } from "../store/reducers/participantsReducer";
import Avatar from "./Avatar";

type AvatarGroupProps = {
  maxDisplayed?: number;
  participants: ReduxParticipant[];
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  maxDisplayed,
  participants,
}) => {
  const children: JSX.Element[] = participants.map((participant) => {
    let participantName: string | null = participant.identity;
    if (participantName == null) {
      participantName = "placeholder";
    }
    return <Avatar name={participantName} />;
  });

  return (
    <React.Fragment>
      <PasteAvatarGroup
        size={"sizeIcon70"}
        variant="user"
        children={children}
      />
    </React.Fragment>
  );
};

export { AvatarGroup };
export default AvatarGroup;
