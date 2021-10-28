import React from "react";
import { bindActionCreators } from "redux";
import { useDispatch } from "react-redux";
import { Client } from "@twilio/conversations";
import { actionCreators } from "../../store";
import CreateConversationButton from "./CreateConversationButton";
import ConversationsList from "./ConversationsList";
import { StyleSheet, View } from "react-native";
import { ChevronDoubleLeftIcon } from "@twilio-paste/icons/esm/ChevronDoubleLeftIcon";
import { Box } from "@twilio-paste/core";
import { Button } from "@twilio-paste/button";

interface ConvosContainerProps {
  client?: Client;
}

const ConversationsContainer: React.FC<ConvosContainerProps> = (
  props: ConvosContainerProps
) => {
  const dispatch = useDispatch();
  const { logout } = bindActionCreators(actionCreators, dispatch);

  return (
    <>
      <View style={styles.newConvoButton}>
        <CreateConversationButton client={props.client} />
      </View>
      <View style={styles.convoList}>
        <ConversationsList />
      </View>
      <View style={styles.logOutButton}>
        <Box paddingRight="space40" width="260px" height="100%">
          <Button variant="secondary" onClick={logout} fullWidth>
            Sign out
          </Button>
        </Box>
        <Box paddingTop="space30">
          <ChevronDoubleLeftIcon decorative={false} title="Collapse" />
        </Box>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  convoList: {
    width: 320,
    overflow: "scroll",
    position: "absolute",
    top: 65,
    bottom: 60,
  },
  logOutButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 320,
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 16,
    paddingLeft: 16,
    position: "absolute",
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#CACDD8",
  },
  newConvoButton: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 16,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#CACDD8",
  },
});

export default ConversationsContainer;
