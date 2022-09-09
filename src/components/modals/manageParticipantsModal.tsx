import {
  Anchor,
  Box,
  ModalBody,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@twilio-paste/core";
import { MenuButton, Menu, MenuItem, useMenuState } from "@twilio-paste/menu";
import { Text } from "@twilio-paste/text";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import { Avatar } from "@twilio-paste/avatar";
import { UserIcon } from "@twilio-paste/icons/cjs/UserIcon";

import ConvoModal from "./ConvoModal";
import { Content } from "../../types";
import { ReduxParticipant } from "../../store/reducers/participantsReducer";

interface ManageParticipantsModalProps {
  participantsCount: number;
  handleClose: () => void;
  isModalOpen: boolean;
  title: string;
  onClick: (content: Content) => void;
  participantsList: ReduxParticipant[];
  onParticipantRemove: (participant: ReduxParticipant) => void;
}

const ManageParticipantsModal: React.FC<ManageParticipantsModalProps> = (
  props: ManageParticipantsModalProps
) => {
  const menu = useMenuState({ placement: "bottom-start" });

  return (
    <>
      <ConvoModal
        handleClose={() => props.handleClose()}
        isModalOpen={props.isModalOpen}
        title={props.title}
        modalBody={
          <ModalBody>
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "6px",
              }}
            >
              <Box
                fontFamily="fontFamilyText"
                fontWeight="fontWeightBold"
                fontSize="fontSize30"
                lineHeight="lineHeight60"
              >
                Participants ({props.participantsCount})
              </Box>
              <MenuButton {...menu} variant="secondary">
                Add Participant <ChevronDownIcon decorative size="sizeIcon10" />
              </MenuButton>
              <Menu {...menu} aria-label="Preferences">
                <MenuItem
                  {...menu}
                  onClick={() => props.onClick(Content.AddSMS)}
                >
                  SMS Participant
                </MenuItem>
                <MenuItem
                  {...menu}
                  onClick={() => {
                    props.onClick(Content.AddWhatsApp);
                  }}
                >
                  WhatsApp Participant
                </MenuItem>
                <MenuItem
                  {...menu}
                  onClick={() => {
                    props.onClick(Content.AddChat);
                  }}
                >
                  Chat Participant
                </MenuItem>
              </Menu>
            </Box>
            <Box
              style={{
                marginTop: "12px",
                overflow: "hidden",
                overflowY: "auto",
                maxHeight: "500px",
              }}
            >
              <Table>
                <THead hidden={true}>
                  <Tr>
                    <Th width="size10" style={{ width: "50px" }} />
                    <Th width="size40" textAlign="left" />
                    <Th textAlign="right" />
                  </Tr>
                </THead>
                <TBody>
                  {props.participantsList.length ? (
                    props.participantsList.map((user) => (
                      <Tr key={user.sid}>
                        <Td width="size20">
                          <Avatar
                            size="sizeIcon80"
                            name={
                              (user.identity ||
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                user.attributes["friendlyName"]) ??
                              "unknown"
                            }
                            icon={UserIcon}
                          />
                        </Td>
                        <Td textAlign="left">
                          <Text as="span" textAlign="left">
                            {user.type == "chat"
                              ? user.identity
                              : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                (user.attributes["friendlyName"] as string) ??
                                "unknown"}
                          </Text>
                        </Td>
                        <Td textAlign="right">
                          {user.identity !==
                          localStorage.getItem("username") ? (
                            <Anchor
                              href="#"
                              onClick={() => props.onParticipantRemove(user)}
                            >
                              Remove
                            </Anchor>
                          ) : null}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "400px",
                      }}
                    >
                      <Box
                        style={{
                          color: "#606B85",
                        }}
                      >
                        <Box
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            paddingBottom: "12px",
                          }}
                        >
                          <UserIcon
                            decorative={false}
                            title="No participants"
                            size="sizeIcon40"
                            style={{
                              color: "#606B85",
                            }}
                          />
                        </Box>
                        <Text
                          as="p"
                          fontSize="fontSize40"
                          style={{
                            color: "#606B85",
                          }}
                        >
                          No participants
                        </Text>
                      </Box>
                    </Box>
                  )}
                </TBody>
              </Table>
            </Box>
          </ModalBody>
        }
      />
    </>
  );
};

export default ManageParticipantsModal;
