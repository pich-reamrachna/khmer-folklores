"use client";

import categories from "../../data/categories.js";
import { useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// The story-level fields only a brand-new story needs (Khmer name, category),
// shown by ContributeForm in newStory mode right after the story name. No
// summary field on purpose — the curator writes every summary during review.
// `styles` is ContributeForm's own style object, passed in so these fields
// look identical to the rest of the form.

export default function NewStoryFields({ khmerTitle, onKhmerTitleChange, category, onCategoryChange, errors, styles }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const km = language === "km";
  const labelStyle = { ...styles.label, ...(km ? styles.trackingNone : null) };

  return (
    <>
      <div style={styles.field}>
        <label style={labelStyle} htmlFor="khmerTitle">
          {t("newStoryKhmerTitleLabel")}
        </label>
        <input
          id="khmerTitle"
          style={styles.input}
          value={khmerTitle}
          onChange={(e) => onKhmerTitleChange(e.target.value)}
          maxLength={100}
        />
        {errors.khmerTitle ? <p style={styles.fieldError}>{errors.khmerTitle}</p> : null}
      </div>

      <div style={styles.field}>
        <label style={labelStyle} htmlFor="category">
          {t("newStoryCategoryLabel")}
        </label>
        <select
          id="category"
          style={styles.input}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">{t("newStoryCategoryPlaceholder")}</option>
          {/* value is always the English name — that's what submit_story checks. */}
          {categories.map((c) => (
            <option key={c.en} value={c.en}>
              {km ? c.km : c.en}
            </option>
          ))}
        </select>
        {errors.category ? <p style={styles.fieldError}>{errors.category}</p> : null}
      </div>
    </>
  );
}
