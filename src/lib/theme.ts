import { createTheme } from "@mantine/core";

export const theme = createTheme({
  defaultRadius: "xs",
  fontFamily:
    '-apple-system, "system-ui", "Segoe UI", "Noto Sans JP", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSizes: {
    lg: "24px",
    md: "18px",
    sm: "16px",
    xs: "14px",
  },
  lineHeights: { md: "20px" },
  primaryColor: "blue",
  radius: { xs: "6px" },
  spacing: {
    lg: "12px",
    md: "8px",
    sm: "4px",
    xl: "24px",
    xs: "2px",
  },
});
