"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ContributeForm from "../contribute/ContributeForm.js";
import { useTranslation } from "../shared/uiText.js";

// /share's second step: the new-story form, then a "waiting for review"
// confirmation once it's submitted. Replaces the search view (ShareSearch
// swaps it in) so the form has the page to itself.

const KHMER_SCRIPT = /[ក-៿]/;

const styles = {
  backBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    color: "#C5A059",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  done: { textAlign: "center", padding: "4rem 0" },
  doneTitle: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2rem",
    fontWeight: 600,
    margin: "0 0 1rem",
  },
  doneBody: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "#BBAEBF",
    margin: "0 0 2rem",
  },
  doneLink: { color: "#C5A059", fontWeight: 700, textDecoration: "none" },
};

export default function NewStoryPanel({ query, onBack }) {
  const t = useTranslation();
  const ref = useRef(null);
  const [done, setDone] = useState(false);

  // The user may have scrolled down through search results — return to the
  // top of the page for the form (and again for the confirmation). Scrolls
  // <main>, the page's scroll container (StoryPageShell), not the window;
  // top: 0 rather than scrollIntoView, which would tuck this panel's top
  // under the fixed NavBar.
  useEffect(() => {
    ref.current?.closest("main")?.scrollTo({ top: 0 });
  }, [done]);

  // Carry the search over: Khmer text pre-fills the Khmer name, anything
  // else the English name.
  const isKhmer = KHMER_SCRIPT.test(query);

  return (
    <div ref={ref}>
      {done ? (
        <div style={styles.done}>
          <h1 style={styles.doneTitle}>{t("newStoryDoneTitle")}</h1>
          <p style={styles.doneBody}>{t("newStoryDoneBody")}</p>
          <Link href="/" style={styles.doneLink} className="share-match-link">
            {t("newStoryDoneLink")}
          </Link>
        </div>
      ) : (
        <>
          <button type="button" style={styles.backBtn} onClick={onBack}>
            ← {t("shareBackToSearch")}
          </button>
          <ContributeForm
            newStory
            embedded
            initialTitle={isKhmer ? "" : query}
            initialKhmerTitle={isKhmer ? query : ""}
            onSuccess={() => setDone(true)}
          />
        </>
      )}
    </div>
  );
}
