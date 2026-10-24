"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatDate } from "../../utils/formatDate.js";
import TellingDecision from "./TellingDecision.js";
import s from "./reviewStyles.js";

// One new telling on /review, added to an already-published story: which
// story, who told it, the telling itself (read-only), then the curator's
// Approve / Return (review_entry).

export default function TellingReviewCard({ telling }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const { story } = telling;
  const place = pickText(language, telling.placeKhmer, telling.place);

  return (
    <article style={s.card}>
      {story?.khmerTitle ? <p style={s.khmerTitle}>{story.khmerTitle}</p> : null}
      <h3 style={s.title}>{story?.title ?? "?"}</h3>
      <p style={s.meta}>
        {t("reviewSubmittedBy")} {telling.contributor} ·{" "}
        {telling.createdAt ? formatDate(telling.createdAt.slice(0, 10), language) : ""}
      </p>

      <p style={s.meta}>
        {t("reviewTellingTitle")}: {telling.title} · {place}
      </p>
      <p style={s.body}>{telling.description}</p>
      {telling.photoUrl ? <img src={telling.photoUrl} alt="" style={s.photo} /> : null}

      <hr style={s.divider} />
      <TellingDecision id={telling.id} rpc="review_entry" idKey="entry_id" />
    </article>
  );
}
