"use client";

import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// One of the user's own new stories on /my-submissions, with where it stands:
// waiting for review, rejected (showing the curator's note), or published
// (linking to its page — pending/rejected stories have no public page).
// The "View story" link's :hover lives in app/globals.css (.share-match-link).

// Badge colour per status; the label comes from uiText (submissionsStatus*).
const STATUS = {
  pending: { color: "#E6C575", key: "submissionsStatusPending" },
  published: { color: "#8FC79A", key: "submissionsStatusPublished" },
  rejected: { color: "#E0736A", key: "submissionsStatusRejected" },
};

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";

const styles = {
  card: { backgroundColor: "#120916", border: "1px solid #2A172F", borderRadius: 16, padding: "1.2rem 1.4rem" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  khmerTitle: { fontFamily: "var(--font-khmer), serif", fontSize: "0.9rem", fontWeight: 600, color: "#D4AF37", margin: "0 0 0.2rem" },
  // overflowWrap: the title is whatever the submitter typed.
  title: { fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 600, color: "#F5EFE6", margin: 0, overflowWrap: "anywhere" },
  meta: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#8A7F91", margin: "0.35rem 0 0" },
  badge: { fontFamily: khmerSans, fontSize: "0.75rem", fontWeight: 700, border: "1px solid", borderRadius: 999, padding: "0.2rem 0.7rem", whiteSpace: "nowrap" },
  note: { fontFamily: khmerSans, fontSize: "0.9rem", lineHeight: 1.6, color: "#BBAEBF", margin: "1rem 0 0", padding: "0.8rem 1rem", borderLeft: "2px solid #E0736A", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  noteLabel: { display: "block", fontWeight: 700, color: "#E0736A", marginBottom: "0.25rem" },
  hint: { fontFamily: khmerSans, fontSize: "0.85rem", color: "#8A7F91", margin: "0.8rem 0 0" },
  link: { display: "inline-block", marginTop: "0.8rem", fontFamily: khmerSans, fontSize: "0.85rem", fontWeight: 700, color: "#C5A059", textDecoration: "none" },
};

export default function SubmissionCard({ submission }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const status = STATUS[submission.status] ?? STATUS.pending;
  const category = pickText(language, submission.categoryKhmer, submission.category);
  const date = submission.submittedAt ? submission.submittedAt.slice(0, 10) : "";

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          {submission.khmerTitle ? <p style={styles.khmerTitle}>{submission.khmerTitle}</p> : null}
          <h2 style={styles.title}>{submission.title}</h2>
          <p style={styles.meta}>{category} · {date}</p>
        </div>
        <span style={{ ...styles.badge, color: status.color, borderColor: status.color }}>{t(status.key)}</span>
      </div>

      {submission.status === "pending" ? <p style={styles.hint}>{t("submissionsPendingHint")}</p> : null}
      {submission.status === "rejected" && submission.rejectionNote ? (
        <p style={styles.note}>
          <span style={styles.noteLabel}>{t("submissionsNoteLabel")}</span>
          {submission.rejectionNote}
        </p>
      ) : null}
      {submission.status === "published" ? (
        <Link href={`/${submission.id}`} style={styles.link} className="share-match-link">
          {t("submissionsViewStory")} →
        </Link>
      ) : null}
    </div>
  );
}
