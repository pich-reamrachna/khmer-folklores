"use client";

import { useTranslation } from "../shared/uiText.js";

// "Did you mean …?" line offering the single closest story when a search
// finds nothing — on /share (searchStories' suggestion) and under the home
// page archive's no-results message (closestStory). Clicking it puts that
// title in the search box via onPick, which turns it into a real match.

const styles = {
  line: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.95rem",
    color: "#BBAEBF",
    margin: 0,
  },
};

export default function DidYouMean({ story, onPick }) {
  const t = useTranslation();

  return (
    <p style={styles.line}>
      {t("shareDidYouMean")}{" "}
      <button type="button" className="did-you-mean-btn" onClick={() => onPick(story.title)}>
        {story.title}
      </button>
      ?

      {/* Native <button>, so styled-jsx scoping works; base + hover together. */}
      <style jsx>{`
        .did-you-mean-btn {
          background: transparent;
          border: none;
          padding: 0;
          color: #c5a059;
          font: inherit;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }
        .did-you-mean-btn:hover {
          color: #ffffff;
        }
      `}</style>
    </p>
  );
}
