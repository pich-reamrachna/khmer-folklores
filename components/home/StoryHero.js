"use client";

import Link from "next/link";

// StoryHero — the hero-section from the mockup: eyebrow, title, summary,
// CTA, and a meta tag, laid out as a two-column grid. `children` (the entry
// card carousel) renders below the grid, inside the same container, so it
// shares this section's padding/max-width/gap instead of managing its own.
// "use client" is required for the scroll-cue's onClick handler.

const styles = {
  section: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    // Top padding clears the fixed 90px NavBar.
    padding: "130px 2rem 3rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    // No overflow:hidden — the entry cards below need room for their
    // hover lift (translateY) and glow (box-shadow) to render past the
    // card's own box without being clipped at this section's edges.
    backgroundColor: "#08040A",
    boxSizing: "border-box",
    scrollSnapAlign: "start",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2.2rem",
    position: "relative",
    zIndex: 2,
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: 0,
  },
  eyebrowLine: {
    height: 1,
    width: 48,
    backgroundColor: "rgba(197, 160, 89, 0.65)",
  },
  eyebrowText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: "3rem",
    minHeight: 280,
  },
  textContent: {
    maxWidth: 760,
  },
  khmerTitle: {
    fontFamily: "'Kantumruy Pro', serif",
    fontSize: "2.2rem",
    fontWeight: 600,
    color: "#D4AF37",
    letterSpacing: "0.04em",
    margin: "0 0 0.5rem",
  },
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
    margin: "0 0 1.2rem",
    // Fixed to exactly 2 lines (2 x line-height) regardless of whether
    // the actual title wraps to 1 or 2 lines, so switching entries never
    // changes this element's height.
    height: "2.1em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  summary: {
    fontSize: "1.05rem",
    color: "#BBAEBF",
    fontWeight: 300,
    lineHeight: 1.7,
    maxWidth: 680,
    margin: "0 0 1.8rem",
    // Fixed to exactly 3 lines (3 x line-height); longer descriptions
    // are clipped with an ellipsis instead of growing the hero block.
    height: "5.1em",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  // color/borderBottomColor live in app/globals.css's .read-link rule —
  // needed for :hover to work, and a plain stylesheet avoids the
  // hydration-gap flash a <style jsx> block here would have.
  readLink: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    border: "none",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  metaAside: {
    alignSelf: "flex-end",
    paddingBottom: "1rem",
  },
  metaTag: {
    margin: 0,
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#E6C575",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  scrollCue: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "0.5rem",
  },
  // color/font-size live in app/globals.css's .scroll-cue-link rule, same
  // reason as readLink above.
  scrollCueLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "transparent",
    border: "none",
    fontWeight: 600,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  // Recolored via mask-image, same technique as the other icons in this
  // app. background-color and the float animation's @keyframes live in
  // app/globals.css, same reason as scrollCueLink above.
  scrollCueIcon: {
    display: "inline-block",
    width: 14,
    height: 14,
    WebkitMaskImage: "url(/icons/arrow-down-sign-to-navigate.png)",
    maskImage: "url(/icons/arrow-down-sign-to-navigate.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    animation: "scroll-cue-float 1.6s ease-in-out infinite",
  },
};

export default function StoryHero({ entry, children }) {
  // Nudge <main> down by one viewport; scroll-snap-type: y mandatory
  // (set on <main> in app/page.js) corrects the exact rest position,
  // same approximate-nudge-then-snap pattern EntryCardRow uses.
  const scrollToNextSection = () => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    mainEl.scrollBy({ top: mainEl.clientHeight, behavior: "smooth" });
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>A Story from the Living Archive</span>
          <span style={styles.eyebrowLine} />
        </p>

        <div style={styles.main}>
          <div style={styles.textContent} key={entry.id} className="hero-fade">
            {entry.khmerTitle ? (
              <div style={styles.khmerTitle}>{entry.khmerTitle}</div>
            ) : null}

            <h1 style={styles.title}>{entry.title}</h1>

            <p style={styles.summary}>{entry.description}</p>

            <Link
              href={`/${entry.id}`}
              style={styles.readLink}
              className="read-link"
              aria-label="Read this story"
            >
              Read This Story
            </Link>
          </div>

          {entry.category || entry.place ? (
            <div style={styles.metaAside}>
              <p style={styles.metaTag} key={entry.id} className="hero-fade">
                {entry.category}
                {entry.category && entry.place ? " • " : ""}
                {entry.place}
              </p>
            </div>
          ) : null}
        </div>

        {children}

        <div style={styles.scrollCue}>
          <button
            type="button"
            style={styles.scrollCueLink}
            className="scroll-cue-link"
            onClick={scrollToNextSection}
            aria-label="Scroll to the next section"
          >
            Scroll to open ledger
            <span style={styles.scrollCueIcon} className="scroll-cue-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
