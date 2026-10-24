"use client";

import TellingCard from "./TellingCard.js";
import { useTranslation } from "../shared/uiText.js";

// "Your tellings" on /my-entries: every telling the user wrote on a
// published story, newest first (app/my-entries/page.js fetches them).

const styles = {
  empty: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#BBAEBF",
    margin: 0,
  },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 },
};

export default function TellingsList({ tellings }) {
  const t = useTranslation();

  if (tellings.length === 0) return <p style={styles.empty}>{t("tellingsEmpty")}</p>;

  return (
    <ul style={styles.list}>
      {tellings.map((telling) => (
        <li key={telling.id}>
          <TellingCard telling={telling} />
        </li>
      ))}
    </ul>
  );
}
