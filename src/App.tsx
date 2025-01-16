import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Login from "./components/login/login";
import AppContainer from "./components/AppContainer";
import { Box, Heading } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/theme";

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

const App: React.FC = () => {
  const [token, setToken] = useState<string>("");

  return (
    <Theme.Provider theme="default">
      <Router>
        <Box
          backgroundColor="colorBackgroundBody"
          minHeight="100vh"
          width="100%"
        >
          <Switch>
            <Route exact path="/login">
              {token ? (
                <Redirect to="/conversations" />
              ) : (
                <Login setToken={setToken} />
              )}
            </Route>
            <Route exact path="/conversations">
              {!token ? <Redirect to="/login" /> : <AppContainer />}
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
      </Router>
    </Theme.Provider>
  );
};

export default App;
