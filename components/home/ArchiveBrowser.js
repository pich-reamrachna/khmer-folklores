"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArchiveSearch from "./ArchiveSearch.js";
import DidYouMean from "../share/DidYouMean.js";
import { closestStory } from "../../utils/storyMatch.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { startPageLoading } from "../../utils/pageLoading.js";

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
// Rows sit edge to edge, divided by a ruled line (globals.css .archive-row).
const ROW_GAP = 0;
const VISIBLE_ROWS = 4;
// On phone a row stacks its title, snippet and place, so it's taller; the
// list still shows VISIBLE_ROWS of them before scrolling.
const PHONE_ROW_HEIGHT = 149;
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

// Zero-width space/joiners are invisible, so pasted Khmer text can carry
// one without any visual sign — strip them before matching, or a copy
// with a stray hint character silently fails to match the clean stored
// text even though the two look identical.
const INVISIBLE_CHARS = /[\u200b-\u200d\ufeff]/g;
function stripInvisible(text) {
  return text.replace(INVISIBLE_CHARS, "");
}

// Splits a query into search terms: "quoted phrases" become one literal
// term each (spaces inside stay part of that term); everything outside
// quotes is split on whitespace into individual word terms. `quoted` is
// kept so a quoted term can stay exact (see matchesAllTerms).
function parseSearchTerms(query) {
  const terms = [];
  const pattern = /"([^"]*)"|(\S+)/g;
  let match;
  while ((match = pattern.exec(query)) !== null) {
    const text = stripInvisible((match[1] ?? match[2]).trim());
    if (text) terms.push({ text, quoted: match[1] !== undefined });
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
// substring for Khmer; for Latin terms, the start of a word
// (\p{L}/\p{N} lookaround, not \b, which is ASCII-only and never matches
// around Khmer text). A bare word of 3+ letters may match the start of a
// longer word ("bram" → "Bramat"), so results show up while the user is
// still typing — leaving "Did you mean …?" for real spelling mistakes.
// Quoted phrases and 1–2 letter words must match whole words, as before.
const PREFIX_MIN = 3;
function matchesAllTerms(haystack, terms) {
  return terms.every(({ text, quoted }) => {
    if (KHMER_SCRIPT.test(text)) {
      return haystack.toLowerCase().includes(text.toLowerCase());
    }
    const allowPrefix = !quoted && [...text].length >= PREFIX_MIN;
    const wordEnd = allowPrefix ? "" : "(?![\\p{L}\\p{N}])";
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(text)}${wordEnd}`, "iu");
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
    // Misty ink-wash mountains on old paper — a light parchment section,
    // with dark ink text, between the dark hero and footer. The plain
    // paper colour shows until the picture loads.
    backgroundColor: "#D8D3CA",
    backgroundImage: "url(/mist-inkwash.webp)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width: "100%",
    // Same top padding as StoryHero — clears the fixed 90px NavBar.
    // Same side padding as StoryHero — keeps the columns aligned.
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
  },
  // The heading block is centred over the search and list, like a title
  // page. Deliberately not translated — a decorative label, kept English
  // like the site's other stylistic branding text.
  eyebrow: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7A5C2E",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    textAlign: "center",
    margin: "0 0 1.1rem",
  },
  // title/subtitle: this section's own static heading copy (not a
  // story's title, which always stays English per Step 5) and are
  // translated, so each needs var(--font-khmer) explicitly instead of
  // inheriting `section`'s Latin-only stack.
  // Cinzel first: the Khmer font also draws Latin letters, so listed first
  // it would win for English too. Cinzel has no Khmer letters, so Khmer
  // text still falls through to the Khmer font.
  title: {
    fontFamily: "var(--font-cinzel), var(--font-khmer), serif, 'Times New Roman'",
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
    fontWeight: 500,
    color: "#24201B",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 1.1,
    margin: "0 0 1.2rem",
  },
  subtitle: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.1rem",
    color: "#4A4339",
    fontWeight: 400,
    lineHeight: 1.6,
    textAlign: "center",
    maxWidth: 640,
    margin: "0 auto 2.75rem",
  },
  // The search bar spans the full width (.archive-search-bar--light).
  searchRow: {
    display: "flex",
    marginBottom: "1.75rem",
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
    borderBottom: "1px solid rgba(60, 50, 40, 0.25)",
    paddingBottom: "0.85rem",
  },
  // Translated ("Stories in View" label) — needs var(--font-khmer). An
  // italic old-print note, like a ledger annotation.
  listCount: {
    fontFamily: "var(--font-fell), var(--font-khmer), serif",
    fontSize: "1rem",
    fontStyle: "italic",
    color: "#5A5248",
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
    cursor: "pointer",
  },
  textCol: {
    minWidth: 0,
    flex: 1,
  },
  // Sizes, weights and inks chosen to read clearly on the pale, textured
  // paper — lighter/smaller versions blurred into it.
  khmerTitle: {
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#4A4339",
    margin: "0 0 0.2rem",
  },
  rowTitle: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.45rem",
    fontWeight: 600,
    color: "#1C1915",
    margin: 0,
  },
  // fontFamily on snippet/place: both can now show a Khmer field
  // (description/place swap by language) — see EntryCard.js for why this
  // needs var(--font-khmer) explicitly.
  snippet: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#3A342C",
    margin: "0.3rem 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  // Spacing above the "Did you mean …?" line under the no-results message.
  suggestion: {
    marginTop: "0.75rem",
  },
  placeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flex: "0 0 auto",
  },
  place: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#4F4130",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    margin: 0,
  },
  // The PNG is recolored ink-brown via mask-image (background-color shows
  // through wherever the image is opaque), same technique as the other
  // icons in this app. The hover-triggered nudge lives in app/globals.css's
  // .archive-row:hover rule, not here — an inline transform would always
  // beat that rule for the same property.
  placeIcon: {
    display: "inline-block",
    width: 10,
    height: 10,
    backgroundColor: "#4F4130",
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
        // searchIndex (built in app/page.js) covers every version's place/
        // description/contributor, not just the one telling this row
        // displays — otherwise a term only present in a second or third
        // version could never be found.
        const haystack = [
          entry.title,
          entry.khmerTitle,
          entry.summary,
          entry.summaryKhmer,
          entry.searchIndex,
          entry.category,
          entry.categoryKhmer,
        ]
          .filter(Boolean)
          .join(" ");
        return matchesAllTerms(haystack, searchTerms);
      })
    : stories;
  // Only worked out when the search came up empty.
  const suggestion = filteredStories.length === 0 ? closestStory(query, stories) : null;

  return (
    <section style={styles.section} className="archive-section">
      <div style={styles.container}>
        <p style={styles.eyebrow}>Open the Ledger</p>

        <h2 style={{ ...styles.title, ...(language === "km" ? styles.trackingNone : null) }}>
          {t("archiveTitle")}
        </h2>
        <p style={styles.subtitle}>{t("archiveSubtitle")}</p>

        <div className={`archive-search-panel${query ? " has-query" : ""}`}>
          <div style={styles.searchRow}>
            <ArchiveSearch value={query} onChange={setQuery} light />
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
                        onClick={() => {
                          startPageLoading(`/${entry.id}`);
                          router.push(`/${entry.id}`);
                        }}
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
              <>
                <p style={styles.snippet}>
                  &quot;{formatQueryForDisplay(query)}&quot; {t("archiveNoResultsSuffix")}
                </p>
                {/* Nothing matched exactly — offer the closest story by
                    name/summary (typo-tolerant, see utils/storyMatch.js).
                    Picking it searches for its title, which matches. */}
                {suggestion ? (
                  <div style={styles.suggestion}>
                    <DidYouMean story={suggestion} onPick={setQuery} light />
                  </div>
                ) : null}
              </>
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
        /* An ink-brown scrollbar on the parchment, in place of the shared
           gold-on-dark one (globals.css .archive-scroll). */
        .archive-section .archive-scroll {
          scrollbar-color: #8a7354 rgba(60, 50, 40, 0.12);
        }
        .archive-section .archive-scroll::-webkit-scrollbar-track {
          background: rgba(60, 50, 40, 0.12);
        }
        .archive-section .archive-scroll::-webkit-scrollbar-thumb {
          background-color: #8a7354;
        }
        @media (max-width: 640px) {
          /* Top-aligned instead of centered, so the list gets the room
             under the search bar. */
          .archive-section {
            justify-content: flex-start;
          }
          .archive-row {
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
          }
          /* The list sits under the search bar and is always there, like
             on wide screens (it used to be a dropdown that only opened once
             something was typed, so the list was hidden). It shows four
             stories, then scrolls on its own. */
          .archive-results {
            margin-top: 1.25rem;
          }
          .archive-scroll {
            /* +1 so the fourth row's ruled line shows too. */
            max-height: ${VISIBLE_ROWS * PHONE_ROW_HEIGHT + 1}px;
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
