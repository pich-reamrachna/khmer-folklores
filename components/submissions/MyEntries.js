"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SubmissionsList from "./SubmissionsList.js";
import TellingsList from "./TellingsList.js";
import SubmittedDialog from "./SubmittedDialog.js";
import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";

// /my-entries: everything the user has shared, in two tabs — the new stories
// they started, and their tellings — each entry with its review status, and
// each tab labelled with how many it holds. Also shows the thank-you box
// after a submission (?submitted=…).

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
const styles = {
  // Same top/side padding as /share and /review — clears the fixed NavBar.
  // The site's warm charcoal, like the home hero and story pages; the
  // charcoal texture and gold bamboo on both sides are in app/globals.css
  // (.my-entries-section — pseudo-element layers can't be inline).
  section: { backgroundColor: "#1A1817", minHeight: "100vh", padding: "130px 2rem 4rem", boxSizing: "border-box", fontFamily: "var(--font-jakarta), system-ui, sans-serif", color: "#F5EFE6" },
  container: { maxWidth: 1100, margin: "0 auto" },
  // Deliberately not translated — decorative label, like the site's other
  // eyebrows. Quiet spaced capitals, then the title in gold Cinzel, as on
  // the home hero.
  eyebrow: { fontSize: "0.75rem", fontWeight: 600, color: "#A89F91", letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 1rem" },
  title: { fontFamily: "var(--font-cinzel), var(--font-khmer), serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 500, color: "#C9A961", lineHeight: 1.15, margin: "0 0 1.75rem" },
  // The two tabs in a dark pill, only as wide as they are. A gold pill
  // (`thumb`) sits behind the chosen one and slides across when the other
  // is picked. The tabs' text colours and hover live in app/globals.css's
  // .my-entries-tab rules (inline values would beat the hover; and
  // styled-jsx doesn't reach JSX built in the tabButton helper below).
  tabs: {
    position: "relative",
    display: "inline-flex",
    gap: 4,
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    border: "1px solid rgba(201, 169, 97, 0.25)",
    borderRadius: 999,
  },
  // Placed under the chosen tab by measuring it (left/width set inline as
  // it changes); transitions carry it across.
  thumb: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: 999,
    backgroundColor: "#C9A961",
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
  },
  tab: {
    position: "relative",
    display: "inline-flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: "0.7rem",
    padding: "0.7rem 1.4rem",
    border: "none",
    borderRadius: 999,
    fontFamily: khmerSans,
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  // The count beside each tab's label (dims with the label: opacity).
  count: { fontWeight: 600, opacity: 0.6, letterSpacing: "normal" },
  error: { fontFamily: khmerSans, fontSize: "1rem", color: "#A89F91", margin: "1.25rem 0 0" },
  // Letter-spacing pries apart Khmer glyph clusters.
  trackingNone: { letterSpacing: "normal" },
};

export default function MyEntries({ submissions, tellings, storiesFailed, tellingsFailed, submitted }) {
  const t = useTranslation();
  const { language } = useLanguage();
  const router = useRouter();
  // The thank-you box after a submission. Closing it also drops ?submitted
  // from the address, so a refresh or the back button doesn't show it again.
  const [dialog, setDialog] = useState(submitted);
  const closeDialog = useCallback(() => {
    setDialog(null);
    router.replace("/my-entries", { scroll: false });
  }, [router]);
  // Which tab is showing. Opens on "Your tellings" after a telling or an
  // edit was just sent, so the new one is in view; otherwise on the stories.
  const [tab, setTab] = useState(submitted === "telling" || submitted === "edit" ? "tellings" : "stories");
  const tracking = language === "km" ? styles.trackingNone : null;

  // Where the gold pill sits: the chosen tab's left edge and width, measured
  // from the tab itself — the two labels differ in width, and in Khmer.
  // Measured before paint (layout effect), and again when the window or the
  // language changes, so it never shows in the wrong place.
  const tabRefs = useRef({});
  const [thumb, setThumb] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[tab];
      if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab, language]);

  const tabButton = (id, labelKey, count) => (
    <button
      ref={(el) => {
        tabRefs.current[id] = el;
      }}
      type="button"
      role="tab"
      id={`my-entries-tab-${id}`}
      aria-selected={tab === id}
      aria-controls={`my-entries-panel-${id}`}
      className={tab === id ? "my-entries-tab is-active" : "my-entries-tab"}
      style={{ ...styles.tab, ...tracking }}
      onClick={() => setTab(id)}
    >
      {t(labelKey)}
      <span style={styles.count}>{count}</span>
    </button>
  );

  return (
    <section style={styles.section} className="my-entries-section">
      <div style={styles.container} className="my-entries-content">
        <p style={styles.eyebrow}>My Entries</p>
        <h1 style={styles.title}>{t("myEntriesTitle")}</h1>

        <div role="tablist" style={styles.tabs}>
          {thumb ? (
            <span
              aria-hidden="true"
              style={{ ...styles.thumb, width: thumb.width, transform: `translateX(${thumb.left}px)` }}
            />
          ) : null}
          {tabButton("stories", "myEntriesStoriesHeading", submissions.length)}
          {tabButton("tellings", "myEntriesTellingsHeading", tellings.length)}
        </div>

        {/* Each tab stands alone: a list that failed to load shows the error
            in its own place — never its empty state, which would tell the
            owner they have nothing when they do. */}
        <div role="tabpanel" id={`my-entries-panel-${tab}`} aria-labelledby={`my-entries-tab-${tab}`}>
          {tab === "stories" ? (
            storiesFailed ? (
              <p style={styles.error}>{t("myEntriesListLoadError")}</p>
            ) : (
              <SubmissionsList submissions={submissions} />
            )
          ) : tellingsFailed ? (
            <p style={styles.error}>{t("myEntriesListLoadError")}</p>
          ) : (
            <TellingsList tellings={tellings} />
          )}
        </div>
      </div>

      {dialog ? <SubmittedDialog kind={dialog} onClose={closeDialog} /> : null}
    </section>
  );
}
