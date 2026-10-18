"use client";

import { useState } from "react";
import ArchiveSearch from "../home/ArchiveSearch.js";
import StoryMatchCard from "./StoryMatchCard.js";
import DidYouMean from "./DidYouMean.js";
import StartNewStoryButton from "./StartNewStoryButton.js";
import NewStoryPanel from "./NewStoryPanel.js";
import { searchStories } from "../../utils/storyMatch.js";
import { useTranslation } from "../shared/uiText.js";

// "Share a Memory": first "Is your story already here?" — matches appear as
// the user types; each one leads to that story's tellings, where the existing
// "Share Your Version" button adds theirs. Only once they've searched can
// they choose "start a new one", which swaps this view for NewStoryPanel
// (the query is kept, so "Back to search" returns to the same results).

const styles = {
  // Same top/side padding as the other sections — clears the fixed 90px
  // NavBar and keeps column edges aligned.
  section: {
    backgroundColor: "#0D0812",
    minHeight: "100vh",
    padding: "130px 2rem 4rem",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: { maxWidth: 760, margin: "0 auto" },
  // Deliberately not translated — decorative label, like the site's other
  // eyebrows.
  eyebrow: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: "0 0 1rem",
  },
  title: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2.5rem",
    fontWeight: 600,
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  subtitle: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "#BBAEBF",
    margin: "0 0 2rem",
  },
  results: { marginTop: "2rem" },
  resultsHeading: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#8A7F91",
    margin: "0 0 1rem",
  },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 },
};

export default function ShareSearch({ stories }) {
  const t = useTranslation();
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const { matches, suggestion } = searchStories(query, stories);

  if (composing) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <NewStoryPanel query={query.trim()} onBack={() => setComposing(false)} />
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>Share a Memory</p>
        <h1 style={styles.title}>{t("shareTitle")}</h1>
        <p style={styles.subtitle}>{t("shareSubtitle")}</p>

        <ArchiveSearch value={query} onChange={setQuery} placeholder={t("sharePlaceholder")} />

        {/* aria-live so screen-reader users hear matches appear as they type. */}
        <div style={styles.results} aria-live="polite">
          {query.trim() ? (
            <>
              {matches.length > 0 ? (
                <>
                  <p style={styles.resultsHeading}>{t("shareMatchesHeading")}</p>
                  <ul style={styles.list}>
                    {matches.map((story) => (
                      <li key={story.id}>
                        <StoryMatchCard story={story} />
                      </li>
                    ))}
                  </ul>
                </>
              ) : suggestion ? (
                <DidYouMean story={suggestion} onPick={setQuery} />
              ) : (
                <p style={styles.resultsHeading}>{t("shareNoMatches")}</p>
              )}
              <StartNewStoryButton onStart={() => setComposing(true)} />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
