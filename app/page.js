"use client";

import { useRef, useState } from "react";
import stories from "../data/entries.js";
import StoryHero from "../components/StoryHero.js";
import NavBar from "../components/NavBar.js";
import EntryCardRow from "../components/EntryCardRow.js";
import ArchiveBrowser from "../components/ArchiveBrowser.js";
import Footer from "../components/Footer.js";

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

      <Footer
        onBackToTop={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </main>
  );
}
