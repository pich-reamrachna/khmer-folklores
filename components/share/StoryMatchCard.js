"use client";

import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// One "could this be your story?" suggestion on /share. The link jumps to the
// story's tellings (#tellings, on StoryMemories' section), where the user can
// read how others told it and add their own with "Share Your Version".
// The link's :hover lives in app/globals.css (.share-match-link) — styled-jsx
// can't scope through next/link's Link.

const styles = {
  card: {
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 16,
    padding: "1.1rem 1.4rem",
  },
  khmerTitle: {
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#D4AF37",
    margin: "0 0 0.2rem",
  },
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#F5EFE6",
    margin: 0,
  },
  summary: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    color: "#8A7F91",
    margin: "0.4rem 0 0.9rem",
  },
  link: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#C5A059",
    textDecoration: "none",
  },
};

export default function StoryMatchCard({ story }) {
  const { language } = useLanguage();
  const t = useTranslation();
  // Title stays English with the Khmer title above it, same as the archive
  // list; the summary follows the language toggle.
  const summary = pickText(language, story.summaryKhmer, story.summary);

  return (
    <div style={styles.card}>
      {story.khmerTitle ? <p style={styles.khmerTitle}>{story.khmerTitle}</p> : null}
      <h2 style={styles.title}>{story.title}</h2>
      {summary ? <p style={styles.summary}>{summary}</p> : null}
      <Link href={`/${story.id}#tellings`} style={styles.link} className="share-match-link">
        {t("shareAddVersion")} →
      </Link>
    </div>
  );
}
