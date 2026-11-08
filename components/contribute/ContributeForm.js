"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import { photoStoragePath } from "../../utils/storage.js";
import provinces from "../../data/provinces.js";
import categories from "../../data/categories.js";
import LocationSelect from "./LocationSelect.js";
import NewStoryFields from "./NewStoryFields.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import { findKhmerOrderProblems } from "../../utils/khmerOrder.js";
import { startPageLoading } from "../../utils/pageLoading.js";

// Fills {min}/{max}/{n} placeholders in a translated template string.
const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const CONTENT_TYPES = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

// Length limits, single-sourced so validate(), the maxLength caps, and the
// live character counters all stay in sync.
const TITLE_MIN = 3;
const TITLE_MAX = 100;
const DESC_MIN = 50;
const DESC_MAX = 2500;

// True if the code point is invisible/unsafe for a title or story: control
// chars, soft hyphen, zero-width chars, BOM, and text-direction (bidi)
// overrides/isolates. Ordinary punctuation and Khmer marks are never flagged,
// so Khmer text and names like "Daun Penh's Curse" pass untouched.
function isInvisibleCodePoint(c) {
  return (
    c <= 0x1f ||                  // C0 control chars (incl. null, newline, tab)
    c === 0x7f ||                 // DEL
    c === 0xad ||                 // soft hyphen
    (c >= 0x200b && c <= 0x200d) || // zero-width space / joiners
    c === 0xfeff ||               // zero-width no-break space / BOM
    (c >= 0x202a && c <= 0x202e) || // bidi embedding/override
    (c >= 0x2066 && c <= 0x2069)    // bidi isolates
  );
}

// Rejects the invisible set above. allowLineBreaks keeps tab/newline/CR for the
// multi-line story field, which a single-line title doesn't need.
function hasForbiddenChars(str, allowLineBreaks) {
  for (const ch of str) {
    const c = ch.codePointAt(0);
    if (allowLineBreaks && (c === 0x09 || c === 0x0a || c === 0x0d)) continue;
    if (isInvisibleCodePoint(c)) return true;
  }
  return false;
}

// Drops zero-width/BOM/soft-hyphen chars before length is counted, so they
// can't pad a field to its minimum. Visible whitespace is left to trim().
function stripInvisible(str) {
  let out = "";
  for (const ch of str) {
    const c = ch.codePointAt(0);
    if ((c >= 0x200b && c <= 0x200d) || c === 0xfeff || c === 0xad) continue;
    out += ch;
  }
  return out;
}

// Length by code point, so Khmer and emoji count sensibly rather than by
// UTF-16 unit.
const len = (s) => [...s].length;

// Verifies the file's real type from its leading magic bytes, not its
// filename — so a renamed .png.exe is rejected (OWASP file-upload guidance).
// Returns the canonical extension, or null if it isn't a jpg/png/webp.
async function detectImageExtension(file) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

// The message for Khmer typed in an order phones can't show (see
// utils/khmerOrder.js), or null if there's none: names up to three of the
// words, each with its corrected spelling when there's one sure answer.
function khmerOrderError(text, t) {
  const problems = findKhmerOrderProblems(text);
  if (problems.length === 0) return null;
  const words = problems
    .slice(0, 3)
    .map((p) => (p.fix ? `"${p.word}" → "${p.fix}"` : `"${p.word}"`))
    .join(", ");
  return fill(t("khmerOrderError"), { words });
}

// Synchronous checks (the photo's real type is checked async in handleSubmit).
// `t` is the translation function, so messages follow the language toggle.
function validate({ title, place, description, photoFile, t, newStory, khmerTitle, category }) {
  const errors = {};

  const titleVal = title.trim();
  const titleOrderError = khmerOrderError(titleVal, t);
  if (len(titleVal) < TITLE_MIN || len(titleVal) > TITLE_MAX)
    errors.title = fill(t("contributeTitleLenError"), { min: TITLE_MIN, max: TITLE_MAX });
  else if (hasForbiddenChars(titleVal, false)) errors.title = t("contributeTitleCharError");
  else if (titleOrderError) errors.title = titleOrderError;

  // newStory only: the Khmer name is optional, the category is required.
  if (newStory) {
    const khmerVal = khmerTitle.trim();
    const khmerOrderErr = khmerOrderError(khmerVal, t);
    if (len(khmerVal) > TITLE_MAX)
      errors.khmerTitle = fill(t("newStoryKhmerTitleLenError"), { max: TITLE_MAX });
    else if (hasForbiddenChars(khmerVal, false)) errors.khmerTitle = t("contributeTitleCharError");
    else if (khmerOrderErr) errors.khmerTitle = khmerOrderErr;
    if (!categories.some((c) => c.en === category)) errors.category = t("newStoryCategoryError");
  }

  if (!place) errors.place = t("contributeLocationError");

  const d = description.trim();
  const dClean = stripInvisible(d);
  const descOrderError = khmerOrderError(d, t);
  if (len(dClean) < DESC_MIN || len(dClean) > DESC_MAX)
    errors.description = fill(t("contributeStoryLenError"), { min: DESC_MIN, max: DESC_MAX.toLocaleString() });
  else if (hasForbiddenChars(d, true)) errors.description = t("contributeStoryCharError");
  else if (descOrderError) errors.description = descOrderError;

  if (photoFile && photoFile.size > MAX_PHOTO_BYTES) errors.photo = t("contributePhotoSizeError");

  return errors;
}

// Laid out like the sign-in / sign-up forms (components/auth/authStyles.js):
// small spaced-capital labels, underline-only fields and a square gold
// button, on the site's warm charcoal — in the main site's type: the heading
// in gold Cinzel (as on the story pages), the fields in the body font. The story box keeps a faint outline (a bare underline under a
// tall box reads oddly). Focus glows live in app/globals.css's
// .contribute-input rule, since a :focus can't be inline.
const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
// Cinzel has no Khmer letters, so a Khmer story name falls through.
const cinzel = "var(--font-cinzel), var(--font-khmer), serif";
const styles = {
  // Standalone page: full-height, top padding clears the fixed NavBar.
  section: {
    width: "100%",
    boxSizing: "border-box",
    padding: "130px 2rem 4rem",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#1A1817",
    minHeight: "100vh",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  // Inside the modal: no full-height or NavBar padding, and the dialog owns
  // the background, so none is set here.
  sectionEmbedded: {
    width: "100%",
    boxSizing: "border-box",
    padding: "2.75rem 2.5rem 2.5rem",
    display: "flex",
    justifyContent: "center",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  card: {
    width: "100%",
    maxWidth: 640,
  },
  eyebrow: {
    fontFamily: khmerSans,
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#A89F91",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: "0 0 0.75rem",
  },
  title: {
    fontFamily: cinzel,
    fontSize: "clamp(1.8rem, 2.8vw, 2.3rem)",
    fontWeight: 500,
    color: "#C9A961",
    margin: "0 0 2rem",
    lineHeight: 1.15,
    overflowWrap: "anywhere",
  },
  // newStory only — sits between the heading and the form, so the heading's
  // own bottom margin already spaces it from above.
  reviewNote: {
    fontFamily: khmerSans,
    fontSize: "0.92rem",
    lineHeight: 1.6,
    color: "#A89F91",
    margin: "-1rem 0 2rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    marginBottom: "1.6rem",
  },
  label: {
    fontFamily: khmerSans,
    fontSize: "0.66rem",
    fontWeight: 700,
    color: "#A89F91",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  // Underline-only, like the sign-in fields. colorScheme: dark, so a
  // <select>'s native option list (NewStoryFields' category) is dark too.
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.5rem 0 0.55rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(245, 239, 230, 0.22)",
    borderRadius: 0,
    color: "#F5EFE6",
    fontFamily: khmerSans,
    fontSize: "1rem",
    outline: "none",
    colorScheme: "dark",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "0.35rem",
    padding: "0.8rem 0.9rem",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    border: "1px solid rgba(245, 239, 230, 0.16)",
    borderRadius: 2,
    color: "#F5EFE6",
    fontFamily: khmerSans,
    fontSize: "1rem",
    lineHeight: 1.7,
    minHeight: 180,
    resize: "vertical",
    outline: "none",
  },
  hint: {
    fontFamily: khmerSans,
    fontSize: "0.75rem",
    color: "#8A8277",
    margin: 0,
  },
  // Thumbnail of the existing photo while editing (until a new one is picked).
  currentPhoto: {
    maxWidth: 120,
    maxHeight: 120,
    objectFit: "cover",
    borderRadius: 2,
    display: "block",
    margin: "0.5rem 0 0",
  },
  // One row under a counted field: error on the left, counter on the right.
  metaRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.75rem",
  },
  // Live character counter — pinned right so it stays put with or without an
  // error beside it.
  counter: {
    fontFamily: khmerSans,
    fontSize: "0.72rem",
    color: "#8A8277",
    margin: 0,
    marginLeft: "auto",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  counterOver: {
    color: "#E58B8B",
  },
  fieldError: {
    fontFamily: khmerSans,
    fontSize: "0.8rem",
    color: "#E58B8B",
    margin: 0,
    // Takes the left of the meta row; wraps instead of shoving the counter.
    flex: 1,
    minWidth: 0,
  },
  formError: {
    fontFamily: khmerSans,
    fontSize: "0.88rem",
    color: "#E58B8B",
    margin: "0 0 1.25rem",
  },
  // Wraps the fields and button: disabled while sending, which locks them
  // all at once. Reset to look like nothing.
  lock: { border: "none", margin: 0, padding: 0, minWidth: 0 },
  // Khmer's stacked glyph clusters shouldn't be pried apart by Latin letter-
  // spacing — spread this in on the eyebrow/labels when the language is Khmer.
  trackingNone: { letterSpacing: "normal" },
};

export default function ContributeForm({
  entry = null,
  storyId,
  storyTitle,
  storyTitleKhmer,
  onSuccess,
  embedded = false,
  newStory = false,
  initialTitle = "",
  initialKhmerTitle = "",
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation();
  const km = language === "km";
  // Edit mode when an existing entry is passed; the form is pre-filled and
  // submitting updates that row instead of inserting a new one.
  const isEditing = !!entry;
  // newStory mode (/share): there's no story yet — `title` is the new story's
  // name (also used as this first telling's title), plus a Khmer name and a
  // category, and submitting creates both through submit_story.
  const [title, setTitle] = useState(entry?.title ?? initialTitle);
  const [khmerTitle, setKhmerTitle] = useState(initialKhmerTitle);
  const [category, setCategory] = useState("");
  const [place, setPlace] = useState(entry?.place ?? "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Editing: Save stays locked until something actually differs from what
  // the form opened with (spaces at the ends don't count — they're trimmed
  // on save anyway), so an unchanged edit can't be sent for review.
  const hasChanges =
    !isEditing ||
    !!photoFile ||
    title.trim() !== (entry.title ?? "").trim() ||
    place !== (entry.place ?? "") ||
    description.trim() !== (entry.description ?? "").trim();

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    // The locked Save button is only the visible half: this also stops a
    // submit sent another way (the button unlocked in devtools, or
    // form.requestSubmit()). The database refuses it too (edit-no-changes.sql).
    if (submitting || !hasChanges) return;

    const found = validate({ title, place, description, photoFile, t, newStory, khmerTitle, category });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const supabase = createClient();
    // A photo is uploaded before the row is saved. If the save then doesn't
    // happen — refused, returned early, or thrown — the finally block below
    // deletes that new file, so a failed submit doesn't leave it unused in
    // the bucket. `saved` flips only once the row is actually written.
    let uploadedPath = null;
    let saved = false;
    // Set by an edit: true when it went back to the curator's review.
    let sentToReview = false;
    try {
      // owner always comes from the session, never the form.
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setFormError(t("contributeSessionError"));
        setSubmitting(false);
        return;
      }

      const province = provinces.find((p) => p.en === place);
      if (!province) {
        setErrors({ place: t("contributeLocationInvalid") });
        setSubmitting(false);
        return;
      }

      // Upload a new photo only if one was chosen; otherwise keep the existing
      // one when editing, or leave it empty when creating. oldPhotoUrl is kept
      // so a swapped-out file can be removed from storage after the update.
      const oldPhotoUrl = isEditing ? (entry.photoUrl ?? null) : null;
      let photoUrl = oldPhotoUrl;
      if (photoFile) {
        const ext = await detectImageExtension(photoFile);
        if (!ext) {
          setErrors({ photo: t("contributePhotoTypeError") });
          setSubmitting(false);
          return;
        }
        // Random name under the user's own folder — never trust the original
        // filename, and the extension follows the detected type, not the name.
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, photoFile, { contentType: CONTENT_TYPES[ext] });
        if (uploadError) throw uploadError;
        uploadedPath = path;
        photoUrl = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
      }

      if (isEditing) {
        // Every edit is reviewed — only a reviewer's own edit isn't. If the
        // check itself fails it's treated as "not a reviewer", the safe side.
        const { data: isReviewer } = await supabase.rpc("is_reviewer");
        sentToReview = isReviewer !== true;
        const changes = {
          title: title.trim(),
          place: province.en,
          place_khmer: province.km,
          description: description.trim(),
          photo_url: photoUrl,
        };
        // A published telling stays as it is on the story page: the changes
        // are saved as its waiting edit (one per telling — editing again
        // replaces it, and clears a returned edit's note so it's waiting
        // again) until the curator approves them. A telling that isn't
        // published yet is changed directly and goes (back) to review.
        // Either way .select() coming back empty means RLS refused it.
        const asEdit = sentToReview && entry.status === "published";
        if (!asEdit && sentToReview) changes.status = "pending";
        const { data: updated, error: updateError } = asEdit
          ? await supabase
              .from("entry_edits")
              .upsert(
                { ...changes, entry_id: entry.id, owner: user.id, status: "pending", return_note: null },
                { onConflict: "entry_id" }
              )
              .select()
          : await supabase.from("entries").update(changes).eq("id", entry.id).select();
        // The database's refusal of an edit that changes nothing — e.g. the
        // changes were put back to exactly the published version.
        if (updateError?.message === "no_changes") {
          setFormError(t("contributeNoChanges"));
          setSubmitting(false);
          return;
        }
        if (updateError) throw updateError;
        if (!updated || updated.length === 0) {
          console.error("Entry update saved no rows:", entry.id);
          setFormError(t("contributeNotSaved"));
          setSubmitting(false);
          return;
        }
        saved = true;
        // Photo was swapped — remove the old file so it isn't orphaned in the
        // bucket, unless it's the published telling's photo, which is still
        // on show until the edit is approved. Best-effort: the save already
        // happened, so a failed cleanup is only logged.
        const stillShown = asEdit && oldPhotoUrl === (entry.publishedPhotoUrl ?? null);
        if (photoFile && oldPhotoUrl && oldPhotoUrl !== photoUrl && !stillShown) {
          const oldPath = photoStoragePath(oldPhotoUrl);
          if (oldPath) {
            const { error: rmError } = await supabase.storage.from("photos").remove([oldPath]);
            if (rmError) console.error("Old photo file not removed:", oldPath, rmError);
          }
        }
      } else if (newStory) {
        // One call creates the pending story and this first telling together,
        // so a failure can't leave a story with no telling. The username
        // credit, Khmer category, and URL slug are all filled in by the
        // database, not trusted from here.
        const { error: rpcError } = await supabase.rpc("submit_story", {
          p_title: title.trim(),
          p_khmer_title: khmerTitle.trim(),
          p_category: category,
          p_entry_title: title.trim(),
          p_place: province.en,
          p_place_khmer: province.km,
          p_description: description.trim(),
          p_photo_url: photoUrl,
        });
        // submit_story's known refusals get a specific message.
        if (rpcError?.message === "story_exists") {
          setErrors({ title: t("newStoryExists") });
          setSubmitting(false);
          return;
        }
        if (rpcError?.message === "no_username") {
          setFormError(t("contributeNoUsername"));
          setSubmitting(false);
          return;
        }
        if (rpcError) throw rpcError;
        saved = true;
      } else {
        // The telling is credited to the user's username, never their email.
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.username) {
          setFormError(t("contributeNoUsername"));
          setSubmitting(false);
          return;
        }
        const { error: insertError } = await supabase.from("entries").insert({
          owner: user.id,
          story_id: storyId,
          contributor: profile.username,
          title: title.trim(),
          place: province.en,
          place_khmer: province.km,
          description: description.trim(),
          photo_url: photoUrl,
        });
        if (insertError) throw insertError;
        saved = true;
      }

      // In the modal, onSuccess closes it and decides where to go next (it's
      // told whether an edit went back to review); on the standalone page
      // (no callback) fall back to navigating to the story.
      if (onSuccess) onSuccess({ sentToReview });
      else {
        startPageLoading(`/${storyId}`);
        router.push(`/${storyId}`);
      }
    } catch (err) {
      // Real error for the developer; a generic, actionable line for the user.
      console.error("Contribute submit failed:", err);
      // The database's own Khmer spelling-order check (khmer-order.sql) —
      // normally the form catches it first, so this is only a backstop.
      setFormError(t(err?.message === "khmer_order" ? "khmerOrderDbError" : "contributeSubmitError"));
      setSubmitting(false);
    } finally {
      // Best-effort, like the swapped-photo cleanup above: the user already
      // sees the real error, so a failed delete here is only logged.
      if (uploadedPath && !saved) {
        const { error: rmError } = await supabase.storage.from("photos").remove([uploadedPath]);
        if (rmError) console.error("Unsaved photo file not removed:", uploadedPath, rmError);
      }
    }
  }

  return (
    <section style={embedded ? styles.sectionEmbedded : styles.section}>
      <div style={styles.card}>
        <p style={{ ...styles.eyebrow, ...(km ? styles.trackingNone : null) }}>
          {isEditing ? t("contributeEditEyebrow") : newStory ? t("newStoryEyebrow") : t("contributeEyebrow")}
        </p>
        <h1 style={styles.title}>
          {newStory ? t("newStoryHeading") : pickText(language, storyTitleKhmer, storyTitle)}
        </h1>
        {newStory ? <p style={styles.reviewNote}>{t("newStoryReviewNote")}</p> : null}

        <form onSubmit={handleSubmit} noValidate>
          {formError ? <p style={styles.formError}>{formError}</p> : null}

          {/* Locks every field (and the button) while it's being sent. */}
          <fieldset style={styles.lock} disabled={submitting} aria-busy={submitting}>

            <div style={styles.field}>
              <label style={{ ...styles.label, ...(km ? styles.trackingNone : null) }} htmlFor="title">
                {newStory ? t("newStoryTitleLabel") : t("contributeTitleLabel")}
              </label>
              <input
                id="title"
                className="contribute-input"
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={TITLE_MAX}
              />
              <div style={styles.metaRow}>
                {errors.title ? <p style={styles.fieldError}>{errors.title}</p> : null}
                <p style={{ ...styles.counter, ...(len(title.trim()) < TITLE_MIN ? styles.counterOver : null) }}>
                  {len(title)} / {TITLE_MAX}
                  {len(title.trim()) < TITLE_MIN ? ` ${fill(t("contributeMinHint"), { n: TITLE_MIN })}` : ""}
                </p>
              </div>
            </div>

            {newStory ? (
              <NewStoryFields
                khmerTitle={khmerTitle}
                onKhmerTitleChange={setKhmerTitle}
                category={category}
                onCategoryChange={setCategory}
                errors={errors}
                styles={styles}
              />
            ) : null}

            <div style={styles.field}>
              <label style={{ ...styles.label, ...(km ? styles.trackingNone : null) }} htmlFor="location">
                {t("contributeLocationLabel")}
              </label>
              <LocationSelect id="location" value={place} onChange={setPlace} />
              {errors.place ? <p style={styles.fieldError}>{errors.place}</p> : null}
            </div>

            <div style={styles.field}>
              <label style={{ ...styles.label, ...(km ? styles.trackingNone : null) }} htmlFor="description">
                {t("contributeStoryLabel")}
              </label>
              <textarea
                id="description"
                className="archive-scroll contribute-input"
                style={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={DESC_MAX}
              />
              <div style={styles.metaRow}>
                {errors.description ? <p style={styles.fieldError}>{errors.description}</p> : null}
                <p style={{ ...styles.counter, ...(len(description.trim()) < DESC_MIN ? styles.counterOver : null) }}>
                  {len(description)} / {DESC_MAX.toLocaleString()}
                  {len(description.trim()) < DESC_MIN ? ` ${fill(t("contributeMinHint"), { n: DESC_MIN })}` : ""}
                </p>
              </div>
            </div>

            <div style={styles.field}>
              <label style={{ ...styles.label, ...(km ? styles.trackingNone : null) }} htmlFor="photo">
                {t("contributePhotoLabel")}
              </label>
              <input
                id="photo"
                type="file"
                className="contribute-file"
                style={styles.input}
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
              <p style={styles.hint}>{t("contributePhotoHint")}</p>
              {isEditing ? (
                <>
                  {entry.photoUrl && !photoFile ? (
                    <img src={entry.photoUrl} alt={t("contributeCurrentPhoto")} style={styles.currentPhoto} />
                  ) : null}
                  <p style={styles.hint}>{t("contributePhotoKeep")}</p>
                </>
              ) : null}
              {errors.photo ? <p style={styles.fieldError}>{errors.photo}</p> : null}
            </div>

            <button
              type="submit"
              className={`contribute-submit${km ? " km" : ""}`}
              disabled={submitting || !hasChanges}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  {t("contributeSubmitting")}
                </>
              ) : isEditing
                ? t("contributeSaveChanges")
                : newStory
                ? t("newStorySubmit")
                : t("contributeSubmit")}
            </button>
          </fieldset>
        </form>
      </div>

      {/* Native <button>, so styled-jsx scoping works here. Base + hover +
          disabled all live together, none set inline, per the no-split rule. */}
      <style jsx>{`
        .contribute-submit {
          width: 100%;
          margin-top: 0.4rem;
          padding: 1rem;
          border: none;
          border-radius: 2px;
          background-color: #c5a059;
          color: #1a1817;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease, opacity 0.2s ease;
        }
        .contribute-submit.km {
          letter-spacing: normal;
        }
        .contribute-submit:hover:not(:disabled) {
          opacity: 0.85;
        }
        .contribute-submit:disabled {
          opacity: 0.55;
          cursor: default;
        }
      `}</style>
    </section>
  );
}
