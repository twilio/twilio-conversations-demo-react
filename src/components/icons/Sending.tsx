import React, { CSSProperties } from "react";

const Sending: React.FC<{ color?: string; style?: CSSProperties }> = ({
  color = "#606B85",
  style = {},
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM5 11.5C5.82843 11.5 6.5 10.8284 6.5 10C6.5 9.17157 5.82843 8.5 5 8.5C4.17157 8.5 3.5 9.17157 3.5 10C3.5 10.8284 4.17157 11.5 5 11.5ZM11.5 10C11.5 10.8284 10.8284 11.5 10 11.5C9.17157 11.5 8.5 10.8284 8.5 10C8.5 9.17157 9.17157 8.5 10 8.5C10.8284 8.5 11.5 9.17157 11.5 10ZM15 11.5C15.8284 11.5 16.5 10.8284 16.5 10C16.5 9.17157 15.8284 8.5 15 8.5C14.1716 8.5 13.5 9.17157 13.5 10C13.5 10.8284 14.1716 11.5 15 11.5Z"
      fill={color}
    />
  </svg>
);

export default Sending;
