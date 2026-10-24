"use client";

import ReviewCard from "./ReviewCard.js";
import TellingReviewCard from "./TellingReviewCard.js";
import EditReviewCard from "./EditReviewCard.js";
import { useTranslation } from "../shared/uiText.js";

// /review's queue, in three sections — new stories, new tellings on
// published stories, and waiting changes to published tellings — each oldest
// first. A section only shows when it has something in it.
// app/review/page.js does the fetching and the curator-only check.

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
  heading: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#E6C575",
    margin: "0 0 1rem",
  },
  part: { marginBottom: "3rem" },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 },
};

export default function ReviewQueue({ submissions, tellings, edits, loadFailed }) {
  const t = useTranslation();
  const total = submissions.length + tellings.length + edits.length;

  let status = `${total} ${t("reviewPendingCount")}`;
  if (loadFailed) status = t("reviewLoadError");
  else if (total === 0) status = t("reviewEmpty");

  // [heading key, items, card for one item]
  const sections = [
    ["reviewStoriesHeading", submissions, (x) => <ReviewCard submission={x} />],
    ["reviewTellingsHeading", tellings, (x) => <TellingReviewCard telling={x} />],
    ["reviewEditsHeading", edits, (x) => <EditReviewCard edit={x} />],
  ];

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>Curator Review</p>
        <h1 style={styles.title}>{t("reviewTitle")}</h1>
        <p style={styles.count}>{status}</p>

        {sections.map(([headingKey, items, card]) =>
          items.length > 0 ? (
            <div key={headingKey} style={styles.part}>
              <h2 style={styles.heading}>
                {t(headingKey)} ({items.length})
              </h2>
              <ul style={styles.list}>
                {items.map((item) => (
                  <li key={item.id}>{card(item)}</li>
                ))}
              </ul>
            </div>
          ) : null
        )}
      </div>
    </section>
  );
}
