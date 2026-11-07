"use client";

import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatTimestamp } from "../../utils/formatDate.js";
import styles from "./entryCardStyles.js";
import EditEntryButton from "./EditEntryButton.js";
import EditStatus from "./EditStatus.js";

// One of the user's own tellings on /my-entries, with where it stands:
// waiting for review, published (linking to its story), or returned with the
// curator's note. Waiting and returned tellings aren't on the story page, so
// they get an Edit button here; so does a published one with changes waiting
// (EditStatus.js). Same card as SubmissionCard.js. The link's :hover lives in
// app/globals.css (.share-match-link).

// Badge colour per status; the label comes from uiText (tellingStatus*).
const STATUS = {
  pending: { color: "#E6C575", key: "tellingStatusPending" },
  published: { color: "#8FC79A", key: "tellingStatusPublished" },
  returned: { color: "#E0736A", key: "tellingStatusReturned" },
};

export default function TellingCard({ telling }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const status = STATUS[telling.status] ?? STATUS.pending;
  const date = telling.createdAt ? formatTimestamp(telling.createdAt, language) : "";
  const tracking = language === "km" ? styles.trackingNone : null;

  return (
    <div style={telling.status === "returned" ? { ...styles.card, ...styles.cardFlagged } : styles.card}>
      <div style={styles.top}>
        <div>
          <p style={styles.meta}>{date}</p>
          {/* Which story it's a telling of, in the chosen language (Khmer
              name when Khmer is on and there is one, else the English). */}
          <h3 style={styles.title}>{pickText(language, telling.storyKhmerTitle, telling.storyTitle)}</h3>
          {/* The telling's own title, under the story it belongs to. */}
          {telling.title ? <p style={styles.subtitle}>{telling.title}</p> : null}
        </div>
        <span style={{ ...styles.badge, ...tracking, color: status.color }}>
          {t(status.key)}
        </span>
      </div>

      {telling.status === "pending" ? <p style={styles.hint}>{t("tellingPendingHint")}</p> : null}
      {telling.status === "returned" && telling.returnNote ? (
        <p style={styles.note}>
          <span style={{ ...styles.noteLabel, ...tracking }}>{t("submissionsNoteLabel")}</span>
          {telling.returnNote}
        </p>
      ) : null}
      {telling.status === "published" ? <EditStatus telling={telling} /> : null}
      <div style={styles.actions}>
        {telling.status === "published" ? (
          <Link href={`/${telling.storyId}#tellings`} style={{ ...styles.link, ...tracking }} className="share-match-link">
            {t("submissionsViewStory")} →
          </Link>
        ) : null}
        {telling.status !== "published" || telling.edit ? (
          <div style={styles.editSlot}>
            <EditEntryButton
              storyId={telling.storyId}
              storyTitle={telling.storyTitle}
              storyTitleKhmer={telling.storyKhmerTitle}
              telling={telling}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
