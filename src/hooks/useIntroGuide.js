// src/hooks/useIntroGuide.js
import { useEffect, useState } from "react";

const KEY = "onboarding.seen";
const EVENT_KEY = "introGuide:changed";

function readSeen() {
  // mantiene el mismo formato "true"/"false" que ya tenías
  return localStorage.getItem(KEY) === "true";
}

export function useIntroGuide() {
  const [hasSeen, setHasSeen] = useState(() => readSeen());

  // Escuchar cambios disparados desde otros lugares (Topbar, etc.)
  useEffect(() => {
    const handler = () => {
      setHasSeen(readSeen());
    };

    window.addEventListener(EVENT_KEY, handler);
    return () => window.removeEventListener(EVENT_KEY, handler);
  }, []);

  const markAsSeen = () => {
    localStorage.setItem(KEY, "true");
    setHasSeen(true);
    window.dispatchEvent(new Event(EVENT_KEY)); // avisa al resto de la app
  };

  const resetGuide = () => {
    localStorage.setItem(KEY, "false");
    setHasSeen(false);
    window.dispatchEvent(new Event(EVENT_KEY)); // fuerza re-render donde usen el hook
  };

  return {
    hasSeen,
    markAsSeen,
    resetGuide,
    shouldShow: !hasSeen,
  };
}