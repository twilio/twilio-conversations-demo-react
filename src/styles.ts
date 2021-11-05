import { CSSProperties } from "react";

export default {
  appContainer: (alertsExist: boolean): CSSProperties => ({
    display: "flex",
    flexDirection: "row",
    height: alertsExist ? "calc(100% - 50px)" : "100%",
    width: "100%",
    pointerEvents: alertsExist ? "none" : "auto",
  }),
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  } as CSSProperties,
  convosWrapper: {
    height: "100%",
    width: 320,
    backgroundColor: "#F4F4F6",
  } as CSSProperties,
  messagesWrapper: {
    flex: 1,
  } as CSSProperties,
  paginationSpinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  } as CSSProperties,
};
