"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import categories from "../../data/categories.js";
import { useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import ReviewActions from "./ReviewActions.js";
import DecisionPicker from "./DecisionPicker.js";
import s from "./reviewStyles.js";

// The curator's half of a /review card. First choose Approve or Reject
// (DecisionPicker.js); only that decision's fields show: approving shows the
// story's name, Khmer name and category to tidy and its summary to write,
// rejecting shows the note the submitter will see. Typed values are kept if
// the choice is switched. Approving needs a summary, rejecting needs a note — the database
// enforces the summary rule too (stories_published_needs_summary).

const MAX = 1000;

export default function ReviewForm({ submission }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation();
  const [title, setTitle] = useState(submission.title ?? "");
  const [khmerTitle, setKhmerTitle] = useState(submission.khmerTitle ?? "");
  const [category, setCategory] = useState(submission.category ?? "");
  const [summary, setSummary] = useState("");
  const [summaryKhmer, setSummaryKhmer] = useState("");
  const [note, setNote] = useState("");
  // null until a decision is chosen, then "approve" or "reject".
  const [choice, setChoice] = useState(null);
  const [errors, setErrors] = useState({});
  // null, or which decision is being saved ("approve" / "reject") — the
  // fields and buttons lock, and that button shows it's working.
  const [busy, setBusy] = useState(null);

  // Saves `changes` to this story. RLS lets only the curator update stories,
  // so an empty result means it wasn't saved. On success the page re-fetches
  // and this story drops out of the pending queue.
  async function save(changes, action) {
    setBusy(action);
    const { data, error } = await createClient().from("stories").update(changes).eq("id", submission.id).select();
    if (error || !data?.length) {
      console.error("Review save failed:", submission.id, error);
      setErrors({ form: t("reviewSaveError") });
      setBusy(null);
      return;
    }
    router.refresh();
  }

  function approve() {
    const found = {};
    if (title.trim().length < 3) found.title = t("reviewTitleError");
    if (!summary.trim()) found.summary = t("reviewSummaryError");
    const cat = categories.find((c) => c.en === category);
    if (!cat) found.category = t("newStoryCategoryError");
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    save({
      title: title.trim(),
      khmer_title: khmerTitle.trim() || null,
      category: cat.en,
      category_khmer: cat.km,
      summary: summary.trim(),
      summary_khmer: summaryKhmer.trim() || null,
      status: "published",
      rejection_note: null,
    }, "approve");
  }

  function reject() {
    if (!note.trim()) {
      setErrors({ note: t("reviewNoteError") });
      return;
    }
    setErrors({});
    save({ status: "rejected", rejection_note: note.trim() }, "reject");
  }

  const label = { ...s.label, ...(language === "km" ? s.trackingNone : null) };
  // One labelled input/textarea plus its error line.
  const field = (id, labelKey, value, onChange, multiline) => (
    <div style={s.field}>
      <label style={label} htmlFor={`${submission.id}-${id}`}>{t(labelKey)}</label>
      {multiline ? (
        <textarea id={`${submission.id}-${id}`} style={{ ...s.input, ...s.textarea }} value={value} maxLength={MAX} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={`${submission.id}-${id}`} style={s.input} value={value} maxLength={100} onChange={(e) => onChange(e.target.value)} />
      )}
      {errors[id] ? <p style={s.error}>{errors[id]}</p> : null}
    </div>
  );

  // Switching the decision clears the other decision's error messages.
  const choose = (next) => {
    setChoice(next);
    setErrors({});
  };

  return (
    <fieldset style={s.lock} disabled={!!busy} aria-busy={!!busy}>
      <DecisionPicker choice={choice} onChoose={choose} />

      {choice === "approve" ? (
        <>
          {field("title", "newStoryTitleLabel", title, setTitle)}
          {field("khmerTitle", "newStoryKhmerTitleLabel", khmerTitle, setKhmerTitle)}
          <div style={s.field}>
            <label style={label} htmlFor={`${submission.id}-category`}>{t("newStoryCategoryLabel")}</label>
            <select id={`${submission.id}-category`} style={s.input} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("newStoryCategoryPlaceholder")}</option>
              {categories.map((c) => (
                <option key={c.en} value={c.en}>{language === "km" ? c.km : c.en}</option>
              ))}
            </select>
            {errors.category ? <p style={s.error}>{errors.category}</p> : null}
          </div>
          {field("summary", "reviewSummaryLabel", summary, setSummary, true)}
          {field("summaryKhmer", "reviewSummaryKhmerLabel", summaryKhmer, setSummaryKhmer, true)}
        </>
      ) : null}
      {choice === "reject" ? field("note", "reviewNoteLabel", note, setNote, true) : null}

      {errors.form ? <p style={s.error}>{errors.form}</p> : null}
      {choice ? (
        <ReviewActions choice={choice} busy={busy} onConfirm={choice === "approve" ? approve : reject} />
      ) : null}
    </fieldset>
  );
}
