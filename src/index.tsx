import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  useHistory,
} from "react-router-dom";
import { bindActionCreators } from "redux";
import { store } from "./store";
import { Theme } from "@twilio-paste/core/theme";
import { Box, Spinner, Heading } from "@twilio-paste/core";

import Login from "./components/login/login";
import AppContainer from "./components/AppContainer";
import { actionCreators, AppState } from "./store";
import { getToken } from "./api";
import styles from "../src/styles";

// Temporary Contacts Page Component
const ContactsPage: React.FC = () => (
  <Box padding="space60">
    <Heading as="h1" variant="heading10">
      Contacts
    </Heading>
    <Box marginTop="space60" color="colorTextWeak">
      Contact management coming soon...
    </Box>
  </Box>
);

const App = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { login, logout } = bindActionCreators(actionCreators, dispatch);
  const token = useSelector((state: AppState) => state.token);
  const history = useHistory();

  const username = localStorage.getItem("username") ?? "";
  const password = localStorage.getItem("password") ?? "";

  useEffect(() => {
    if (username && password) {
      getToken(username, password)
        .then((token) => {
          login(token);
          history.push("/conversations");
        })
        .catch(() => {
          localStorage.setItem("username", "");
          localStorage.setItem("password", "");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const setToken = (token: string) => {
    login(token);
    setLoading(false);
    history.push("/conversations");
  };

  const handleLogout = () => {
    localStorage.setItem("username", "");
    localStorage.setItem("password", "");
    logout();
    history.push("/login");
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Box style={styles.app}>
      <Switch>
        <Route exact path="/login">
          {token ? (
            <Redirect to="/conversations" />
          ) : (
            <Login setToken={setToken} />
          )}
        </Route>
        <Route exact path="/conversations">
          {!token ? (
            <Redirect to="/login" />
          ) : (
            <AppContainer onLogout={handleLogout} />
          )}
        </Route>
        <Route exact path="/contacts">
          {!token ? <Redirect to="/login" /> : <ContactsPage />}
        </Route>
        <Route exact path="/">
          <Redirect to={token ? "/conversations" : "/login"} />
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Box>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Theme.Provider theme="default">
          <App />
        </Theme.Provider>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
