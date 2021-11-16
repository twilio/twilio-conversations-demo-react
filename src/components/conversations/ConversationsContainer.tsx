import React from "react";
import { Client } from "@twilio/conversations";
import CreateConversationButton from "./CreateConversationButton";
import ConversationsList from "./ConversationsList";
import { StyleSheet, View } from "react-native";
import { ChevronDoubleLeftIcon } from "@twilio-paste/icons/esm/ChevronDoubleLeftIcon";
import { Box } from "@twilio-paste/core";

interface ConvosContainerProps {
  client?: Client;
}

const ConversationsContainer: React.FC<ConvosContainerProps> = (
  props: ConvosContainerProps
) => (
  <>
    <View style={styles.newConvoButton}>
      <CreateConversationButton client={props.client} />
    </View>
    <View style={styles.convoList}>
      <ConversationsList />
    </View>
    <View style={styles.collapseButton}>
      <Box paddingTop="space30">
        <ChevronDoubleLeftIcon decorative={false} title="Collapse" />
      </Box>
    </View>
  </>
);

const styles = StyleSheet.create({
  convoList: {
    width: 320,
    overflow: "scroll",
    position: "absolute",
    top: 65,
    bottom: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#CACDD8",
  },
  collapseButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 320,
    paddingTop: 16,
    paddingBottom: 20,
    paddingRight: 16,
    paddingLeft: 16,
    position: "absolute",
    bottom: 0,
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
