import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";
import { store } from "./store";
import { Theme } from "@twilio-paste/core/theme";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  app: {
    flex: 1,
    height: "100%",
    width: "100%",
    position: "absolute",
  },
});

ReactDOM.render(
  <View style={styles.app}>
    <React.StrictMode>
      <Provider store={store}>
        <Theme.Provider theme="default">
          <View style={styles.app}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
              rel="stylesheet"
            ></link>
            <App />
          </View>
        </Theme.Provider>
      </Provider>
    </React.StrictMode>
  </View>,
  document.getElementById("root")
);
