"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext.js";
import { useTranslation } from "./uiText.js";

// The site's "page not found" screen (app/not-found.js): a wrong or old story
// link, or /review for anyone who isn't the curator. In the chosen language,
// with a way back to the archive. The button is a Link, so its look and hover
// live in app/globals.css (.not-found-home) — styled-jsx can't scope through
// next/link.

const styles = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "130px 2rem 4rem",
    boxSizing: "border-box",
    textAlign: "center",
    backgroundColor: "#1A1817",
  },
  code: {
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#A89F91",
    letterSpacing: "0.3em",
    margin: "0 0 1rem",
  },
  title: {
    fontFamily: "var(--font-cinzel), var(--font-khmer-serif), serif",
    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
    fontWeight: 500,
    color: "#C9A961",
    lineHeight: "var(--khmer-leading, 1.2)",
    margin: "0 0 1rem",
  },
  text: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "#CFC6B8",
    maxWidth: 480,
    margin: "0 0 2rem",
  },
};

export default function NotFound() {
  const { language } = useLanguage();
  const t = useTranslation();

  return (
    <section style={styles.screen}>
      <p style={styles.code}>404</p>
      <h1 style={styles.title}>{t("notFoundTitle")}</h1>
      <p style={styles.text}>{t("notFoundText")}</p>
      <Link href="/" className={language === "km" ? "not-found-home km" : "not-found-home"}>
        {t("notFoundHome")}
      </Link>
    </section>
  );
}
