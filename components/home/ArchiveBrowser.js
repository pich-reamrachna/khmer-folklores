"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveSearch from "./ArchiveSearch.js";

// The "browse the archive" section beneath the hero. This implements the
// eyebrow, title, subtitle, a search bar, and the stacked list of stories
// from the mockup — the stat badges and category filters aren't built yet.
// Rows themselves stay icon-free, matching the no-icon rule already applied
// to the nav/hero/entry cards; the search bar's icon (in ArchiveSearch.js)
// is the one deliberate exception, per explicit request.
//
// The search input itself lives in ArchiveSearch.js (presentational only);
// this component owns the query state and does the actual filtering, since
// it's the one holding the `stories` data to filter.
// "use client" is required here for useState and the router.push navigation.

const ROW_HEIGHT = 104;
const ROW_GAP = 14;
const VISIBLE_ROWS = 4;
const SNIPPET_WORD_LIMIT = 16;

// Truncates by word count rather than relying only on CSS overflow —
// descriptions vary wildly in length, and pixel-width ellipsis truncation
// shows a different amount of text per row depending on how wide its
// place tag happens to be, which reads as cramped/inconsistent.
function truncateSnippet(text) {
  const words = text.trim().split(/\s+/);
  if (words.length <= SNIPPET_WORD_LIMIT) return text;
  return `${words.slice(0, SNIPPET_WORD_LIMIT).join(" ")}...`;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Splits a query into search terms: "quoted phrases" become one literal
// term each (spaces inside stay part of that term); everything outside
// quotes is split on whitespace into individual word terms.
function parseSearchTerms(query) {
  const terms = [];
  const pattern = /"([^"]*)"|(\S+)/g;
  let match;
  while ((match = pattern.exec(query)) !== null) {
    const term = (match[1] ?? match[2]).trim();
    if (term) terms.push(term);
  }
  return terms;
}

// Every term must match as a whole word (or, for a quoted multi-word
// term, an exact contiguous phrase) somewhere in the haystack — \b word
// boundaries are what make "sa" not match "Sambor" while "temple" still
// matches "the temple grounds". Terms are ANDed: all must be present.
function matchesAllTerms(haystack, terms) {
  return terms.every((term) => {
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
    return pattern.test(haystack);
  });
}

const NO_RESULTS_QUERY_MAX_LENGTH = 30;

// Only for the "no results" message — the actual search above always runs
// against the full, untruncated query. Strips one surrounding pair of
// double quotes (so a literal-phrase search doesn't show as ""dragon""),
// then truncates long input so the message stays on one clean line.
function formatQueryForDisplay(rawQuery) {
  let display = rawQuery.trim();
  if (display.length >= 2 && display.startsWith('"') && display.endsWith('"')) {
    display = display.slice(1, -1);
  }
  if (display.length > NO_RESULTS_QUERY_MAX_LENGTH) {
    display = `${display.slice(0, NO_RESULTS_QUERY_MAX_LENGTH)}...`;
  }
  return display;
}

const styles = {
  section: {
    backgroundColor: "#0D0812",
    minHeight: "100vh",
    width: "100%",
    // Same top padding as StoryHero — clears the fixed 90px NavBar.
    // Same side padding as StoryHero — keeps the columns aligned.
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    // Makes this a valid stop for <main>'s scroll-snap-type: y mandatory —
    // without this, a scroll gesture from the hero skips straight past
    // this section to the next one that has scroll-snap-align set.
    scrollSnapAlign: "start",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "0 0 1rem",
  },
  eyebrowLine: {
    height: 1,
    width: 32,
    backgroundColor: "rgba(197, 160, 89, 0.65)",
  },
  eyebrowText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2.75rem",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#BBAEBF",
    fontWeight: 300,
    lineHeight: 1.6,
    maxWidth: 640,
    margin: "0 0 2.5rem",
  },
  searchRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "1.5rem",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #2A172F",
    paddingBottom: "0.85rem",
    marginBottom: "1.25rem",
  },
  listCount: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#8A7F91",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    margin: 0,
  },
  // Shows exactly VISIBLE_ROWS rows; the rest scroll into view — matches
  // the mockup's "5 stories in view" scrollable panel with a gold
  // scrollbar (see app/globals.css's .archive-scroll rule).
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    paddingRight: "0.4rem",
    display: "flex",
    flexDirection: "column",
    gap: ROW_GAP,
    maxHeight: VISIBLE_ROWS * ROW_HEIGHT + (VISIBLE_ROWS - 1) * ROW_GAP,
    overflowY: "auto",
  },
  // border/backgroundColor live in app/globals.css's .archive-row rule —
  // needed for :hover, and a plain stylesheet avoids a hydration-gap
  // flash (see globals.css). This is a <button>, not a styled <li> — the
  // properties reset here (width/text-align/font) are just the ones that
  // don't conflict with that class.
  row: {
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.25rem",
    minHeight: ROW_HEIGHT,
    boxSizing: "border-box",
    padding: "1.1rem 1.4rem",
    borderRadius: 16,
    cursor: "pointer",
  },
  textCol: {
    minWidth: 0,
    flex: 1,
  },
  khmerTitle: {
    fontFamily: "'Kantumruy Pro', serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#D4AF37",
    margin: "0 0 0.2rem",
  },
  rowTitle: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#F5EFE6",
    margin: 0,
  },
  snippet: {
    fontSize: "0.88rem",
    color: "#8A7F91",
    margin: "0.3rem 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  placeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flex: "0 0 auto",
  },
  place: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#BBAEBF",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    margin: 0,
  },
  // The PNG is recolored gold via mask-image (background-color shows
  // through wherever the image is opaque), same technique as the other
  // icons in this app. The hover-triggered nudge lives in app/globals.css's
  // .archive-row:hover rule, not here — an inline transform would always
  // beat that rule for the same property.
  placeIcon: {
    display: "inline-block",
    width: 10,
    height: 10,
    backgroundColor: "#C5A059",
    WebkitMaskImage: "url(/icons/top-right.png)",
    maskImage: "url(/icons/top-right.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  },
};

export default function ArchiveBrowser({ stories }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const searchTerms = parseSearchTerms(query);
  const filteredStories = searchTerms.length
    ? stories.filter((entry) => {
        const haystack = [entry.title, entry.description, entry.place, entry.category]
          .filter(Boolean)
          .join(" ");
        return matchesAllTerms(haystack, searchTerms);
      })
    : stories;

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>Open the Ledger</span>
        </p>

        <h2 style={styles.title}>Find a story to follow.</h2>
        <p style={styles.subtitle}>
          A living archive of Khmer legends, spirits, and the community
          memories that keep them alive.
        </p>

        <div style={styles.searchRow}>
          <ArchiveSearch value={query} onChange={setQuery} />
        </div>

        <div style={styles.listHeader}>
          <p style={styles.listCount}>{filteredStories.length} Stories in View</p>
        </div>

        {filteredStories.length > 0 ? (
          <ul style={styles.list} className="archive-scroll">
            {filteredStories.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/${entry.id}`)}
                  style={styles.row}
                  className="archive-row"
                >
                  <div style={styles.textCol}>
                    {entry.khmerTitle ? (
                      <p style={styles.khmerTitle}>{entry.khmerTitle}</p>
                    ) : null}
                    <h3 style={styles.rowTitle}>{entry.title}</h3>
                    <p style={styles.snippet}>{truncateSnippet(entry.description)}</p>
                  </div>

                  {entry.place ? (
                    <span style={styles.placeGroup}>
                      <span style={styles.place}>{entry.place}</span>
                      <span
                        style={styles.placeIcon}
                        className="archive-row-icon"
                        aria-hidden="true"
                      />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.snippet}>
            &quot;{formatQueryForDisplay(query)}&quot; does not match any stories.
          </p>
        )}
      </div>
    </section>
  );
}
