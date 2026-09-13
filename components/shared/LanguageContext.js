"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Shared "which language is selected" state — wraps the whole app from
// app/layout.js, so NavBar's switcher (writer) and every page/component
// that renders entry text (readers) agree on the same value.
//
// Defaults to "en" on both server and first client render (localStorage
// isn't available during SSR). If a visitor previously chose "km", the
// effect below flips it right after mount — a one-frame flash from en to
// km on load for returning Khmer-preferring visitors, not fixable without
// a cookie the server could read upfront. Acceptable tradeoff here.

const STORAGE_KEY = "khmer-folklores-language";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "km") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (next) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
