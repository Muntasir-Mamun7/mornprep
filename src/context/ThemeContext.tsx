"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface ThemeContextType {
  primaryColor: string;
  accentColor: string;
  mode: "light" | "dark";
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setMode: (mode: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

const defaultPrimary = "#d4802a";
const defaultAccent = "#567a5b";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, saveProfile } = useAuth();
  const [primaryColor, setPrimary] = useState(defaultPrimary);
  const [accentColor, setAccent] = useState(defaultAccent);
  const [mode, setModeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (user) {
      setPrimary(user.theme_primary_color || defaultPrimary);
      setAccent(user.theme_accent_color || defaultAccent);
      setModeState(user.theme_mode || "light");
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-accent", accentColor);
    root.setAttribute("data-theme", mode);
  }, [primaryColor, accentColor, mode]);

  function setPrimaryColor(color: string) {
    setPrimary(color);
    if (user) saveProfile({ theme_primary_color: color });
  }

  function setAccentColor(color: string) {
    setAccent(color);
    if (user) saveProfile({ theme_accent_color: color });
  }

  function setMode(m: "light" | "dark") {
    setModeState(m);
    if (user) saveProfile({ theme_mode: m });
  }

  return (
    <ThemeContext.Provider
      value={{ primaryColor, accentColor, mode, setPrimaryColor, setAccentColor, setMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
