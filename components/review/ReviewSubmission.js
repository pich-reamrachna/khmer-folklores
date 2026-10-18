"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import reviewStyles from "./reviewStyles.js";

// The read-only half of a /review card: the story as submitted and its first
// telling, so the curator can read it before writing the summary.

// submitted_at is a full timestamp; a plain readable date is enough for the
// curator's queue.
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ReviewSubmission({ submission }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const { origin } = submission;
  const place = origin ? pickText(language, origin.placeKhmer, origin.place) : "";

  return (
    <div>
      {submission.khmerTitle ? <p style={reviewStyles.khmerTitle}>{submission.khmerTitle}</p> : null}
      <h2 style={reviewStyles.title}>{submission.title}</h2>
      <p style={reviewStyles.meta}>
        {submission.category} · {t("reviewSubmittedBy")} {origin?.contributor ?? "?"} ·{" "}
        {formatDate(submission.submittedAt)}
      </p>

      {origin ? (
        <>
          <p style={reviewStyles.meta}>
            {t("reviewTellingTitle")}: {origin.title} · {place}
          </p>
          <p style={reviewStyles.body}>{origin.description}</p>
          {origin.photoUrl ? <img src={origin.photoUrl} alt="" style={reviewStyles.photo} /> : null}
        </>
      ) : (
        // Shouldn't happen — submit_story always links the first telling —
        // but a story without one shouldn't crash the whole queue.
        <p style={reviewStyles.error}>{t("reviewNoTelling")}</p>
      )}
    </div>
  );
}
