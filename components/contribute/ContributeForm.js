"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import provinces from "../../data/provinces.js";
import LocationSelect from "./LocationSelect.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

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

// Synchronous checks (the photo's real type is checked async in handleSubmit).
// `t` is the translation function, so messages follow the language toggle.
function validate({ title, place, description, photoFile, t }) {
  const errors = {};

  const titleVal = title.trim();
  if (len(titleVal) < TITLE_MIN || len(titleVal) > TITLE_MAX)
    errors.title = fill(t("contributeTitleLenError"), { min: TITLE_MIN, max: TITLE_MAX });
  else if (hasForbiddenChars(titleVal, false)) errors.title = t("contributeTitleCharError");

  if (!place) errors.place = t("contributeLocationError");

  const d = description.trim();
  const dClean = stripInvisible(d);
  if (len(dClean) < DESC_MIN || len(dClean) > DESC_MAX)
    errors.description = fill(t("contributeStoryLenError"), { min: DESC_MIN, max: DESC_MAX.toLocaleString() });
  else if (hasForbiddenChars(d, true)) errors.description = t("contributeStoryCharError");

  if (photoFile && photoFile.size > MAX_PHOTO_BYTES) errors.photo = t("contributePhotoSizeError");

  return errors;
}

const styles = {
  // Standalone page: full-height, top padding clears the fixed NavBar.
  section: {
    width: "100%",
    boxSizing: "border-box",
    padding: "130px 2rem 4rem",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#0C0A12",
    minHeight: "100vh",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  // Inside the modal: no full-height or NavBar padding, and the dialog owns
  // the background, so none is set here.
  sectionEmbedded: {
    width: "100%",
    boxSizing: "border-box",
    padding: "2.5rem 2rem 2rem",
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
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: "0 0 0.75rem",
  },
  title: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2rem",
    fontWeight: 600,
    color: "#F5EFE6",
    margin: "0 0 2rem",
    lineHeight: 1.2,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "1.5rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#BBAEBF",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.8rem 1rem",
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 10,
    color: "#F5EFE6",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.8rem 1rem",
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 10,
    color: "#F5EFE6",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    minHeight: 160,
    resize: "vertical",
  },
  hint: {
    fontSize: "0.75rem",
    color: "#8A7F91",
    margin: 0,
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
    fontSize: "0.72rem",
    color: "#8A7F91",
    margin: 0,
    marginLeft: "auto",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  counterOver: {
    color: "#E0736A",
  },
  fieldError: {
    fontSize: "0.8rem",
    color: "#E0736A",
    margin: 0,
    // Takes the left of the meta row; wraps instead of shoving the counter.
    flex: 1,
    minWidth: 0,
  },
  formError: {
    fontSize: "0.9rem",
    color: "#E0736A",
    margin: "0 0 1.25rem",
  },
  // Khmer's stacked glyph clusters shouldn't be pried apart by Latin letter-
  // spacing — spread this in on the eyebrow/labels when the language is Khmer.
  trackingNone: { letterSpacing: "normal" },
};

export default function ContributeForm({ storyId, storyTitle, storyTitleKhmer, onSuccess, embedded = false }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation();
  const km = language === "km";
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const found = validate({ title, place, description, photoFile, t });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const supabase = createClient();

      // owner always comes from the session, never the form.
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setFormError(t("contributeSessionError"));
        setSubmitting(false);
        return;
      }

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

      const province = provinces.find((p) => p.en === place);
      if (!province) {
        setErrors({ place: t("contributeLocationInvalid") });
        setSubmitting(false);
        return;
      }

      let photoUrl = null;
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
        photoUrl = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
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

      // In the modal, onSuccess closes it and refreshes the tellings; on the
      // standalone page (no callback) fall back to navigating to the story.
      if (onSuccess) onSuccess();
      else router.push(`/${storyId}`);
    } catch (err) {
      // Real error for the developer; a generic, actionable line for the user.
      console.error("Contribute submit failed:", err);
      setFormError(t("contributeSubmitError"));
      setSubmitting(false);
    }
  }

  return (
    <section style={embedded ? styles.sectionEmbedded : styles.section}>
      <div style={styles.card}>
        <p style={{ ...styles.eyebrow, ...(km ? styles.trackingNone : null) }}>{t("contributeEyebrow")}</p>
        <h1 style={styles.title}>{pickText(language, storyTitleKhmer, storyTitle)}</h1>

        <form onSubmit={handleSubmit} noValidate>
          {formError ? <p style={styles.formError}>{formError}</p> : null}

          <div style={styles.field}>
            <label style={{ ...styles.label, ...(km ? styles.trackingNone : null) }} htmlFor="title">
              {t("contributeTitleLabel")}
            </label>
            <input
              id="title"
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
              className="archive-scroll"
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
            {errors.photo ? <p style={styles.fieldError}>{errors.photo}</p> : null}
          </div>

          <button
            type="submit"
            className={`contribute-submit${km ? " km" : ""}`}
            disabled={submitting}
          >
            {submitting ? t("contributeSubmitting") : t("contributeSubmit")}
          </button>
        </form>
      </div>

      {/* Native <button>, so styled-jsx scoping works here. Base + hover +
          disabled all live together, none set inline, per the no-split rule. */}
      <style jsx>{`
        .contribute-submit {
          width: 100%;
          padding: 0.9rem 1rem;
          border: none;
          border-radius: 10px;
          background-color: #c5a059;
          color: #0c0a12;
          font-family: var(--font-jakarta), system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background-color 0.2s ease, opacity 0.2s ease;
        }
        .contribute-submit.km {
          letter-spacing: normal;
        }
        .contribute-submit:hover {
          background-color: #d4af37;
        }
        .contribute-submit:disabled {
          opacity: 0.55;
          cursor: default;
        }
      `}</style>
    </section>
  );
}
