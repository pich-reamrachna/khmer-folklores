"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatTimestamp } from "../../utils/formatDate.js";
import reviewStyles from "./reviewStyles.js";
import TitlePair from "../shared/TitlePair.js";

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
      {submission.category ? (
        <p style={{ ...reviewStyles.kicker, ...tracking }}>{pickText(language, submission.categoryKhmer, submission.category)}</p>
      ) : null}
      <TitlePair
        title={submission.title}
        khmerTitle={submission.khmerTitle}
        englishStyle={reviewStyles.title}
        khmerStyle={reviewStyles.khmerTitle}
      />
      <p style={reviewStyles.meta}>
        {t("reviewSubmittedBy")} <span style={reviewStyles.metaName}>{origin?.contributor ?? "?"}</span>
        {place ? ` · ${place}` : ""}
        {submission.submittedAt ? ` · ${formatTimestamp(submission.submittedAt, language)}` : ""}
      </p>

      {origin ? (
        <>
          <p style={{ ...reviewStyles.subhead, ...tracking }}>{t("reviewTellingTitle")}</p>
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
