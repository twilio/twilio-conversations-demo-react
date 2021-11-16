import { CSSProperties } from "react";

export default {
  appContainer: (alertsExist: boolean): CSSProperties => ({
    display: "flex",
    flexDirection: "row",
    height: alertsExist ? "calc(100% - 122px)" : "calc(100% - 72px)",
    width: "100%",
    pointerEvents: alertsExist ? "none" : "auto",
  }),
  flex: {
    display: "flex",
  },
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  } as CSSProperties,
  convosWrapper: {
    height: "100%",
    width: 320,
    position: "relative",
    backgroundColor: "#F4F4F6",
  } as CSSProperties,
  messagesWrapper: {
    flex: 1,
  } as CSSProperties,
  appHeader: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#06033A",
    padding: "20px 25px",
  },
  appLogoTitle: {
    fontSize: "16px",
    fontWeight: 500,
    textAlign: "center",
    color: "#FFFFFF",
    lineHeight: "32px",
    paddingLeft: "20px",
  } as CSSProperties,
  userTile: {
    display: "flex",
    lineHeight: "32px",
    color: "#fff",
  },
  paginationSpinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  } as CSSProperties,
};
