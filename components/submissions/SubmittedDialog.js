"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "../shared/uiText.js";

// The thank-you box that pops up on My Entries right after a submission
// (?submitted=story, telling, or edit). Says it's waiting for review,
// offers "Share a new story", and closes on its button, Escape, or a click
// outside. The link's :hover lives in app/globals.css (.submitted-share-link)
// — styled-jsx can't scope through next/link's Link.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
const styles = {
  overlay: { position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "rgba(8, 4, 10, 0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" },
  box: { width: "100%", maxWidth: 460, boxSizing: "border-box", padding: "2.5rem 2rem 2rem", textAlign: "center", backgroundColor: "#0c0a12", border: "1px solid #2a172f", borderRadius: 16, boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)", color: "#F5EFE6" },
  title: { fontFamily: "var(--font-khmer), var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 600, margin: "0 0 1rem" },
  body: { fontFamily: khmerSans, fontSize: "1rem", lineHeight: 1.7, color: "#BBAEBF", margin: "0 0 2rem" },
  actions: { display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" },
  share: { padding: "0.75rem 1.4rem", borderRadius: 999, textDecoration: "none", fontFamily: khmerSans, fontSize: "0.95rem", fontWeight: 700, color: "#0c0a12" },
  close: { padding: "0.75rem 1.4rem", borderRadius: 999, border: "1px solid #2a172f", background: "transparent", color: "#F5EFE6", fontFamily: khmerSans, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" },
};

// Title + message (uiText keys) for each kind of submission.
const TEXT = {
  story: { title: "newStoryDoneTitle", body: "newStoryDoneBody" },
  telling: { title: "tellingSubmittedTitle", body: "tellingSubmittedBody" },
  edit: { title: "editSubmittedTitle", body: "editSubmittedBody" },
};

export default function SubmittedDialog({ kind, onClose }) {
  const t = useTranslation();
  const shareRef = useRef(null);

  // Focus the main button, and close on Escape.
  useEffect(() => {
    shareRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const text = TEXT[kind] ?? TEXT.telling;
  return (
    <div style={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="submitted-title" style={styles.box}>
        <h2 id="submitted-title" style={styles.title}>
          {t(text.title)}
        </h2>
        <p style={styles.body}>{t(text.body)}</p>
        <div style={styles.actions}>
          <Link ref={shareRef} href="/share" style={styles.share} className="submitted-share-link">
            {t("submittedShareNew")}
          </Link>
          <button type="button" style={styles.close} onClick={onClose}>
            {t("contributeClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
