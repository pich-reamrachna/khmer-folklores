"use client";

import Link from "next/link";
import SubmissionCard from "./SubmissionCard.js";
import { useTranslation } from "../shared/uiText.js";

// /my-submissions' list of the user's own new stories, newest first
// (app/my-submissions/page.js does the fetching). The empty-state link's
// :hover lives in app/globals.css (.share-match-link) — styled-jsx can't
// scope through next/link's Link.

const styles = {
  // Same top/side padding as /share and /review — clears the fixed NavBar.
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
    margin: "0 0 0.75rem",
  },
  status: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#BBAEBF",
    margin: "0 0 2rem",
  },
  link: { color: "#C5A059", fontWeight: 700, textDecoration: "none" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 },
};

export default function SubmissionsList({ submissions, loadFailed }) {
  const t = useTranslation();

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>My Submissions</p>
        <h1 style={styles.title}>{t("submissionsTitle")}</h1>

        {loadFailed ? (
          <p style={styles.status}>{t("submissionsLoadError")}</p>
        ) : submissions.length === 0 ? (
          <p style={styles.status}>
            {t("submissionsEmpty")}{" "}
            <Link href="/share" style={styles.link} className="share-match-link">
              {t("navShareMemory")}
            </Link>
          </p>
        ) : (
          <ul style={styles.list}>
            {submissions.map((submission) => (
              <li key={submission.id}>
                <SubmissionCard submission={submission} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
