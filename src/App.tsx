import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Login from "./components/login/login";
import AppContainer from "./components/AppContainer";
import { Box } from "@twilio-paste/core";
import { Theme } from "@twilio-paste/theme";
import { gradients } from "./styles/theme";

const App: React.FC = () => {
  const [token, setToken] = useState<string>("");

  if (!token) {
    return (
      <Theme.Provider theme="default">
        <Router>
          <Box
            style={{
              minHeight: "100vh",
              background: gradients.background,
            }}
          >
            <Login setToken={setToken} />
          </Box>
        </Router>
      </Theme.Provider>
    );
  }

  return (
    <Theme.Provider theme="default">
      <Router>
        <Box
          style={{
            minHeight: "100vh",
            background: gradients.background,
          }}
        >
          <Switch>
            <Route exact path="/">
              <AppContainer />
            </Route>
            <Redirect to="/" />
          </Switch>
        </Box>
      </Router>
    </Theme.Provider>
  );
};

export default App;
