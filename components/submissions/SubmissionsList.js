"use client";

import Link from "next/link";
import SubmissionCard from "./SubmissionCard.js";
import { useTranslation } from "../shared/uiText.js";

// "Stories you started" on /my-entries: the user's own new stories, newest
// first (app/my-entries/page.js fetches them). The empty-state link's
// :hover lives in app/globals.css (.share-match-link) — styled-jsx can't
// scope through next/link's Link.

const styles = {
  empty: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#BBAEBF",
    margin: 0,
  },
  link: { color: "#C5A059", fontWeight: 700, textDecoration: "none" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 },
};

export default function SubmissionsList({ submissions }) {
  const t = useTranslation();

  if (submissions.length === 0) {
    return (
      <p style={styles.empty}>
        {t("submissionsEmpty")}{" "}
        <Link href="/share" style={styles.link} className="share-match-link">
          {t("navShareMemory")}
        </Link>
      </p>
    );
  }

  return (
    <ul style={styles.list}>
      {submissions.map((submission) => (
        <li key={submission.id}>
          <SubmissionCard submission={submission} />
        </li>
      ))}
    </ul>
  );
}
