import React, { useState, createRef } from "react";
import Client from "@twilio/conversations";
import SettingsMenu from "./SettingsMenu";
import { Conversation } from "@twilio/conversations/lib/conversation";
import ManageParticipantsModal from "../modals/manageParticipantsModal";
import { Content } from "../../types";
import { addParticipant, removeParticipant } from "../../api";
import AddChatParticipantModal from "../modals/addChatMemberModal";
import AddSMSParticipantModal from "../modals/addSMSParticipantModal";
import AddWhatsAppParticipantModal from "../modals/addWhatsAppParticipant";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../../store";
import NameChangeErrorModal from "../modals/NameChangeErrorModal";
import { SMS_PREFIX, WHATSAPP_PREFIX } from "../../constants";
import { Participant } from "@twilio/conversations/lib/participant";
import { Box, Spinner } from "@twilio-paste/core";

interface SettingsProps {
  participants: Participant[];
  client?: Client;
  convo: Conversation;
}

const Settings: React.FC<SettingsProps> = (props: SettingsProps) => {
  const [isManageParticipantOpen, setIsManageParticipantOpen] = useState(false);
  const handleParticipantClose = () => setIsManageParticipantOpen(false);

  const [isAddChatOpen, setIsAddChatOpen] = useState(false);
  // TODO: move to app loading state
  const [isLoading, setLoading] = useState(false);
  const handleChatOpen = () => setIsAddChatOpen(true);
  const handleChatClose = () => setIsAddChatOpen(false);

  const [isAddSMSOpen, setIsAddSMSOpen] = useState(false);
  const handleSMSOpen = () => setIsAddSMSOpen(true);
  const handleSMSClose = () => setIsAddSMSOpen(false);

  const [isAddWhatsAppOpen, setIsAddWhatsAppOpen] = useState(false);
  const handleWhatsAppOpen = () => setIsAddWhatsAppOpen(true);
  const handleWhatsAppClose = () => setIsAddWhatsAppOpen(false);

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const [nameProxy, setNameProxy] = useState("");
  const [errorProxy, setErrorProxy] = useState("");

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState();

  const nameInputRef = createRef<HTMLInputElement>();

  const dispatch = useDispatch();
  const { updateCurrentConversation, updateConversation } = bindActionCreators(
    actionCreators,
    dispatch
  );

  function emptyData() {
    setName("");
    setNameProxy("");
    setError("");
    setErrorProxy("");
  }

  function setErrors(errorText: string) {
    setError(errorText);
    setErrorProxy(errorText);
  }

  return (
    <>
      <SettingsMenu
        onParticipantListOpen={() => setIsManageParticipantOpen(true)}
        leaveConvo={() => {
          props.convo.leave();
          updateCurrentConversation("");
        }}
        updateConvo={(val: string) =>
          props.convo
            .updateFriendlyName(val)
            .then((convo) => {
              updateConversation(convo.sid, convo);
            })
            .catch((e) => {
              setErrorModal(e);
              setErrorModalOpen(true);
            })
        }
        conversation={props.convo}
      />
      <NameChangeErrorModal
        isOpened={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        error={errorModal}
      />
      {isManageParticipantOpen && (
        <ManageParticipantsModal
          handleClose={handleParticipantClose}
          isModalOpen={isManageParticipantOpen}
          title="Manage Participants"
          participantsCount={props.participants.length}
          participantsList={props.participants}
          onClick={(content: Content) => {
            handleParticipantClose();
            switch (content) {
              case Content.AddSMS:
                handleSMSOpen();
                return null;
              case Content.AddWhatsApp:
                handleWhatsAppOpen();
                return null;
              case Content.AddChat:
                handleChatOpen();
                return null;
              default:
                return null;
            }
          }}
          onParticipantRemove={async (participant: Participant) => {
            await removeParticipant(props.convo, participant);
          }}
        />
      )}
      {isAddSMSOpen && (
        <AddSMSParticipantModal
          name={name}
          proxyName={nameProxy}
          isModalOpen={isAddSMSOpen}
          title="Manage Participants"
          setName={(name: string) => {
            setName(name);
            setErrors("");
          }}
          setProxyName={(name: string) => {
            setNameProxy(name);
            setErrors("");
          }}
          error={error}
          errorProxy={errorProxy}
          nameInputRef={nameInputRef}
          handleClose={() => {
            emptyData();
            handleSMSClose();
          }}
          onBack={() => {
            emptyData();
            handleSMSClose();
            setIsManageParticipantOpen(true);
          }}
          action={async () => {
            const result = await addParticipant(
              SMS_PREFIX + name,
              SMS_PREFIX + nameProxy,
              false,
              props.convo
            );
            if (result.success) {
              emptyData();
              handleSMSClose();
            } else {
              setErrors(result.errorText ?? "Enter a valid phone number");
            }
          }}
        />
      )}
      {isAddWhatsAppOpen && (
        <AddWhatsAppParticipantModal
          name={name}
          proxyName={nameProxy}
          isModalOpen={isAddWhatsAppOpen}
          title="Manage Participants"
          setName={(name: string) => {
            setName(name);
            setErrors("");
          }}
          setProxyName={(name: string) => {
            setNameProxy(name);
            setErrors("");
          }}
          error={error}
          errorProxy={errorProxy}
          nameInputRef={nameInputRef}
          handleClose={() => {
            emptyData();
            handleWhatsAppClose();
          }}
          onBack={() => {
            emptyData();
            handleWhatsAppClose();
            setIsManageParticipantOpen(true);
          }}
          action={async () => {
            const result = await addParticipant(
              WHATSAPP_PREFIX + name,
              WHATSAPP_PREFIX + nameProxy,
              false,
              props.convo
            );
            if (result.success) {
              emptyData();
              handleWhatsAppClose();
            } else {
              setErrors(result.errorText ?? "Enter a valid phone number");
            }
          }}
        />
      )}
      {isAddChatOpen && (
        <AddChatParticipantModal
          name={name}
          isModalOpen={isAddChatOpen}
          title="Manage Participants"
          setName={(name: string) => {
            setName(name);
            setErrors("");
          }}
          error={error}
          nameInputRef={nameInputRef}
          handleClose={() => {
            emptyData();
            handleChatClose();
          }}
          onBack={() => {
            emptyData();
            handleChatClose();
            setIsManageParticipantOpen(true);
          }}
          action={async () => {
            const result = await addParticipant(
              name,
              nameProxy,
              true,
              props.convo
            );
            if (result.success) {
              emptyData();
            } else {
              setError(result.errorText ?? "Enter a valid username");
            }
          }}
        />
      )}
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          height="100%"
          width="100%"
        >
          <Spinner size="sizeIcon110" decorative={false} title="Loading" />
        </Box>
      ) : null}
    </>
  );
};

export default Settings;
