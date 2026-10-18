"use client";

import { useState } from "react";
import ArchiveSearch from "../home/ArchiveSearch.js";
import StoryMatchCard from "./StoryMatchCard.js";
import DidYouMean from "./DidYouMean.js";
import StartNewStoryButton from "./StartNewStoryButton.js";
import NewStoryPanel from "./NewStoryPanel.js";
import { searchStories } from "../../utils/storyMatch.js";
import { useTranslation } from "../shared/uiText.js";
import styles from "./shareSearchStyles.js";
import { usePublishedStories } from "./usePublishedStories.js";

// "Share a Memory": first "Is your story already here?" — matches appear as
// the user types; each one leads to that story's tellings, where the existing
// "Share Your Version" button adds theirs. Only once they've searched can
// they choose "start a new one", which swaps this view for NewStoryPanel
// (the query is kept, so "Back to search" returns to the same results).

export default function ShareSearch() {
  const t = useTranslation();
  const stories = usePublishedStories(); // null until loaded
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const { matches, suggestion } = searchStories(query, stories ?? []);

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

        <div style={styles.searchWrap}>
          <ArchiveSearch value={query} onChange={setQuery} placeholder={t("sharePlaceholder")} />
        </div>

        {/* aria-live so screen-reader users hear matches appear as they type. */}
        <div style={styles.results} aria-live="polite">
          {/* Typed before the stories arrived: say so, rather than a false
              "no similar stories" plus a "start a new one" that would skip
              the duplicate check. */}
          {query.trim() && stories === null ? (
            <p style={styles.resultsHeading}>{t("shareLoadingStories")}</p>
          ) : query.trim() ? (
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
                <div style={styles.centred}>
                  <DidYouMean story={suggestion} onPick={setQuery} />
                </div>
              ) : (
                <p style={styles.resultsHeading}>{t("shareNoMatches")}</p>
              )}
              <div style={styles.centred}>
                <StartNewStoryButton onStart={() => setComposing(true)} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
