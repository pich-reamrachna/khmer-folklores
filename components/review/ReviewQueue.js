"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReviewCard from "./ReviewCard.js";
import TellingReviewCard from "./TellingReviewCard.js";
import EditReviewCard from "./EditReviewCard.js";
import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";

// On phone the tabs don't fit on one line, so they become a dropdown
// instead: a gold pill showing the current queue and its count, opening a
// list of all three (the .review-select rules in app/globals.css swap which
// one shows).
//
// /review's queue, in three tabs — new stories, new tellings on published
// stories, and waiting changes to published tellings — each with its count,
// and each list oldest first. The header carries the total on the right.
// app/review/page.js does the fetching and the curator-only check.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
const styles = {
  // Same top/side padding as /share — clears the fixed 90px NavBar. The
  // charcoal texture and bamboo are My Entries' (.my-entries-section in
  // app/globals.css).
  section: {
    backgroundColor: "#1A1817",
    minHeight: "100vh",
    padding: "130px 2rem 4rem",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: { maxWidth: 1300, margin: "0 auto" },
  // Eyebrow and title on the left, the total on the right, on one baseline.
  header: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", margin: "0 0 1.75rem" },
  // Deliberately not translated — decorative label, like the site's other
  // eyebrows.
  eyebrow: { fontSize: "0.75rem", fontWeight: 600, color: "#A89F91", letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 1rem" },
  title: { fontFamily: "var(--font-cinzel), var(--font-khmer), serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 500, color: "#C9A961", lineHeight: 1.15, margin: 0 },
  count: { fontFamily: khmerSans, fontSize: "0.9rem", color: "#A89F91", margin: "0 0 0.4rem" },
  // The tabs: same dark pill with a sliding gold one behind the chosen tab
  // as My Entries (MyEntries.js); colours and hover in app/globals.css's
  // .pill-tab rules.
  // One line that never wraps. On phone, where the three don't fit, it's
  // hidden and the dropdown shows instead (app/globals.css's .review-tabs /
  // .review-select rules).
  tabs: {
    position: "relative",
    display: "inline-flex",
    maxWidth: "100%",
    boxSizing: "border-box",
    gap: 4,
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    border: "1px solid rgba(201, 169, 97, 0.25)",
    borderRadius: 999,
  },
  thumb: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: "#C9A961",
    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
  },
  tab: {
    position: "relative",
    flexShrink: 0,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "baseline",
    gap: "0.7rem",
    padding: "0.7rem 1.4rem",
    border: "none",
    borderRadius: 999,
    fontFamily: khmerSans,
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  tabCount: { fontWeight: 600, opacity: 0.6, letterSpacing: "normal" },
  list: { listStyle: "none", margin: "1.75rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "1.5rem" },
  empty: { fontFamily: khmerSans, fontSize: "1rem", color: "#A89F91", margin: "1.75rem 0 0" },
  trackingNone: { letterSpacing: "normal" },
};

export default function ReviewQueue({ submissions, tellings, edits, loadFailed }) {
  const t = useTranslation();
  const { language } = useLanguage();
  const total = submissions.length + tellings.length + edits.length;
  const tracking = language === "km" ? styles.trackingNone : null;

  let status = `${total} ${t("reviewPendingCount")}`;
  if (loadFailed) status = t("reviewLoadError");
  else if (total === 0) status = t("reviewEmpty");

  // [id, label key, items, card for one item]
  const sections = [
    ["stories", "reviewStoriesHeading", submissions, (x) => <ReviewCard submission={x} />],
    ["tellings", "reviewTellingsHeading", tellings, (x) => <TellingReviewCard telling={x} />],
    ["edits", "reviewEditsHeading", edits, (x) => <EditReviewCard edit={x} />],
  ];
  // Opens on the first tab with something waiting.
  const [tab, setTab] = useState(() => (sections.find(([, , items]) => items.length > 0) ?? sections[0])[0]);
  const current = sections.find(([id]) => id === tab);

  // The gold pill's place: the chosen tab's box, measured from the tab
  // itself (the labels differ in width, and in Khmer; the tabs can wrap onto
  // two rows on a phone). Before paint, and again on resize / language.
  const tabRefs = useRef({});
  const [thumb, setThumb] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[tab];
      if (el) setThumb({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab, language]);

  // The phone dropdown: open or closed. Closes on picking a queue, on a tap
  // anywhere outside it, and on Escape.
  const selectRef = useRef(null);
  const [selectOpen, setSelectOpen] = useState(false);
  useEffect(() => {
    if (!selectOpen) return;
    const onDown = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setSelectOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setSelectOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [selectOpen]);

  return (
    <section style={styles.section} className="my-entries-section">
      <div style={styles.container} className="my-entries-content">
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Curator Review</p>
            <h1 style={styles.title}>{t("reviewTitle")}</h1>
          </div>
          <p style={styles.count}>{status}</p>
        </div>

        {/* Phone: the queues as a dropdown. */}
        <div className="review-select" ref={selectRef}>
          <button
            type="button"
            className="review-select-btn"
            style={tracking ?? undefined}
            aria-haspopup="listbox"
            aria-expanded={selectOpen}
            onClick={() => setSelectOpen((open) => !open)}
          >
            <span>{t(current[1])}</span>
            <span className="review-select-count">{current[2].length}</span>
            <span className={selectOpen ? "review-select-chevron is-open" : "review-select-chevron"} aria-hidden="true" />
          </button>
          <ul className={selectOpen ? "review-select-list is-open" : "review-select-list"} role="listbox" aria-hidden={!selectOpen}>
            {sections.map(([id, labelKey, items]) => (
              <li key={id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={tab === id}
                  className={tab === id ? "review-select-option is-active" : "review-select-option"}
                  style={tracking ?? undefined}
                  onClick={() => {
                    setTab(id);
                    setSelectOpen(false);
                  }}
                >
                  <span>{t(labelKey)}</span>
                  <span className="review-select-count">{items.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div role="tablist" style={styles.tabs} className="review-tabs">
          {thumb ? (
            <span
              aria-hidden="true"
              style={{
                ...styles.thumb,
                width: thumb.width,
                height: thumb.height,
                transform: `translate(${thumb.left}px, ${thumb.top}px)`,
              }}
            />
          ) : null}
          {sections.map(([id, labelKey, items]) => (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              type="button"
              role="tab"
              id={`review-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`review-panel-${id}`}
              className={tab === id ? "pill-tab is-active" : "pill-tab"}
              style={{ ...styles.tab, ...tracking }}
              onClick={() => setTab(id)}
            >
              {t(labelKey)}
              <span style={styles.tabCount}>{items.length}</span>
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`review-panel-${tab}`} aria-labelledby={`review-tab-${tab}`}>
          {current[2].length > 0 ? (
            <ul style={styles.list}>
              {current[2].map((item) => (
                <li key={item.id}>{current[3](item)}</li>
              ))}
            </ul>
          ) : loadFailed ? null : (
            <p style={styles.empty}>{t("reviewEmpty")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
