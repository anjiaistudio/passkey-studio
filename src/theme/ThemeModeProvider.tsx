import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import type { PaletteMode } from "@mui/material";

const THEME_MODE_KEY = "passkey-lab-theme-mode";

function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(
    THEME_MODE_KEY
  );

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

interface ThemeModeContextValue {
  mode: PaletteMode;

  toggleMode: () => void;
}

const ThemeModeContext =
  createContext<ThemeModeContextValue | null>(
    null
  );

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error(
      "useThemeMode must be used within ThemeModeProvider"
    );
  }

  return context;
}

export default function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<PaletteMode>(
    getInitialMode
  );

  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode: () =>
        setMode((current) =>
          current === "light" ? "dark" : "light"
        ),
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
