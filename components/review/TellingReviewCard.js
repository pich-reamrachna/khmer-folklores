"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import ZoomablePhoto from "../shared/ZoomablePhoto.js";
import { formatTimestamp } from "../../utils/formatDate.js";
import TellingDecision from "./TellingDecision.js";
import s from "./reviewStyles.js";

// One new telling on /review, added to an already-published story: on the
// left, which story, who told it and the telling itself (read-only); on the
// right, the curator's Approve / Return (review_entry). Same two-column card
// as ReviewCard.js.

export default function TellingReviewCard({ telling }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const { story } = telling;
  const place = pickText(language, telling.placeKhmer, telling.place);
  const tracking = language === "km" ? s.trackingNone : null;
  // Just the story's name in the chosen language (here it's only a reminder
  // of which story; the telling is what's being reviewed). Khmer only when
  // the story has a Khmer name, styled to match the script shown.
  const titleIsKhmer = language === "km" && Boolean(story?.khmerTitle);

  return (
    <article style={s.card} className="review-card">
      <div style={s.read}>
        <h3 style={titleIsKhmer ? s.khmerTitle : s.title}>{titleIsKhmer ? story.khmerTitle : story?.title ?? "?"}</h3>
        <p style={s.meta}>
          {t("reviewSubmittedBy")} <span style={s.metaName}>{telling.contributor}</span>
          {place ? ` · ${place}` : ""}
          {telling.createdAt ? ` · ${formatTimestamp(telling.createdAt, language)}` : ""}
        </p>

        <p style={{ ...s.subhead, ...tracking }}>{t("reviewTellingTitle")}</p>
        {telling.title ? <p style={s.tellingTitle}>{telling.title}</p> : null}
        <p style={s.body}>{telling.description}</p>
        {telling.photoUrl ? <ZoomablePhoto src={telling.photoUrl} alt={t("reviewPhotoLabel")} style={s.photo} /> : null}
      </div>
      <div style={s.decide}>
        <TellingDecision id={telling.id} rpc="review_entry" idKey="entry_id" />
      </div>
    </article>
  );
}
