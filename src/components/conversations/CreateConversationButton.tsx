import React, { useState } from "react";
import { Client } from "@twilio/conversations";

import ConversationTitleModal from "../modals/ConversationTitleModal";
import { addConversation } from "../../api";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store";

interface NewConvoProps {
  client?: Client;
  collapsed: boolean;
}

const CreateConversationButton: React.FC<NewConvoProps> = (
  props: NewConvoProps
) => {
  const dispatch = useDispatch();
  const { updateCurrentConversation, addNotifications, updateParticipants } =
    bindActionCreators(actionCreators, dispatch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(true);

  return (
    <>
      <Button fullWidth variant="secondary" onClick={handleOpen}>
        <PlusIcon decorative={false} title="Add convo" />
        {!props.collapsed ? "Create New Conversation" : null}
      </Button>
      <ConversationTitleModal
        title=""
        type="new"
        isModalOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onSave={async (title: string) => {
          const convo = await addConversation(
            title,
            updateParticipants,
            props.client,
            addNotifications
          );
          setIsModalOpen(false);
          updateCurrentConversation(convo.sid);
        }}
      />
    </>
  );
};

export default CreateConversationButton;
