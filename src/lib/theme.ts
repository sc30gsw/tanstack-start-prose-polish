import { createTheme, rem } from "@mantine/core";

const primaryColor = "indigo" as const;

export const theme = createTheme({
  defaultRadius: "md",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", Roboto, Helvetica, Arial, sans-serif',
  fontSizes: {
    lg: rem(18),
    md: rem(16),
    sm: rem(14),
    xl: rem(20),
    xs: rem(12),
  },
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", Roboto, Helvetica, Arial, sans-serif',
    sizes: {
      h1: { fontSize: rem(36), fontWeight: "700", lineHeight: "1.25" },
      h2: { fontSize: rem(28), fontWeight: "600", lineHeight: "1.3" },
      h3: { fontSize: rem(22), fontWeight: "600", lineHeight: "1.4" },
      h4: { fontSize: rem(18), fontWeight: "600", lineHeight: "1.4" },
    },
  },
  lineHeights: {
    lg: "1.8",
    md: "1.65",
    sm: "1.5",
    xl: "2",
    xs: "1.4",
  },
  primaryColor,
  radius: {
    lg: rem(12),
    md: rem(8),
    sm: rem(6),
    xl: rem(16),
    xs: rem(4),
  },
  spacing: {
    lg: rem(24),
    md: rem(16),
    sm: rem(12),
    xl: rem(40),
    xs: rem(8),
  },
  components: {
    Badge: {
      defaultProps: {
        radius: "sm",
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        padding: "lg",
        radius: "md",
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
      },
    },
    NavLink: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    SegmentedControl: {
      defaultProps: {
        color: primaryColor,
        radius: "md",
        size: "md",
      },
    },
    Tabs: {
      defaultProps: {
        color: primaryColor,
        radius: "md",
        size: "md",
      },
      styles: {
        tab: {
          fontWeight: "500",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
