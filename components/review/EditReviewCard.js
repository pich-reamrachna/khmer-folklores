"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatTimestamp } from "../../utils/formatDate.js";
import TellingDecision from "./TellingDecision.js";
import s from "./reviewStyles.js";

// One waiting change to a published telling on /review: on the left, which
// story and telling, then only the fields that changed, each as before (what
// the story page shows now) → after (what it would show once approved); on
// the right, the curator's Approve / Return (review_entry_edit). Same
// two-column card as ReviewCard.js.

const styles = {
  label: { ...s.label, display: "block", margin: "1.4rem 0 0.5rem" },
  // Before and after side by side, wrapping to stacked on a narrow screen.
  pair: { display: "flex", flexWrap: "wrap", gap: "0.75rem" },
  side: { flex: "1 1 240px", minWidth: 0, padding: "0.75rem 0.9rem", borderRadius: 2, backgroundColor: "rgba(0, 0, 0, 0.2)", border: "1px solid rgba(245, 239, 230, 0.12)" },
  sideNew: { borderColor: "rgba(197, 160, 89, 0.6)" },
  sideLabel: { fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A89F91", margin: "0 0 0.4rem" },
  value: { ...s.body, margin: 0 },
  photo: { ...s.photo, marginTop: 0 },
};

export default function EditReviewCard({ edit }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const { story, published: before } = edit;
  const place = (x) => pickText(language, x.placeKhmer, x.place);
  const photo = (url) => (url ? <img src={url} alt="" style={styles.photo} /> : <p style={styles.value}>—</p>);

  // Only the fields this edit actually changes.
  const changes = [
    edit.title !== before.title && { key: "contributeTitleLabel", before: before.title, after: edit.title },
    edit.place !== before.place && { key: "contributeLocationLabel", before: place(before), after: place(edit) },
    edit.description !== before.description && { key: "contributeStoryLabel", before: before.description, after: edit.description },
    (edit.photoUrl ?? null) !== (before.photoUrl ?? null) && { key: "reviewPhotoLabel", before: photo(before.photoUrl), after: photo(edit.photoUrl), isNode: true },
  ].filter(Boolean);

  return (
    <article style={s.card} className="review-card">
      <div style={s.read}>
        <h3 style={s.title}>{story?.title ?? "?"}</h3>
        {story?.khmerTitle ? <p style={s.khmerTitle}>{story.khmerTitle}</p> : null}
        <p style={s.meta}>
          {t("reviewSubmittedBy")} <span style={s.metaName}>{before.contributor}</span> · &ldquo;{before.title}&rdquo;
          {edit.updatedAt ? ` · ${formatTimestamp(edit.updatedAt, language)}` : ""}
        </p>

        {changes.map((c) => (
          <div key={c.key}>
            <span style={styles.label}>{t(c.key)}</span>
            <div style={styles.pair}>
              <div style={styles.side}>
                <p style={styles.sideLabel}>{t("reviewBefore")}</p>
                {c.isNode ? c.before : <p style={styles.value}>{c.before}</p>}
              </div>
              <div style={{ ...styles.side, ...styles.sideNew }}>
                <p style={styles.sideLabel}>{t("reviewAfter")}</p>
                {c.isNode ? c.after : <p style={styles.value}>{c.after}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={s.decide}>
        <TellingDecision id={edit.id} rpc="review_entry_edit" idKey="edit_id" />
      </div>
    </article>
  );
}
