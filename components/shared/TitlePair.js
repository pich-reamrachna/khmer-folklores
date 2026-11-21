"use client";

import { useLanguage } from "./LanguageContext.js";

// A story's English and Khmer names shown together, at the same size and in
// the same colour (the review cards and My Entries). The chosen language's
// name comes first, as the heading — the same rule as the story page — and
// the other sits under it. Each page passes its own two styles, so the
// sizes stay its own; what tells the two apart is the script itself (Cinzel
// capitals vs. the Khmer serif) and the small gap between them. A story
// with no Khmer name just shows the English one.
// fixedOrder: always English first, whatever the language — the review page
// (ReviewSubmission.js), where the curator reads both names and the swap on
// a language toggle only moved them around.

const styles = {
  pair: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
};

export default function TitlePair({ title, khmerTitle, englishStyle, khmerStyle, fixedOrder = false }) {
  const { language } = useLanguage();
  const names = [
    { text: title, style: englishStyle },
    { text: khmerTitle, style: khmerStyle },
  ].filter((name) => name.text);
  if (language === "km" && !fixedOrder) names.reverse();

  return (
    <div style={styles.pair}>
      {names.map((name, i) =>
        i === 0 ? (
          <h3 key="first" style={name.style}>{name.text}</h3>
        ) : (
          <p key="second" style={name.style}>{name.text}</p>
        )
      )}
    </div>
  );
}
