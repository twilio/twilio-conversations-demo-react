import { useState } from "react";
import { getToken } from "../../api";
import { InputType } from "../../types";
import { ProductConversationsIcon } from "@twilio-paste/icons/esm/ProductConversationsIcon";
import ModalInputField from "../modals/ModalInputField";
import { Button } from "@twilio-paste/button";
import { StyleSheet, View, Text } from "react-native";
import { Box } from "@twilio-paste/core";
import axios from "axios";

type SetTokenType = (token: string) => void;

interface LoginProps {
  setToken: SetTokenType;
}

async function login(
  username: string,
  password: string,
  setToken: (token: string) => void
): Promise<string> {
  let token: string | undefined;

  try {
    token = await getToken(username.trim(), password);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return error.response.data ?? "Authentication error.";
    }

    return "Something went wrong.";
  }

  if (token === "") {
    return "Something went wrong.";
  }

  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
  setToken(token);

  return "";
}

const Login: React.FC<LoginProps> = (props: LoginProps) => {
  const [isFormDirty, setFormDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <ProductConversationsIcon
            decorative={true}
            size="sizeIcon90"
            style={styles.logo}
            color="colorTextInverse"
          />
        </View>
        <Text style={styles.title}>Twilio Conversations</Text>
        <Text style={styles.subTitle}>Demo experience</Text>
        <View style={styles.form}>
          <View style={styles.userInput}>
            <ModalInputField
              label="Username"
              placeholder=""
              isFocused={true}
              error={
                isFormDirty && !username.trim()
                  ? "Enter a username to sign in."
                  : ""
              }
              input={username}
              onBlur={() => setFormDirty(true)}
              onChange={setUsername}
            />
          </View>
          <View style={styles.passwordInput}>
            <ModalInputField
              label="Password"
              placeholder=""
              error={
                isFormDirty && !password
                  ? "Enter a password to sign in."
                  : formError ?? ""
              }
              input={password}
              onChange={setPassword}
              inputType={showPassword ? InputType.Text : InputType.Password}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </View>
          <View style={styles.button}>
            <Button
              disabled={!username || !password}
              variant="primary"
              onClick={async () => {
                const error = await login(username, password, props.setToken);
                if (error) {
                  setFormError(error);
                }
              }}
            >
              Sign in
            </Button>
          </View>
        </View>
      </View>
      <View style={styles.background}>
        <Box
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "#06033a",
            transform: "skewY(-12deg)",
            transformOrigin: "top right",
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#001489",
  },
  logo: {
    width: "42px",
  },
  title: {
    paddingTop: 2,
    color: "#FFFFFF",
    fontFamily: "Inter",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  subTitle: {
    color: "#AEB2C1",
    fontFamily: "Inter",
    fontSize: 14,
    lineHeight: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  userInput: {
    paddingTop: 24,
    width: 320,
    marginLeft: 24,
    marginRight: 24,
  },
  passwordInput: {
    paddingTop: 16,
    width: 320,
    marginLeft: 24,
    marginRight: 24,
  },
  button: {
    width: 320,
    fontFamily: "Inter",
    paddingTop: 32,
    paddingBottom: 24,
    marginLeft: 24,
    marginRight: 24,
  },
  background: {
    position: "absolute",
    alignSelf: "flex-end",
    top: "50%",
    height: "50%",
    width: "100%",
    backgroundColor: "#001489",
    overflow: "hidden",
    zIndex: -1,
  },
});

export default Login;
