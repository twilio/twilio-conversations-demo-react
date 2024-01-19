import React, { useState } from "react";
import { Client } from "@twilio/conversations";
import { ChevronDoubleLeftIcon } from "@twilio-paste/icons/esm/ChevronDoubleLeftIcon";
import { Box, Input } from "@twilio-paste/core";
import { ChevronDoubleRightIcon } from "@twilio-paste/icons/esm/ChevronDoubleRightIcon";

import CreateConversationButton from "./CreateConversationButton";
import ConversationsList from "./ConversationsList";
import styles from "../../styles";

import { useDispatch, useSelector } from "react-redux";
import { filterConversations } from "./../../store/action-creators";
import { AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";

interface ConvosContainerProps {
  client?: Client;
}

const ConversationsContainer: React.FC<ConvosContainerProps> = (
  props: ConvosContainerProps
) => {
  const [listHidden, hideList] = useState(false);
  const dispatch = useDispatch();

  const local = useSelector((state: AppState) => state.local);
  const search = getTranslation(local, "convoSearch");

  const handleSearch = (searchString: string) => {
    dispatch(filterConversations(searchString));
  };

  return (
    <Box
      style={
        listHidden
          ? { ...styles.convosWrapper, ...styles.collapsedList }
          : styles.convosWrapper
      }
    >
      <Box style={styles.newConvoButton}>
        <CreateConversationButton
          client={props.client}
          collapsed={listHidden}
        />
        <Box marginTop="space60">
          <Input
            aria-describedby="convo_string_search"
            id="convoString"
            name="convoString"
            type="text"
            placeholder={search}
            onChange={(e) => handleSearch(e.target.value)}
            required
            autoFocus
          />
        </Box>
      </Box>
      <Box style={styles.convoList}>
        {!listHidden ? <ConversationsList /> : null}
      </Box>
      <Box style={styles.collapseButtonBox}>
        <Box
          paddingTop="space30"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
          }}
          onClick={() => hideList(!listHidden)}
        >
          {listHidden ? (
            <ChevronDoubleRightIcon decorative={false} title="Collapse" />
          ) : (
            <ChevronDoubleLeftIcon decorative={false} title="Collapse" />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConversationsContainer;
