"use client";

import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// "Your changes" box on a published telling's /my-entries card, when it has
// an edit waiting on the side (utils/editableEntry.js). The story page keeps
// showing the published version meanwhile, so the card's own badge stays
// "Published" — this box has its own status badge (waiting / returned), the
// curator's note when returned, and exactly what was changed: only the
// fields that differ from the published version, with their new values.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
const styles = {
  box: { marginTop: "1rem", padding: "0.9rem 1rem", borderRadius: 12, backgroundColor: "#1A0F20", borderLeft: "3px solid" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.6rem" },
  heading: { fontFamily: khmerSans, fontSize: "0.9rem", fontWeight: 700, color: "#F5EFE6", margin: 0 },
  badge: { fontFamily: khmerSans, fontSize: "0.72rem", fontWeight: 700, border: "1px solid", borderRadius: 999, padding: "0.15rem 0.6rem", whiteSpace: "nowrap" },
  note: { fontFamily: khmerSans, fontSize: "0.88rem", lineHeight: 1.6, color: "#F5EFE6", margin: "0 0 0.75rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  noteLabel: { display: "block", fontWeight: 700, color: "#E0736A", marginBottom: "0.2rem" },
  label: { fontFamily: khmerSans, fontSize: "0.72rem", fontWeight: 700, color: "#8A7F91", margin: "0.6rem 0 0.15rem" },
  // pre-wrap keeps the owner's line breaks; anywhere breaks a long run.
  value: { fontFamily: khmerSans, fontSize: "0.88rem", lineHeight: 1.6, color: "#D8CFDC", margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  photo: { display: "block", maxWidth: 160, maxHeight: 120, borderRadius: 8, objectFit: "cover" },
  hint: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#8A7F91", margin: "0.75rem 0 0" },
};

export default function EditStatus({ telling }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const edit = telling?.edit;
  if (!edit) return null;

  const returned = edit.status === "returned";
  const color = returned ? "#E0736A" : "#E6C575";
  const changed = {
    title: edit.title !== telling.title,
    place: edit.place !== telling.place,
    description: edit.description !== telling.description,
    photo: (edit.photoUrl ?? null) !== (telling.photoUrl ?? null),
  };
  const nothingChanged = !Object.values(changed).some(Boolean);
  // The changed text fields, with their new values.
  const fields = [
    changed.title && { label: t("contributeTitleLabel"), value: edit.title },
    changed.place && { label: t("contributeLocationLabel"), value: pickText(language, edit.placeKhmer, edit.place) },
    changed.description && { label: t("contributeStoryLabel"), value: edit.description },
  ].filter(Boolean);

  return (
    <div style={{ ...styles.box, borderLeftColor: color }}>
      <div style={styles.head}>
        <p style={styles.heading}>{t("editPanelTitle")}</p>
        <span style={{ ...styles.badge, color, borderColor: color }}>
          {t(returned ? "tellingStatusReturned" : "tellingStatusPending")}
        </span>
      </div>

      {returned && edit.returnNote ? (
        <p style={styles.note}>
          <span style={styles.noteLabel}>{t("submissionsNoteLabel")}</span>
          {edit.returnNote}
        </p>
      ) : null}

      {fields.map((f) => (
        <div key={f.label}>
          <p style={styles.label}>{f.label}</p>
          <p style={styles.value}>{f.value}</p>
        </div>
      ))}
      {changed.photo && edit.photoUrl ? (
        <>
          <p style={styles.label}>{t("editFieldPhoto")}</p>
          <img src={edit.photoUrl} alt={t("editFieldPhoto")} style={styles.photo} />
        </>
      ) : null}
      {nothingChanged ? <p style={styles.value}>{t("editNothingChanged")}</p> : null}

      <p style={styles.hint}>{t(returned ? "editReturnedHint" : "editPendingHint")}</p>
    </div>
  );
}

