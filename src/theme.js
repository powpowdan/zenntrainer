import { createTheme } from "@mui/material/styles";

export const tokens = {
  app: "#0a0a0b",
  surface: "#141416",
  elevated: "#1b1b1e",

  textPrimary: "#f2f2f0",
  textSecondary: "#9a9a9f",
  textMuted: "#56565c",

  borderSubtle: "#232327",
  borderStrong: "#38383e",

  accent: "#dc2626",
  accentHover: "#ef4444",
  accentDeep: "#7f1d1d",
  onAccent: "#fff5f5",

  radiusXs: "4px",
  radiusSm: "6px",
  radiusMd: "10px",
  radiusPill: "999px",

  fontUi:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontNumeric:
    'ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, Consolas, monospace',
};

const kebab = (key) => key.replace(/([A-Z])/g, "-$1").toLowerCase();

if (typeof document !== "undefined") {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${kebab(key)}`, value);
  }
}

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: tokens.app, paper: tokens.surface },
    primary: {
      main: tokens.accent,
      light: tokens.accentHover,
      dark: tokens.accentDeep,
      contrastText: tokens.onAccent,
    },
    error: { main: tokens.accent },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled: tokens.textMuted,
    },
    divider: tokens.borderSubtle,
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: tokens.fontUi,
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.app,
          color: tokens.textPrimary,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", backgroundColor: tokens.surface },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.app,
          backgroundImage: "none",
          borderBottom: `1px solid ${tokens.borderSubtle}`,
          boxShadow: "none",
          color: tokens.textPrimary,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { borderRadius: 4 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: tokens.app,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.borderStrong,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.borderStrong,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.accent,
          },
        },
      },
    },
    MuiSpeedDial: {
      styleOverrides: {
        fab: {
          backgroundColor: tokens.surface,
          color: tokens.textSecondary,
          boxShadow: "none",
          "&:hover": { backgroundColor: tokens.elevated },
        },
      },
    },
  },
});
