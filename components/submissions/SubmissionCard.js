"use client";

import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import styles from "./entryCardStyles.js";

// One of the user's own new stories on /my-entries, with where it stands:
// waiting for review, rejected (showing the curator's note), or published
// (linking to its page — pending/rejected stories have no public page).
// The "View story" link's :hover lives in app/globals.css (.share-match-link).

// Badge colour per status; the label comes from uiText (submissionsStatus*).
const STATUS = {
  pending: { color: "#E6C575", key: "submissionsStatusPending" },
  published: { color: "#8FC79A", key: "submissionsStatusPublished" },
  rejected: { color: "#E0736A", key: "submissionsStatusRejected" },
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
          <h3 style={styles.title}>{submission.title}</h3>
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
