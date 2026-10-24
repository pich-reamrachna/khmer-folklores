"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formatDate } from "../../utils/formatDate.js";
import TellingDecision from "./TellingDecision.js";
import s from "./reviewStyles.js";

// One waiting change to a published telling on /review: which story and
// telling, then only the fields that changed, each as before (what the story
// page shows now) → after (what it would show once approved). Then the
// curator's Approve / Return (review_entry_edit).

const styles = {
  label: { ...s.label, display: "block", margin: "1.25rem 0 0.4rem" },
  // Before and after side by side, wrapping to stacked on a narrow screen.
  pair: { display: "flex", flexWrap: "wrap", gap: "0.75rem" },
  side: { flex: "1 1 240px", minWidth: 0, padding: "0.75rem 0.9rem", borderRadius: 10, backgroundColor: "#0C0A12", border: "1px solid #2A172F" },
  sideNew: { borderColor: "rgba(197, 160, 89, 0.6)" },
  sideLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#8A7F91", margin: "0 0 0.35rem" },
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
    <article style={s.card}>
      {story?.khmerTitle ? <p style={s.khmerTitle}>{story.khmerTitle}</p> : null}
      <h3 style={s.title}>{story?.title ?? "?"}</h3>
      <p style={s.meta}>
        {t("reviewSubmittedBy")} {before.contributor} · &ldquo;{before.title}&rdquo; ·{" "}
        {edit.updatedAt ? formatDate(edit.updatedAt.slice(0, 10), language) : ""}
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

      <hr style={s.divider} />
      <TellingDecision id={edit.id} rpc="review_entry_edit" idKey="edit_id" />
    </article>
  );
}
