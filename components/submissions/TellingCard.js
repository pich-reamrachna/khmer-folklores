"use client";

import Link from "next/link";
import { useTranslation } from "../shared/uiText.js";
import styles from "./entryCardStyles.js";

// One of the user's own tellings on /my-entries, with where it stands:
// waiting for review (new, or edited and back in review), published (linking
// to its story), or returned with the curator's note. Same card as
// SubmissionCard.js. The link's :hover lives in app/globals.css
// (.share-match-link).

// Badge colour per status; the label comes from uiText (tellingStatus*).
const STATUS = {
  pending: { color: "#E6C575", key: "tellingStatusPending" },
  published: { color: "#8FC79A", key: "tellingStatusPublished" },
  returned: { color: "#E0736A", key: "tellingStatusReturned" },
};

export default function TellingCard({ telling }) {
  const t = useTranslation();
  const status = STATUS[telling.status] ?? STATUS.pending;
  const date = telling.createdAt ? telling.createdAt.slice(0, 10) : "";

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          {/* Which story it's a telling of: Khmer name above the English. */}
          {telling.storyKhmerTitle ? <p style={styles.khmerTitle}>{telling.storyKhmerTitle}</p> : null}
          <h3 style={styles.title}>{telling.storyTitle}</h3>
          <p style={styles.meta}>
            {telling.title ? `"${telling.title}" · ` : ""}
            {date}
          </p>
        </div>
        <span style={{ ...styles.badge, color: status.color, borderColor: status.color }}>{t(status.key)}</span>
      </div>

      {telling.status === "pending" ? <p style={styles.hint}>{t("tellingPendingHint")}</p> : null}
      {telling.status === "returned" && telling.returnNote ? (
        <p style={styles.note}>
          <span style={styles.noteLabel}>{t("submissionsNoteLabel")}</span>
          {telling.returnNote}
        </p>
      ) : null}
      {telling.status === "published" ? (
        <Link href={`/${telling.storyId}#tellings`} style={styles.link} className="share-match-link">
          {t("submissionsViewStory")} →
        </Link>
      ) : null}
    </div>
  );
}
