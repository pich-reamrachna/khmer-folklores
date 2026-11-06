"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client.js";
import { useTranslation } from "../shared/uiText.js";

// "My story isn't here — start a new one", under /share's search results.
// Checks the session first, so a logged-out visitor is told to log in before
// filling in the whole form, not after.
// The login link's :hover lives in app/globals.css (.share-login-link) —
// styled-jsx can't scope through next/link's Link.

const styles = {
  // Dark ink on /share's parchment. No rule above: the match rows above it
  // already end on one (StoryMatchCard.js), and two made a double line.
  wrap: { marginTop: "2.25rem" },
  loginNote: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.95rem",
    color: "#4A4339",
    margin: "1rem 0 0",
  },
  loginLink: { color: "#6B4F26", fontWeight: 700, textDecoration: "none" },
};

export default function StartNewStoryButton({ onStart }) {
  const t = useTranslation();
  const [needsLogin, setNeedsLogin] = useState(false);

  async function handleClick() {
    const { data } = await createClient().auth.getUser();
    if (data?.user) onStart();
    else setNeedsLogin(true);
  }

  return (
    <div style={styles.wrap}>
      <button type="button" className="start-new-btn" onClick={handleClick}>
        {t("shareStartNew")}
      </button>
      {needsLogin ? (
        <p style={styles.loginNote}>
          {t("shareLoginToStart")}{" "}
          {/* ?next= brings them back here after logging in (see app/login/page.js). */}
          <Link href="/login?next=/share" style={styles.loginLink} className="share-login-link ink-link">
            {t("shareLoginLink")}
          </Link>
        </p>
      ) : null}

      {/* Native <button>, so styled-jsx scoping works; base + hover together. */}
      <style jsx>{`
        .start-new-btn {
          background: transparent;
          border: 1px solid #6b4f26;
          border-radius: 999px;
          padding: 0.75rem 1.4rem;
          color: #4f3a1c;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .start-new-btn:hover {
          background-color: #24201b;
          border-color: #24201b;
          color: #f5efe6;
        }
      `}</style>
    </div>
  );
}
