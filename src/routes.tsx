import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login/login";
import AppContainer from "./components/AppContainer";

interface RoutesProps {
  token: string;
  username: string;
  password: string;
  setToken: (token: string) => void;
}

export const AppRoutes = ({
  token,
  username,
  password,
  setToken,
}: RoutesProps) => (
  <Routes>
    <Route
      path="/login"
      element={
        !token || !username || !password ? (
          <Login setToken={setToken} />
        ) : (
          <Navigate to="/chat" replace />
        )
      }
    />
    <Route
      path="/chat"
      element={
        token && username && password ? (
          <AppContainer />
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
    <Route path="/" element={<Navigate to="/login" replace />} />
  </Routes>
);
