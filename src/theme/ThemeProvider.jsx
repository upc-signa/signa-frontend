import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeCtx = createContext({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

const apply = (t) => {
  const isDark = t === "dark";
  const html = document.documentElement;
  const body = document.body;

  html.classList.toggle("dark", isDark);
  body.classList.toggle("dark", isDark);
};

export default function ThemeProvider({ children }) {
  const initial = (() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  })();

  const [theme, setTheme] = useState(initial);

useEffect(() => {
  console.log('[theme] set ->', theme);
  apply(theme);
  console.log('[theme] html has dark?', document.documentElement.classList.contains('dark'));
  localStorage.setItem("theme", theme);
}, [theme]);


  const value = useMemo(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}