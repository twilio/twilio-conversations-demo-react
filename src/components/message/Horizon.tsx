import { Box, Text } from "@twilio-paste/core";
import { useTheme } from "@twilio-paste/theme";
import React, { ForwardedRef, Ref } from "react";

type HorizonProps = { amount: number; ref: Ref<HTMLElement> };
const Horizon: React.FC<HorizonProps> = React.forwardRef(
  ({ amount }, ref: ForwardedRef<HTMLElement>) => {
    const theme = useTheme();
    return (
      <Box
        ref={ref}
        style={{
          textAlign: "center",
          backgroundColor: theme.backgroundColors.colorBackgroundPrimaryLighter,
          padding: 2,
          fontSize: "14px",
          lineHeight: "20px",
          margin: "16px 0",
        }}
      >
        <Text as="span" color="colorTextLink">
          {amount} new {amount > 1 ? "messages" : "message"}
        </Text>
      </Box>
    );
  }
);

export default Horizon;
