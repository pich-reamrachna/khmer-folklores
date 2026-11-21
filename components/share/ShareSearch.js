"use client";

import { useState } from "react";
import StorySearch from "./StorySearch.js";
import NewStoryPanel from "./NewStoryPanel.js";
import SignInPrompt from "./SignInPrompt.js";
import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";
import styles from "./shareSearchStyles.js";
import { useSignedIn } from "./useSignedIn.js";

// "Share a Memory": picks which of three views /share shows.
//  - Signed out: SignInPrompt — sharing needs an account, so they're told up
//    front instead of after searching and picking a story.
//  - Signed in: StorySearch, "Is your story already here?"
//  - After "start a new one": NewStoryPanel, the new-story form (the query
//    is kept here, so "Back to search" returns to the same results).
// While the session is still being checked (a moment), only the eyebrow
// shows, so neither the prompt nor the search flashes up and then swaps.

export default function ShareSearch() {
  const t = useTranslation();
  const { language } = useLanguage();
  const signedIn = useSignedIn(); // undefined while checking
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);

  if (composing) {
    return (
      <section style={styles.section}>
        <div style={styles.waves} aria-hidden="true" />
        <div style={styles.container}>
          <NewStoryPanel query={query.trim()} onBack={() => setComposing(false)} />
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.waves} aria-hidden="true" />
      <div style={styles.container}>
        <p style={{ ...styles.eyebrow, ...(language === "km" ? styles.trackingNone : null) }}>{t("navShareMemory")}</p>
        {signedIn === false ? <SignInPrompt /> : null}
        {signedIn ? <StorySearch query={query} setQuery={setQuery} onStart={() => setComposing(true)} /> : null}
      </div>
    </section>
  );
}
