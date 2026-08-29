"use client";

import { useState } from "react";
import collection from "../collection.config.js";
import EntryCard, { draftEntries } from "../components/EntryCard.js";
import StoryHero from "../components/StoryHero.js";

const styles = {
  // The first section covers the full viewport and contains the hero story
  // block, the entry-cards row. We
  // keep it as a flex column with vertical centering so the story block sits
  // in the middle of the screen, the cards anchor to the bottom, and the
  // hint sits just below them — all on one dark canvas.
  firstSection: {
    backgroundColor: "#0C0A12",
    minHeight: "100vh",
    padding: "72px 48px 56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
    // Snap target: this section is the first "page" the user lands on.
    scrollSnapAlign: "start",
  },
  // Inner column that holds the cards row, pushed to the
  // bottom of the first section regardless of the story block's height.
  firstSectionTail: {
    marginTop: 56,
  },
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
  // Row of entry cards under the hero. Lives inside the first section's
  // tail block; the side padding of the first section already gives us
  // the 48px gutter, so we drop the row's own horizontal padding.
  cardsRow: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: `repeat(${draftEntries.length}, minmax(0, 1fr))`,
    gap: 20,
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
  const selectedEntry = draftEntries[selectedIndex] ?? draftEntries[0];

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
      <section style={styles.firstSection}>
        <StoryHero entry={selectedEntry} />

        <div style={styles.firstSectionTail}>
          <div style={styles.cardsRow} aria-label="Entries in the archive">
            {draftEntries.map((entry, index) => (
              <EntryCard
                key={index}
                entry={entry}
                index={index}
                isActive={index === selectedIndex}
                onSelect={setSelectedIndex}
              />
            ))}
          </div>
        </div>
      </section>

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
            entries in the archive: {draftEntries.length}
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
