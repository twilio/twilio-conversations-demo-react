import React, { useState } from "react";
import Client from "@twilio/conversations";
import ConversationTitleModal from "../modals/ConversationTitleModal";
import { addConversation } from "../../api";
import { Button } from "@twilio-paste/button";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store";
import { Conversation } from "@twilio/conversations/lib/conversation";

interface NewConvoProps {
  client?: Client;
}

const CreateConversationButton: React.FC<NewConvoProps> = (
  props: NewConvoProps
) => {
  const dispatch = useDispatch();
  const { updateCurrentConversation } = bindActionCreators(
    actionCreators,
    dispatch
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(true);

  return (
    <>
      <Button variant="secondary" onClick={handleOpen}>
        <PlusIcon decorative={false} title="Add convo" />
        Create New Conversation
      </Button>
      <ConversationTitleModal
        title=""
        type="new"
        isModalOpen={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        onSave={(title: string) =>
          addConversation(title, props.client).then((convo: Conversation) => {
            setIsModalOpen(false);
            updateCurrentConversation(convo.sid);
          })
        }
      />
    </>
  );
};

export default CreateConversationButton;
