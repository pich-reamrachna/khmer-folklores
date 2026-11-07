"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client.js";
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
  // Opens the band under the story's header (StoryDetails.js), whose
  // hairline already sits above it — so no rule or gap of its own.
  wrap: { maxWidth: 760 },
  // Heading and title follow the home hero (StoryHero.js): quiet spaced
  // capitals, then Cinzel — first, so English stays in Cinzel and Khmer
  // (which Cinzel has no letters for) falls through to the Khmer font.
  heading: { fontFamily: khmerSans, fontSize: "0.75rem", fontWeight: 600, color: "#A89F91", letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 0.75rem" },
  title: { fontFamily: "var(--font-cinzel), var(--font-khmer), serif", fontSize: "1.6rem", fontWeight: 500, color: "#C9A961", margin: "0 0 1rem", overflowWrap: "anywhere" },
  // pre-wrap keeps the sharer's line breaks; anywhere breaks a long run.
  body: { fontFamily: khmerSans, fontSize: "1.05rem", lineHeight: 1.8, color: "#D9D2C5", whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 },
  photo: { display: "block", maxWidth: "100%", maxHeight: 420, borderRadius: 12, marginTop: "1.5rem", objectFit: "cover" },
  owner: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginTop: "1.25rem" },
  note: { fontFamily: khmerSans, fontSize: "0.78rem", color: "#A89F91", margin: 0 },
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
          border-radius: 2px;
          background: transparent;
          color: #e6c575;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .first-telling-edit:hover {
          background-color: #c5a059;
          color: #1a1817;
        }
      `}</style>
    </article>
  );
}
