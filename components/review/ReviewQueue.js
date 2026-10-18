"use client";

import ReviewCard from "./ReviewCard.js";
import { useTranslation } from "../shared/uiText.js";

// /review's list of pending new stories, oldest first (app/review/page.js
// does the fetching and the curator-only check).

const styles = {
  // Same top/side padding as /share — clears the fixed 90px NavBar.
  section: {
    backgroundColor: "#0D0812",
    minHeight: "100vh",
    padding: "130px 2rem 4rem",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: { maxWidth: 860, margin: "0 auto" },
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
  count: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    color: "#BBAEBF",
    margin: "0 0 2rem",
  },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 },
};

export default function ReviewQueue({ submissions, loadFailed }) {
  const t = useTranslation();

  let status = `${submissions.length} ${t("reviewPendingCount")}`;
  if (loadFailed) status = t("reviewLoadError");
  else if (submissions.length === 0) status = t("reviewEmpty");

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>Curator Review</p>
        <h1 style={styles.title}>{t("reviewTitle")}</h1>
        <p style={styles.count}>{status}</p>

        <ul style={styles.list}>
          {submissions.map((submission) => (
            <li key={submission.id}>
              <ReviewCard submission={submission} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
