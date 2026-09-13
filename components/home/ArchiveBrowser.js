"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveSearch from "./ArchiveSearch.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

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

// Khmer script doesn't put spaces between syllables/words, so there's no
// boundary for a Khmer term to anchor "whole word" matching on — a term
// missing a mid-word diacritic could match a false boundary, while the
// exact substring wouldn't match at all if it's not immediately followed
// by real whitespace. Substring matching is used for Khmer terms instead.
const KHMER_SCRIPT = /[ក-៿]/;

// Every term must match somewhere in the haystack, ANDed together —
// whole-word for Latin terms (\p{L}/\p{N} lookaround, not \b, which is
// ASCII-only and never matches around Khmer text), substring for Khmer.
function matchesAllTerms(haystack, terms) {
  return terms.every((term) => {
    if (KHMER_SCRIPT.test(term)) {
      return haystack.toLowerCase().includes(term.toLowerCase());
    }
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`,
      "iu"
    );
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
  // justifyContent lives in this file's own plain <style> tag below — on
  // phone it switches from centering to top-aligned, so the dropdown gets
  // the space that centering would otherwise leave unused above the
  // content instead of running out of room below the search bar.
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
  // eyebrowText: deliberately not translated — a decorative label, kept
  // English like the site's other stylistic branding text.
  eyebrowText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  // title/subtitle: this section's own static heading copy (not a
  // story's title, which always stays English per Step 5) and are
  // translated, so each needs var(--font-khmer) explicitly instead of
  // inheriting `section`'s Latin-only stack.
  title: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2.75rem",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  subtitle: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
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
  // Letter-spacing is a Latin small-caps convention — applied to Khmer,
  // it pries apart the stacked consonant/vowel signs that make up a
  // single visual glyph cluster. Spread this in (after the base style)
  // wherever the text might be Khmer.
  trackingNone: {
    letterSpacing: "normal",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #2A172F",
    paddingBottom: "0.85rem",
    marginBottom: "1.25rem",
  },
  // Translated ("Stories in View" label) — needs var(--font-khmer).
  listCount: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#8A7F91",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    margin: 0,
  },
  // Shows exactly VISIBLE_ROWS rows before scrolling — matches the
  // mockup's gold scrollbar (app/globals.css's .archive-scroll rule).
  // maxHeight/overflowY live in this file's own <style> tag below,
  // capped tighter on phone.
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    paddingRight: "0.4rem",
    display: "flex",
    flexDirection: "column",
    gap: ROW_GAP,
  },
  // border/backgroundColor live in globals.css's .archive-row rule (hover +
  // avoids hydration-gap flash). alignItems/justifyContent live in this
  // file's own <style> tag — phone stacks rows instead of centering a
  // wrapped title beside the place tag, which would overlap it.
  row: {
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
    color: "inherit",
    display: "flex",
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
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
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
  // fontFamily on snippet/place: both can now show a Khmer field
  // (description/place swap by language) — see EntryCard.js for why this
  // needs var(--font-khmer) explicitly.
  snippet: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
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
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
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
  const { language } = useLanguage();
  const t = useTranslation();
  const [query, setQuery] = useState("");

  const searchTerms = parseSearchTerms(query);
  const filteredStories = searchTerms.length
    ? stories.filter((entry) => {
        // Always matches both languages regardless of the switcher, so a
        // visitor can search in either language and still find results.
        const haystack = [
          entry.title,
          entry.khmerTitle,
          entry.description,
          entry.descriptionKhmer,
          entry.place,
          entry.placeKhmer,
          entry.category,
          entry.categoryKhmer,
        ]
          .filter(Boolean)
          .join(" ");
        return matchesAllTerms(haystack, searchTerms);
      })
    : stories;

  return (
    <section style={styles.section} className="archive-section">
      <div style={styles.container}>
        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>Open the Ledger</span>
        </p>

        <h2 style={styles.title}>{t("archiveTitle")}</h2>
        <p style={styles.subtitle}>{t("archiveSubtitle")}</p>

        <div className={`archive-search-panel${query ? " has-query" : ""}`}>
          <div style={styles.searchRow}>
            <ArchiveSearch value={query} onChange={setQuery} />
          </div>

          <div className="archive-results">
            <div style={styles.listHeader}>
              <p style={{ ...styles.listCount, ...(language === "km" ? styles.trackingNone : null) }}>
                {filteredStories.length} {t("archiveStoriesInView")}
              </p>
            </div>

            {filteredStories.length > 0 ? (
              <ul style={styles.list} className="archive-scroll">
                {filteredStories.map((entry) => {
                  // khmerTitle/title stack (both shown together) regardless
                  // of language. summary (story-level), not description
                  // (one contributor's specific telling) — same reasoning
                  // as StoryHero.js.
                  const summary = pickText(language, entry.summaryKhmer, entry.summary);
                  const place = pickText(language, entry.placeKhmer, entry.place);
                  return (
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
                          <p style={styles.snippet} className="archive-snippet">
                            {truncateSnippet(summary)}
                          </p>
                        </div>

                        {place ? (
                          <span style={styles.placeGroup}>
                            <span style={{ ...styles.place, ...(language === "km" ? styles.trackingNone : null) }}>
                              {place}
                            </span>
                            <span
                              style={styles.placeIcon}
                              className="archive-row-icon"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={styles.snippet}>
                &quot;{formatQueryForDisplay(query)}&quot; {t("archiveNoResultsSuffix")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so this phone layout and the dropdown's
          hidden-by-default state are correct from the first paint instead
          of only after hydration. */}
      <style>{`
        .archive-section {
          justify-content: center;
        }
        .archive-search-panel {
          position: relative;
        }
        .archive-row {
          align-items: center;
          justify-content: space-between;
        }
        .archive-scroll {
          max-height: ${VISIBLE_ROWS * ROW_HEIGHT + (VISIBLE_ROWS - 1) * ROW_GAP}px;
          overflow-y: auto;
        }
        @media (max-width: 640px) {
          /* Top-aligned instead of centered — centering left space unused
             above the content while the dropdown ran out of room below the
             search bar and got clipped by the viewport edge. */
          .archive-section {
            justify-content: flex-start;
          }
          .archive-row {
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
          }
          .archive-results {
            position: absolute;
            top: calc(100% + 10px);
            left: 0;
            right: 0;
            z-index: 20;
            background: #0D0812;
            border: 1px solid #2A172F;
            border-radius: 18px;
            padding: 1rem;
            box-sizing: border-box;
            opacity: 0;
            pointer-events: none;
            transform: translateY(-4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
            overflow-x: hidden;
            /* Fixed px, not vh — the section centers its content, so a
               taller screen mostly adds space above the search bar, not
               below it; vh wouldn't track available space. */
            max-height: 240px;
          }
          .archive-search-panel.has-query .archive-results {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
          /* .archive-scroll (not .archive-results) is the one that scrolls
             — keeps the header a plain, un-scrolled block above it, since
             rows (119px) are taller than the header (~30px) and a sticky
             header could otherwise rest mid-row. */
          .archive-scroll {
            max-height: 156px;
            overflow-y: auto;
            overflow-x: hidden;
          }
          /* Deliberately shorter than "however much the row width allows"
             — ellipsis kicks in sooner than it would at the row's full
             (now full-viewport) width. */
          .archive-snippet {
            max-width: 200px;
          }
        }
      `}</style>
    </section>
  );
}
