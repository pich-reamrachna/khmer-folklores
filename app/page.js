"use client";

import { useState } from "react";
import collection from "../collection.config.js";
import stories from "../data/entries.js";
import StoryHero from "../components/StoryHero.js";
import NavBar from "../components/NavBar.js";
import EntryCardRow from "../components/EntryCardRow.js";

const styles = {
  // The second section mirrors the first section's two-level structure:
  // an outer section (here) that owns the page-level layout (snap target,
  // full viewport, flex centering, dark canvas), and an inner section
  // (rendered in the JSX) that owns the content layout (its own 48px
  // padding + max-width inner wrapper), exactly like <StoryHero>'s
  // outer section + .grid wrapper. The 48px side gutter on this outer
  // rule combines with the 48px on the inner rule to match the first
  // section's apparent gutter (96px from screen edge to content text).
  identity: {
    backgroundColor: "#0C0A12",
    padding: "72px 48px 56px",
    color: "#E8EDF2",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    // Snap target: the second "page" of the scroll, holding the archive's
    // identity (name, description, curator, source).
    minHeight: "100vh",
    scrollSnapAlign: "start",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  // Inner section for the identity content — same role as <StoryHero>'s
  // own <section> in the first section. Owns the content-level padding
  // and the max-width inner wrapper so the text column matches the
  // first section's column width and side gutter.
  identityInner: {
    padding: "0 48px",
    maxWidth: 1200,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#C6A15B",
    fontSize: 14,
    letterSpacing: 1,
    margin: 0,
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    margin: "16px 0 12px",
    lineHeight: 1.1,
    color: "#F1E9DA",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  description: {
    fontSize: 18,
    color: "#B4AEC2",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 32,
    padding: 24,
    backgroundColor: "#171122",
    border: "1px solid #2A2136",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#8A8398",
    margin: 0,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cardValue: {
    fontSize: 16,
    margin: "6px 0 0",
    color: "#E8EDF2",
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: "#C6A15B",
    marginTop: 48,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    marginTop: 64,
    padding: "24px 48px 0",
    fontSize: 13,
    color: "#5A6373",
    textAlign: "center",
  },
};

export default function Home() {
  // Selected index drives the hero. Default to the first entry.
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Flatten the selected story + its first version into a single object so
  // StoryHero and EntryCard can keep reading entry.title, entry.description,
  // entry.contributor, entry.place, entry.category — no component changes.
  const story = stories[selectedIndex] ?? stories[0];
  const selectedEntry = {
    ...story,
    ...story.versions[0],
  };
  // Same flatten, applied to every story, so each card can read entry.place.
  const flattenedStories = stories.map((s) => ({
    ...s,
    ...s.versions[0],
  }));

  return (
    <main
      style={{
        backgroundColor: "#0C0A12",
        // <main> is the scroll container so scroll-snap works reliably.
        // Each direct child (firstSection, identity, footer) is a snap stop
        // and at least one viewport tall, so vertical swipes page through
        // the archive instead of scrolling a long continuous page.
        height: "100vh",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      <NavBar />

      <StoryHero entry={selectedEntry}>
        <EntryCardRow
          entries={flattenedStories}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </StoryHero>

      <section style={styles.identity}>
        <section style={styles.identityInner}>
          <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
          <h2 style={styles.title}>{collection.name}</h2>
          <p style={styles.description}>{collection.description}</p>

          <div style={styles.card}>
            <p style={styles.cardLabel}>CURATED BY</p>
            <p style={styles.cardValue}>{collection.curator}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>SOURCE</p>
            <p style={styles.cardValue}>{collection.source}</p>
          </div>

          <p style={styles.count}>
            entries in the archive: {stories.length}
          </p>

          <footer style={styles.footer}>
            Built in ICT 340 — Vibe Coding, American University of Phnom Penh,
            Fall 2026. This archive is under construction all semester. Come
            back in December.
          </footer>
        </section>
      </section>
    </main>
  );
}
