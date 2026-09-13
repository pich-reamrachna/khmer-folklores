"use client";

import { useRef, useState } from "react";
import stories from "../data/entries.js";
import StoryHero from "../components/home/StoryHero.js";
import NavBar from "../components/shared/NavBar.js";
import EntryCardRow from "../components/home/EntryCardRow.js";
import ArchiveBrowser from "../components/home/ArchiveBrowser.js";
import Footer from "../components/shared/Footer.js";

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
  // searchIndex covers every version (not just versions[0]), so a term only
  // present in a second/third telling — its place or text — is still
  // findable in ArchiveBrowser's search, even though the card itself only
  // displays the first telling. contributor is deliberately excluded —
  // search is only meant to match story content, not who told it.
  const flattenedStories = stories.map((s) => ({
    ...s,
    ...s.versions[0],
    searchIndex: s.versions
      .flatMap((v) => [v.place, v.placeKhmer, v.description, v.descriptionKhmer])
      .filter(Boolean)
      .join(" "),
  }));
  // Carousel only features the first 5 stories — ArchiveBrowser below still
  // searches/lists all of them, so the last story stays fully reachable,
  // just not in the featured row.
  const featuredStories = flattenedStories.slice(0, 5);

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
      {/* page-fade-in lives on this wrapper, not <main> itself — main's own
          backgroundColor needs to stay solid immediately (matching
          StoryHero's .hero-section), or the whole screen would visibly
          fade up from black on every navigation instead of just the
          content appearing. */}
      <div className="page-fade-in">
        <NavBar />

        <StoryHero entry={selectedEntry}>
          <EntryCardRow
            entries={featuredStories}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </StoryHero>

        <ArchiveBrowser stories={flattenedStories} />

        <Footer
          onBackToTop={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </div>
    </main>
  );
}
