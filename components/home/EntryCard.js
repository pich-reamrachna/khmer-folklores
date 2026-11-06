"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";

// One featured story in the row under the hero: its title, a hairline with
// a diamond marker in the middle, then its place. The selected story's line
// and diamond turn gold and its title brightens.
//
// Everything that changes with hover or selection (title colour and size,
// line colour, diamond fill) lives in app/globals.css's .entry-card rules,
// not inline — an inline value can never be overridden by :hover, and a
// plain stylesheet shows the right colours from the first paint.

const styles = {
  card: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#F5EFE6",
    textAlign: "center",
  },
  // Fixed two-line height, titles sitting on its bottom edge — so a title
  // that wraps (Crocodile Reincarnation) and one that doesn't still meet
  // the line at the same place.
  head: {
    width: "100%",
    minHeight: "3.4rem",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: "0 1.5rem 0.8rem",
    boxSizing: "border-box",
  },
  // Can show khmerTitle, so it needs var(--font-khmer) ahead of Cinzel.
  // A soft dark halo keeps it readable where it crosses the gold brush.
  title: {
    margin: 0,
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontWeight: 500,
    lineHeight: 1.1,
    textTransform: "uppercase",
    textShadow: "0 0 8px rgba(8, 4, 10, 0.95), 0 0 2px rgba(8, 4, 10, 0.9)",
  },
  // The hairline and the diamond sitting on it.
  rule: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  diamond: {
    position: "relative",
    width: 9,
    height: 9,
    transform: "rotate(45deg)",
    boxSizing: "border-box",
  },
  // The story's place. A Khmer value needs var(--font-khmer).
  meta: {
    margin: "0.9rem 0 0",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#CFC6B8",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    textShadow: "0 0 8px rgba(8, 4, 10, 0.95), 0 0 2px rgba(8, 4, 10, 0.9)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  // Letter-spacing pries apart Khmer glyph clusters — off for Khmer text.
  trackingNone: {
    letterSpacing: "normal",
  },
};

export default function EntryCard({ entry, index, isActive, onSelect }) {
  const { language } = useLanguage();
  // Unlike StoryHero/StoryDetails/ArchiveBrowser, the row swaps its title
  // rather than stacking both — too little room here for two title lines.
  const title = pickText(language, entry.khmerTitle, entry.title);
  const place = pickText(language, entry.placeKhmer, entry.place);

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      style={styles.card}
      aria-pressed={isActive}
      className={isActive ? "entry-card is-active" : "entry-card"}
    >
      <div style={styles.head}>
        <h2 style={styles.title} className="entry-card-title">{title}</h2>
      </div>

      <div style={styles.rule} aria-hidden="true">
        <span style={styles.line} className="entry-card-line" />
        <span style={styles.diamond} className="entry-card-diamond" />
      </div>

      {place ? (
        <p style={{ ...styles.meta, ...(language === "km" ? styles.trackingNone : null) }}>{place}</p>
      ) : null}
    </button>
  );
}
