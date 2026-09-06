"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import collection from "../collection.config.js";
import stories from "../data/entries.js";
import StoryHero from "../components/StoryHero.js";
import NavBar from "../components/NavBar.js";
import EntryCardRow from "../components/EntryCardRow.js";
import ArchiveBrowser from "../components/ArchiveBrowser.js";

const styles = {
  // Trailing page footer — the archive's identity (name, description,
  // curator, source) and a credit line. Sized to its own content, not a
  // full-viewport scroll-snap page like the sections above it — but it
  // still needs scroll-snap-align, otherwise <main>'s mandatory snapping
  // treats ArchiveBrowser as the last valid stop and snaps back to it,
  // blocking you from ever resting on the footer.
  identity: {
    backgroundColor: "#0C0A12",
    padding: "56px 2rem",
    color: "#E8EDF2",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    boxSizing: "border-box",
    scrollSnapAlign: "start",
  },
  // Inner wrapper — same 1560px column every other section uses.
  identityInner: {
    maxWidth: 1560,
    margin: "0 auto",
    width: "100%",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "3rem",
    flexWrap: "wrap",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    maxWidth: 640,
  },
  siteName: {
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
    fontSize: "1.55rem",
    fontWeight: 700,
    color: "#F5EFE6",
    margin: 0,
  },
  kicker: {
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#C5A059",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    margin: "4px 0 0",
  },
  description: {
    fontSize: "1rem",
    color: "#B4AEC2",
    lineHeight: 1.6,
    margin: 0,
  },
  creditLine: {
    fontSize: "0.85rem",
    color: "#C5A059",
    margin: 0,
  },
  rightCol: {
    display: "flex",
    gap: "3.5rem",
  },
  navGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  navHeading: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#C5A059",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    margin: 0,
  },
  navLink: {
    fontSize: "0.95rem",
    color: "#F5EFE6",
    textDecoration: "none",
  },
  navLinkInert: {
    fontSize: "0.95rem",
    color: "#8A7F91",
    cursor: "default",
  },
  backToTopBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "0.6rem 1.1rem",
    borderRadius: 999,
    border: "1px solid #2A172F",
    backgroundColor: "#120916",
    color: "#F5EFE6",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #2A172F",
    margin: "40px 0 24px",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  bottomText: {
    fontSize: "0.8rem",
    color: "#5A6373",
    margin: 0,
    maxWidth: 640,
  },
};

export default function Home() {
  // <main> is the scroll container; the footer's "Back to top" button
  // scrolls it back to the start.
  const mainRef = useRef(null);
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
      ref={mainRef}
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

      <ArchiveBrowser stories={flattenedStories} />

      <footer style={styles.identity}>
        <div style={styles.identityInner}>
          <div style={styles.topRow}>
            <div style={styles.leftCol}>
              <div>
                <p style={styles.siteName}>{collection.name}</p>
                <p style={styles.kicker}>A Khmer Folklore Archive</p>
              </div>
              <p style={styles.description}>{collection.description}</p>
              <p style={styles.creditLine}>
                Curated by {collection.curator} · Source: {collection.source}
              </p>
            </div>

            <div style={styles.rightCol}>
              <div style={styles.navGroup}>
                <p style={styles.navHeading}>Archive Navigation</p>
                <Link href="/" style={styles.navLink}>
                  Browse the Archive
                </Link>
                <span style={styles.navLinkInert} aria-disabled="true">
                  Share a Memory
                </span>
              </div>

              <div style={styles.navGroup}>
                <p style={styles.navHeading}>Ascend</p>
                <button
                  type="button"
                  style={styles.backToTopBtn}
                  onClick={() =>
                    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to top ↑
                </button>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.bottomRow}>
            <p style={styles.bottomText}>
              Built in ICT 340 — Vibe Coding, American University of Phnom
              Penh, Fall 2026. This archive is under construction all
              semester. Come back in December.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
