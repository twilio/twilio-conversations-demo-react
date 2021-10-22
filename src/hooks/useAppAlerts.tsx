import React, { useEffect, useState } from "react";
import { Alert, Box, Text } from "@twilio-paste/core";
import { CONNECTION_ERROR_MESSAGE } from "../constants";

const useAppAlert = (): [boolean, React.FC] => {
  const [alertVisible, setAlertVisible] = useState(!window.navigator.onLine);

  useEffect(() => {
    setAlertVisible(!window.navigator.onLine);
  }, [window.navigator.onLine]);

  const AlertComponent = () => (
    <Box hidden={!alertVisible}>
      <Alert variant="error">
        <Text as="span">{CONNECTION_ERROR_MESSAGE}</Text>
      </Alert>
    </Box>
  );

  return [alertVisible, AlertComponent];
};

export default useAppAlert;
