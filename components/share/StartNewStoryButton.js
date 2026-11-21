"use client";

import { useTranslation } from "../shared/uiText.js";

// "My story isn't here — start a new one", under /share's search results.
// Only signed-in visitors see it: ShareSearch.js shows signed-out ones
// SignInPrompt.js instead of the search.

const styles = {
  // Dark ink on /share's parchment. No rule above: the match rows above it
  // already end on one (StoryMatchCard.js), and two made a double line.
  wrap: { marginTop: "2.25rem" },
};

export default function StartNewStoryButton({ onStart }) {
  const t = useTranslation();

  return (
    <div style={styles.wrap}>
      <button type="button" className="start-new-btn" onClick={onStart}>
        {t("shareStartNew")}
      </button>

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
