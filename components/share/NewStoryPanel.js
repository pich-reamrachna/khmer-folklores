"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ContributeForm from "../contribute/ContributeForm.js";
import { useTranslation } from "../shared/uiText.js";
import { startPageLoading } from "../../utils/pageLoading.js";

// /share's second step: the new-story form. Replaces the search view
// (ShareSearch swaps it in) so the form has the page to itself. Once it's
// submitted, the visitor goes to My Entries, where a thank-you box says
// the story is waiting for review.

const KHMER_SCRIPT = /[ក-៿]/;

const styles = {
  // Dark ink, on /share's parchment.
  backBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    color: "#6B4F26",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  // The form is written for a dark background (it's the same one the story
  // page's "Share your telling" pop-up uses), so on /share's parchment it
  // sits on a charcoal card — the same charcoal as the footer.
  formCard: {
    marginTop: "1.25rem",
    backgroundColor: "#1A1817",
    borderRadius: 4,
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.35)",
  },
};

export default function NewStoryPanel({ query, onBack }) {
  const t = useTranslation();
  const router = useRouter();
  const ref = useRef(null);

  // The user may have scrolled down through search results — return to the
  // top of the page for the form. Scrolls <main>, the page's scroll container
  // (StoryPageShell), not the window; top: 0 rather than scrollIntoView, which
  // would tuck this panel's top under the fixed NavBar.
  useEffect(() => {
    ref.current?.closest("main")?.scrollTo({ top: 0 });
  }, []);

  // Carry the search over: Khmer text pre-fills the Khmer name, anything
  // else the English name.
  const isKhmer = KHMER_SCRIPT.test(query);

  return (
    <div ref={ref}>
      <button type="button" style={styles.backBtn} onClick={onBack}>
        ← {t("shareBackToSearch")}
      </button>
      <div style={styles.formCard}>
        <ContributeForm
          newStory
          embedded
          initialTitle={isKhmer ? "" : query}
          initialKhmerTitle={isKhmer ? query : ""}
          onSuccess={() => {
            startPageLoading("/my-entries?submitted=story");
            router.push("/my-entries?submitted=story");
          }}
        />
      </div>
    </div>
  );
}
