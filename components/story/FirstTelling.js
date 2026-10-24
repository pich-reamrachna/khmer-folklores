"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client.js";
import { formatDate } from "../../utils/formatDate.js";
import { formEntry } from "../../utils/editableEntry.js";
import { useContributeModal } from "../contribute/contributeModalContext.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// "The First Telling": the story itself, as its first sharer told it, shown
// in full under the title and summary. Everyone else's versions are the
// comments below it (StoryMemories.js). Its owner can edit it (the changes
// wait for the curator's review, and this keeps showing the published text);
// deleting it isn't possible once the story is published — the database
// refuses, so there's no Delete here at all.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
const styles = {
  wrap: { marginTop: "2.5rem", maxWidth: 760, paddingTop: "2rem", borderTop: "1px solid #2A172F" },
  heading: { fontFamily: khmerSans, fontSize: "0.8rem", fontWeight: 700, color: "#E6C575", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 0.75rem" },
  title: { fontFamily: "var(--font-khmer), var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 600, color: "#F5EFE6", margin: "0 0 0.4rem", overflowWrap: "anywhere" },
  byline: { fontFamily: khmerSans, fontSize: "0.85rem", color: "#8A7F91", margin: "0 0 1.25rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" },
  name: { color: "#E6C575", fontWeight: 700 },
  edited: { fontStyle: "italic" },
  // pre-wrap keeps the sharer's line breaks; anywhere breaks a long run.
  body: { fontFamily: khmerSans, fontSize: "1.05rem", lineHeight: 1.8, color: "#D8CFDC", whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 },
  photo: { display: "block", maxWidth: "100%", maxHeight: 420, borderRadius: 12, marginTop: "1.5rem", objectFit: "cover" },
  owner: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginTop: "1.25rem" },
  note: { fontFamily: khmerSans, fontSize: "0.78rem", color: "#8A7F91", margin: 0 },
  // Letter-spacing pries apart Khmer glyph clusters.
  trackingNone: { letterSpacing: "normal" },
};

export default function FirstTelling({ telling, storyId, storyTitle, storyTitleKhmer }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const { open } = useContributeModal();
  const [userId, setUserId] = useState(null);

  // Only to decide whether to show the owner's Edit button.
  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  const place = pickText(language, telling.placeKhmer, telling.place);
  const isOwner = !!userId && telling.owner === userId;

  return (
    <article style={styles.wrap}>
      <p style={{ ...styles.heading, ...(language === "km" ? styles.trackingNone : null) }}>{t("firstTellingHeading")}</p>
      {telling.title ? <h2 style={styles.title}>{telling.title}</h2> : null}
      <p style={styles.byline}>
        {/* The username is a name — never translated. */}
        <span>{t("detailsFirstSharedBy")} <span style={styles.name}>{telling.contributor}</span></span>
        {place ? <span>· {place}</span> : null}
        {telling.date ? <span>· {formatDate(telling.date, language)}</span> : null}
        {telling.editedAt ? (
          <span style={styles.edited} title={`${t("memoriesEdited")} ${formatDate(telling.editedAt, language)}`}>· {t("memoriesEdited")}</span>
        ) : null}
      </p>
      <p style={styles.body}>{pickText(language, telling.descriptionKhmer, telling.description)}</p>
      {telling.photoUrl ? (
        <img src={telling.photoUrl} alt={place ? `Photo shared from ${place}` : "Photo shared with this story"} style={styles.photo} />
      ) : null}

      {isOwner ? (
        <div style={styles.owner}>
          <button
            type="button"
            className="first-telling-edit"
            onClick={() =>
              open({
                storyId,
                storyTitle,
                storyTitleKhmer,
                entry: formEntry(telling),
              })
            }
          >
            {t("menuEdit")}
          </button>
          <p style={styles.note}>
            {/* The owner's changes wait on the side; this page keeps
                showing the published version until they're approved. */}
            {telling.edit ? (
              <>
                {t(telling.edit.status === "returned" ? "editReturnedShort" : "editPendingShort")}
                <br />
              </>
            ) : null}
            {t("menuDeleteLocked")}
          </p>
        </div>
      ) : null}

      {/* Native <button>, so styled-jsx scoping works; base + hover together. */}
      <style jsx>{`
        .first-telling-edit {
          padding: 0.5rem 1.2rem;
          border: 1px solid #c5a059;
          border-radius: 999px;
          background: transparent;
          color: #e6c575;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .first-telling-edit:hover {
          background-color: #c5a059;
          color: #0c0a12;
        }
      `}</style>
    </article>
  );
}
