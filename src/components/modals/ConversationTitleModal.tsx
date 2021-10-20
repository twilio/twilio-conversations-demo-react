import React, { useEffect, useState } from "react";
import ModalInputField from "./ModalInputField";
import { ModalFooter, ModalFooterActions } from "@twilio-paste/modal";
import { ModalBody, Box } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";

import { ActionName } from "../../types";
import ConvoModal from "./ConvoModal";

interface ConversationTitleModalProps {
  title: string;
  isModalOpen: boolean;
  onCancel: () => void;
  onSave: (title: string) => Promise<void>;
  type: string;
}

const ConversationTitleModal: React.FC<ConversationTitleModalProps> = (
  props: ConversationTitleModalProps
) => {
  const [title, setTitle] = useState(props.title);
  const [error, setError] = useState("");
  const [isFormDirty, setFormDirty] = useState(false);

  useEffect(() => {
    if (props.title !== title) {
      setTitle(props.title);
    }
  }, [props.title]);

  const onCancel = () => {
    setError("");
    setTitle(props.title);
    props.onCancel();
  };

  const onSave = async () => {
    if (title.length < 1) {
      return;
    }

    setError("");

    try {
      await props.onSave(title);
    } catch (e) {
      setError(e.message ?? "");
    }

    setTitle(props.title);
  };

  return (
    <>
      <ConvoModal
        title={props.type == "new" ? "New Conversation" : "Edit Conversation"}
        isModalOpen={props.isModalOpen}
        handleClose={onCancel}
        modalBody={
          <ModalBody>
            <Box as="form">
              <ModalInputField
                isFocused={true}
                label="Conversation name"
                input={title}
                placeholder="Conversation name"
                onChange={setTitle}
                onBlur={() => setFormDirty(true)}
                error={
                  error
                    ? error
                    : isFormDirty && !title
                    ? "Add a conversation title to create a conversation."
                    : ""
                }
              />
            </Box>
          </ModalBody>
        }
        modalFooter={
          <ModalFooter>
            <ModalFooterActions>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                disabled={title.length < 1 || title.trim() === props.title}
                variant="primary"
                onClick={onSave}
              >
                {ActionName.Save}
              </Button>
            </ModalFooterActions>
          </ModalFooter>
        }
      />
    </>
  );
};

export default ConversationTitleModal;
