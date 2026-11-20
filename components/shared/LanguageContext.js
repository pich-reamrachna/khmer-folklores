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

  // <html lang> follows the switch, so screen readers read Khmer as Khmer and
  // the stylesheet can tell which language is showing (globals.css's
  // --khmer-leading). app/layout.js renders it as "en" until this runs.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

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

// The one fallback rule every component uses when swapping entry text by
// language: Khmer if selected and present, otherwise English. khmerTitle/
// title are handled by each component instead — the archive list stacks
// both, while the hero and story page show one and style it by which one
// it is (StoryHero.js, StoryDetails.js).
export function pickText(language, khmerValue, englishValue) {
  return language === "km" && khmerValue ? khmerValue : englishValue;
}
