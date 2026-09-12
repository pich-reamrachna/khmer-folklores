"use client";

import { useRef } from "react";
import Link from "next/link";

// StoryHero — the hero-section from the mockup: eyebrow, title, summary,
// CTA, and a meta tag, laid out as a two-column grid. `children` (the entry
// card carousel) renders below the grid, inside the same container, so it
// shares this section's padding/max-width/gap instead of managing its own.
// "use client" is required for the scroll-cue's onClick handler.

// Properties that vary by breakpoint can't stay inline — a stylesheet rule
// can never override an inline style — so they live in the plain <style>
// tag at the bottom of this file instead. Each moved property is noted
// below; paddingLeft/paddingRight on `section` stay inline and fixed at
// 2rem always, since ArchiveBrowser/StoryDetails match that exact value
// to keep column edges aligned.
const styles = {
  section: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    paddingLeft: "2rem",
    paddingRight: "2rem",
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
  // gap: shrinks on short viewports.
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
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
  // grid-template-columns: 1 column on phone. minHeight: shrinks on short
  // viewports.
  main: {
    display: "grid",
    alignItems: "center",
    gap: "3rem",
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
  // fontSize/marginBottom: shrink on short viewports, so this box doesn't
  // single-handedly keep `main` tall on wide-but-short screens.
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    // Fixed to exactly 2 lines (2 x line-height) regardless of whether
    // the actual title wraps to 1 or 2 lines, so switching entries never
    // changes this element's height.
    height: "2.1em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  // height/WebkitLineClamp/marginBottom: 2 lines instead of 3 on short
  // viewports.
  summary: {
    fontSize: "1.05rem",
    color: "#BBAEBF",
    fontWeight: 300,
    lineHeight: 1.7,
    maxWidth: 680,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    display: "-webkit-box",
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
  // white-space: wraps on phone instead of overflowing the section.
  metaTag: {
    margin: 0,
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#E6C575",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  // paddingTop: shrinks on short viewports.
  scrollCue: {
    display: "flex",
    justifyContent: "center",
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
  const sectionRef = useRef(null);

  // Scrolls to this section's actual next sibling, not a fixed
  // one-viewport-height guess — this section's height varies (minHeight:
  // 100vh), so a fixed guess can land short on short viewports.
  const scrollToNextSection = () => {
    sectionRef.current?.nextElementSibling?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section ref={sectionRef} style={styles.section} className="hero-section">
      <div style={styles.container} className="hero-container">
        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>A Story from the Living Archive</span>
          <span style={styles.eyebrowLine} />
        </p>

        <div style={styles.main} className="hero-main-grid">
          <div style={styles.textContent} key={entry.id} className="hero-fade">
            {entry.khmerTitle ? (
              <div style={styles.khmerTitle}>{entry.khmerTitle}</div>
            ) : null}

            <h1 style={styles.title} className="hero-title">{entry.title}</h1>

            <p style={styles.summary} className="hero-summary">{entry.description}</p>

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
              <p
                style={styles.metaTag}
                key={entry.id}
                className="hero-fade hero-meta-tag"
              >
                {entry.category}
                {entry.category && entry.place ? " • " : ""}
                {entry.place}
              </p>
            </div>
          ) : null}
        </div>

        {children}

        <div style={styles.scrollCue} className="hero-scroll-cue">
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

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so this phone layout is correct from the
          first paint instead of only after hydration. */}
      <style>{`
        .hero-section {
          padding-top: 130px;
          padding-bottom: 3rem;
        }
        .hero-container {
          gap: 2.2rem;
        }
        .hero-main-grid {
          grid-template-columns: 1fr auto;
          min-height: 280px;
        }
        .hero-meta-tag {
          white-space: nowrap;
        }
        .hero-title {
          font-size: clamp(2.8rem, 6vw, 5.2rem);
          margin-bottom: 1.2rem;
        }
        .hero-summary {
          height: 5.1em;
          -webkit-line-clamp: 3;
          margin-bottom: 1.8rem;
        }
        .hero-scroll-cue {
          padding-top: 0.5rem;
        }
        @media (max-width: 640px) {
          .hero-main-grid {
            grid-template-columns: 1fr;
          }
          .hero-meta-tag {
            white-space: normal;
          }
        }
        /* minHeight:100vh above lets this section grow taller than a short
           viewport (landscape phones, short browser windows) instead of
           clipping — shrinking these properties reduces how much taller. */
        @media (max-height: 700px) {
          .hero-section {
            padding-top: 100px;
            padding-bottom: 1rem;
          }
          .hero-container {
            gap: 1rem;
          }
          .hero-main-grid {
            min-height: 200px;
          }
          .hero-title {
            font-size: clamp(2.6rem, 5vw, 3.6rem);
            margin-bottom: 0.8rem;
          }
          .hero-summary {
            height: 3.4em;
            -webkit-line-clamp: 2;
            margin-bottom: 1rem;
          }
          .hero-scroll-cue {
            padding-top: 0.25rem;
          }
        }
      `}</style>
    </section>
  );
}
