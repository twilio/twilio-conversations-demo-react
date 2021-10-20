import { createStore, applyMiddleware } from "redux";
import reducers, { initialState } from "./reducers";
import thunk from "redux-thunk";

export const store = createStore(
  reducers,
  initialState,
  applyMiddleware(thunk)
);
