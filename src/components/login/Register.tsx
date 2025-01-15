import React, { useState } from "react";
import { Button } from "@twilio-paste/button";
import { Box, Text } from "@twilio-paste/core";
import { ProductConversationsIcon } from "@twilio-paste/icons/esm/ProductConversationsIcon";
import { signUp } from "../../supabase";
import ModalInputField from "../modals/ModalInputField";
import { InputType } from "../../types";
import styles from "../../styles";
import TwilioLogo from "../icons/TwilioLogo";

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      await signUp(email, password);
      onRegisterSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <Box style={styles.loginForm}>
      <Box style={styles.userInput}>
        <ModalInputField
          label="Email"
          placeholder=""
          isFocused={true}
          input={email}
          onChange={setEmail}
          error={error}
          id="register-email"
        />
      </Box>
      <Box style={styles.passwordInput}>
        <ModalInputField
          label="Password"
          placeholder=""
          input={password}
          onChange={setPassword}
          inputType={InputType.Password}
          id="register-password"
        />
      </Box>
      <Box style={styles.loginButton}>
        <Button
          fullWidth
          variant="primary"
          onClick={handleRegister}
          disabled={!email || !password}
        >
          Create Account
        </Button>
      </Box>
      <Box marginTop="space40" textAlign="center">
        <Text as="span" color="colorTextInverse">
          Already have an account?{" "}
          <Button variant="link" onClick={onRegisterSuccess}>
            Sign in here
          </Button>
        </Text>
      </Box>
    </Box>
  );
};

export default Register;
