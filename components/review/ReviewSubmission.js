"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatTimestamp } from "../../utils/formatDate.js";
import reviewStyles from "./reviewStyles.js";

// The read-only half of a /review card: the story as submitted and its first
// telling, so the curator can read it before writing the summary.

export default function ReviewSubmission({ submission }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const { origin } = submission;
  const place = origin ? pickText(language, origin.placeKhmer, origin.place) : "";
  const tracking = language === "km" ? reviewStyles.trackingNone : null;

  return (
    <div>
      {submission.category ? <p style={{ ...reviewStyles.kicker, ...tracking }}>{submission.category}</p> : null}
      <h3 style={reviewStyles.title}>{submission.title}</h3>
      {submission.khmerTitle ? <p style={reviewStyles.khmerTitle}>{submission.khmerTitle}</p> : null}
      <p style={reviewStyles.meta}>
        {t("reviewSubmittedBy")} <span style={reviewStyles.metaName}>{origin?.contributor ?? "?"}</span>
        {place ? ` · ${place}` : ""}
        {submission.submittedAt ? ` · ${formatTimestamp(submission.submittedAt, language)}` : ""}
      </p>

      {origin ? (
        <>
          <p style={{ ...reviewStyles.subhead, ...tracking }}>{t("reviewTellingTitle")}</p>
          {origin.title ? <p style={reviewStyles.tellingTitle}>{origin.title}</p> : null}
          <p style={reviewStyles.body}>{origin.description}</p>
          {origin.photoUrl ? <img src={origin.photoUrl} alt="" style={reviewStyles.photo} /> : null}
        </>
      ) : (
        // Shouldn't happen — submit_story always links the first telling —
        // but a story without one shouldn't crash the whole queue.
        <p style={{ ...reviewStyles.error, marginTop: "1rem" }}>{t("reviewNoTelling")}</p>
      )}
    </div>
  );
}
