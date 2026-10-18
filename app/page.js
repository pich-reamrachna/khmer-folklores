"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../utils/supabase/client.js";
import StoryHero from "../components/home/StoryHero.js";
import NavBar from "../components/shared/NavBar.js";
import EntryCardRow from "../components/home/EntryCardRow.js";
import ArchiveBrowser from "../components/home/ArchiveBrowser.js";
import Footer from "../components/shared/Footer.js";
import { preloadImages } from "../utils/preloadImages.js";
import { getCachedStories, setCachedStories } from "../utils/archiveCache.js";

// How many stories the hero carousel features (the archive list below shows
// them all). Shared by the image preload and the carousel itself.
const FEATURED_COUNT = 5;
// The hero's gold-waves backdrop (StoryHero.js) — preloaded with the
// featured pictures so the whole hero appears at once.
const HERO_BACKDROP = "/golden-waves.webp";

// Shapes one story + its tellings into the flat object the home components
// read (entry.title, entry.place, entry.khmerTitle, ...), mapping the DB's
// snake_case columns back to the camelCase names the JSX already uses.
// tellings arrive newest-first, so tellings[0] is the one the card displays.
function flattenStory(story, tellings) {
  const display = tellings[0];
  return {
    id: story.id,
    title: story.title,
    khmerTitle: story.khmer_title,
    category: story.category,
    categoryKhmer: story.category_khmer,
    summary: story.summary,
    summaryKhmer: story.summary_khmer,
    // The story's own picture (a /public path or full URL), shown in the
    // hero's right-hand space; null when the story doesn't have one yet.
    photoUrl: story.photo_url,
    place: display.place,
    placeKhmer: display.place_khmer,
    // Covers every telling's place/description (not just the displayed one)
    // so a term buried in a second telling is still findable. entries no
    // longer has a Khmer description, so it's dropped from the index.
    // contributor stays out — search matches story content, not who told it.
    searchIndex: tellings
      .flatMap((t) => [t.place, t.place_khmer, t.description])
      .filter(Boolean)
      .join(" "),
  };
}

// Groups entry rows (newest-first) by their parent story, preserving order —
// the first row seen for a story is its newest telling, and stories come out
// ordered by their newest telling.
function groupEntries(rows) {
  const bySlug = new Map();
  for (const row of rows) {
    const story = row.stories;
    if (!story) continue;
    if (!bySlug.has(story.id)) bySlug.set(story.id, { story, tellings: [] });
    bySlug.get(story.id).tellings.push(row);
  }
  return [...bySlug.values()].map(({ story, tellings }) => flattenStory(story, tellings));
}

const statusStyles = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    textAlign: "center",
    color: "#BBAEBF",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 300,
  },
};

export default function Home() {
  // <main> is the scroll container; the footer's "Back to top" button
  // scrolls it back to the start.
  const mainRef = useRef(null);
  // Selected index drives the hero. Default to the first entry.
  const [selectedIndex, setSelectedIndex] = useState(0);
  // null = still loading; [] = loaded but empty. Distinguishing the two lets
  // each show its own sensible state instead of a broken page. Starts from
  // the in-memory copy (utils/archiveCache.js) when this tab has already
  // loaded the archive, so coming back to the home page shows it instantly
  // instead of the loading message again.
  const [flattenedStories, setFlattenedStories] = useState(getCachedStories);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    // Published stories only. The database also lets a submitter see their
    // own pending story (and the curator see all of them), but those have no
    // summary yet and belong on My Submissions / the review page, not here.
    // !inner makes the status filter drop the telling rows themselves, not
    // just blank out their embedded story. !entries_story_id_fkey names which
    // link to follow — stories.origin_entry_id is a second link between the
    // two tables, and without the name Supabase refuses the ambiguous embed.
    supabase
      .from("entries")
      .select("*, stories!entries_story_id_fkey!inner(*)")
      .eq("stories.status", "published")
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (!active) return;
        const cached = getCachedStories();
        // Already showing the remembered copy: this was a quiet background
        // refresh. A failed refresh keeps what's on screen; an identical one
        // changes nothing (no re-render, the hero keeps its place).
        if (cached) {
          if (error || !data) return;
          const fresh = groupEntries(data);
          if (JSON.stringify(fresh) === JSON.stringify(cached)) return;
          // Something changed (e.g. a newly published story): fetch any new
          // pictures first so the swap doesn't show them half-loaded.
          await preloadImages(fresh.slice(0, FEATURED_COUNT).map((s) => s.photoUrl));
          setCachedStories(fresh);
          if (active) setFlattenedStories(fresh);
          return;
        }
        // First load in this tab. A slow/asleep/errored database resolves to
        // empty, not a crash — and an error isn't remembered, so the next
        // visit tries again instead of showing "No stories" from memory.
        const stories = error || !data ? [] : groupEntries(data);
        // Keep "Loading the archive…" up until the hero's pictures (every
        // featured story, so switching between them is instant too) and its
        // backdrop are downloaded and decoded — otherwise the page appeared
        // with the pictures still popping in. preloadImages gives up after
        // a few seconds so a slow connection still gets the page.
        await preloadImages([
          HERO_BACKDROP,
          ...stories.slice(0, FEATURED_COUNT).map((s) => s.photoUrl),
        ]);
        if (!error && data) setCachedStories(stories);
        if (active) setFlattenedStories(stories);
      });
    return () => {
      active = false;
    };
  }, []);

  if (flattenedStories === null) {
    return (
      <main ref={mainRef} style={{ backgroundColor: "#0C0A12" }}>
        <NavBar />
        <div style={statusStyles.screen}>Loading the archive…</div>
      </main>
    );
  }

  if (flattenedStories.length === 0) {
    return (
      <main ref={mainRef} style={{ backgroundColor: "#0C0A12" }}>
        <NavBar />
        <div style={statusStyles.screen}>No stories in the archive yet.</div>
        <Footer
          onBackToTop={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </main>
    );
  }

  // Flatten the selected story into a single object so StoryHero and
  // EntryCard can keep reading entry.title, entry.summary, entry.place,
  // entry.category — no component changes.
  const selectedEntry = flattenedStories[selectedIndex] ?? flattenedStories[0];
  // Carousel only features the first 5 stories — ArchiveBrowser below still
  // searches/lists all of them, so the rest stay fully reachable, just not
  // in the featured row.
  const featuredStories = flattenedStories.slice(0, FEATURED_COUNT);

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
          entries={featuredStories}
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
