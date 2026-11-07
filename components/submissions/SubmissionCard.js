"use client";

import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatTimestamp } from "../../utils/formatDate.js";
import styles from "./entryCardStyles.js";
import EditEntryButton from "./EditEntryButton.js";
import EditStatus from "./EditStatus.js";

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
  const date = submission.submittedAt ? formatTimestamp(submission.submittedAt, language) : "";
  const isPublished = submission.status === "published";
  // The story's first telling — its waiting edit, if any, is shown once the
  // story is published (before that, the story's own review covers it).
  const first = submission.firstTelling;
  const tracking = language === "km" ? styles.trackingNone : null;

  return (
    <div style={submission.status === "rejected" ? { ...styles.card, ...styles.cardFlagged } : styles.card}>
      <div style={styles.top}>
        <div>
          <p style={styles.meta}>{date}</p>
          {/* In the chosen language — the Khmer name when Khmer is on and
              the story has one, else the English. */}
          <h3 style={styles.title}>{pickText(language, submission.khmerTitle, submission.title)}</h3>
        </div>
        <span style={{ ...styles.badge, ...tracking, color: status.color }}>
          {t(status.key)}
        </span>
      </div>

      {submission.status === "pending" ? <p style={styles.hint}>{t("submissionsPendingHint")}</p> : null}
      {submission.status === "rejected" && submission.rejectionNote ? (
        <p style={styles.note}>
          <span style={{ ...styles.noteLabel, ...tracking }}>{t("submissionsNoteLabel")}</span>
          {submission.rejectionNote}
        </p>
      ) : null}
      {/* A published story whose first telling has changes waiting for
          review (or returned): the story page still shows the published
          version until they're approved. */}
      {isPublished ? <EditStatus telling={first} /> : null}
      {/* Every story the user can still change has an Edit button — it edits
          the story's first telling (the story itself): a waiting story's
          directly, a published one's as changes for the curator to review.
          Not a story that wasn't accepted: changing it wouldn't send it back
          to review, so the curator's note points to sharing it anew. */}
      {submission.status !== "rejected" ? (
        <div style={styles.actions}>
          {isPublished ? (
            <Link href={`/${submission.id}`} style={{ ...styles.link, ...tracking }} className="share-match-link">
              {t("submissionsViewStory")} →
            </Link>
          ) : null}
          {first ? (
            <div style={styles.editSlot}>
              <EditEntryButton
                storyId={submission.id}
                storyTitle={submission.title}
                storyTitleKhmer={submission.khmerTitle}
                telling={first}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
