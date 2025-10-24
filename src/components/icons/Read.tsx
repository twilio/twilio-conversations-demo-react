import React, { CSSProperties } from "react";
import Delivered from "./Delivered";

const Read: React.FC<{ color?: string; style?: CSSProperties }> = ({
  color = "green",
  style = {},
}) => <Delivered color={color} style={style} />;

export default Read;
