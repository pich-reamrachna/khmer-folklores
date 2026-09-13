"use client";

import { useRef } from "react";
import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

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
  // justifyContent: centered on phone instead of left-aligned — lives in
  // this file's own <style> tag below since it needs a media query.
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
    // Centers a short second line under a longer first line when this
    // wraps on phone — plain left-align stranded it flush left, leaving
    // visible dead space to its right.
    textAlign: "center",
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
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
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
  // viewports. fontFamily: this can now show descriptionKhmer, which
  // otherwise inherits `section`'s Latin-only stack and falls back to a
  // generic system Khmer font instead of the loaded Kantumruy Pro.
  summary: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
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
    // "inherit" isn't enough now that this label is translated — the
    // nearest ancestor with an explicit fontFamily is `section`'s
    // Latin-only stack, so Khmer text would fall back to a generic
    // system font instead of the loaded Kantumruy Pro.
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
  },
  metaAside: {
    alignSelf: "flex-end",
    paddingBottom: "1rem",
  },
  // Letter-spacing is a Latin small-caps convention — applied to Khmer,
  // it pries apart the stacked consonant/vowel signs that make up a
  // single visual glyph cluster, since it inserts a gap after every
  // Unicode code point rather than every whole cluster. Spread this in
  // (after the base style) whenever the text might be Khmer.
  trackingNone: {
    letterSpacing: "normal",
  },
  // white-space/overflow/textOverflow: truncates to one line on phone
  // instead of wrapping — wrapping let this box's height vary by entry
  // (1 line vs 2), which grew `main` and pushed the card row/scroll cue
  // below it up or down when switching entries.
  metaTag: {
    margin: 0,
    // Can now show categoryKhmer/placeKhmer — see summary above for why
    // this needs var(--font-khmer) explicitly instead of inheriting.
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
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
    // Same reasoning as readLink above — this label is now translated.
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
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
  const { language } = useLanguage();
  const t = useTranslation();

  // Scrolls to this section's actual next sibling, not a fixed
  // one-viewport-height guess — this section's height varies (minHeight:
  // 100vh), so a fixed guess can land short on short viewports.
  const scrollToNextSection = () => {
    sectionRef.current?.nextElementSibling?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // khmerTitle/title stack (both shown together) regardless of language —
  // everything else swaps, falling back to English when untranslated.
  // summary (story-level), not description (one contributor's specific
  // telling) — description is reserved for StoryMemories.js, where each
  // version is shown separately and correctly attributed.
  const summary = pickText(language, entry.summaryKhmer, entry.summary);
  const category = pickText(language, entry.categoryKhmer, entry.category);
  const place = pickText(language, entry.placeKhmer, entry.place);

  return (
    <section ref={sectionRef} style={styles.section} className="hero-section">
      <div style={styles.container} className="hero-container">
        <p style={styles.eyebrow} className="hero-eyebrow">
          <span style={styles.eyebrowLine} />
          {/* Deliberately not translated — decorative label, kept English
              like the site's other stylistic branding text. */}
          <span style={styles.eyebrowText}>Featured Stories of Khmer Folklores</span>
          <span style={styles.eyebrowLine} />
        </p>

        <div style={styles.main} className="hero-main-grid">
          <div style={styles.textContent} key={entry.id} className="hero-fade">
            {entry.khmerTitle ? (
              <div style={styles.khmerTitle}>{entry.khmerTitle}</div>
            ) : null}

            <h1 style={styles.title} className="hero-title">{entry.title}</h1>

            <p style={styles.summary} className="hero-summary">{summary}</p>

            <Link
              href={`/${entry.id}`}
              style={{ ...styles.readLink, ...(language === "km" ? styles.trackingNone : null) }}
              className="read-link"
              aria-label={t("heroReadStory")}
            >
              {t("heroReadStory")}
            </Link>
          </div>

          {category || place ? (
            <div style={styles.metaAside}>
              <p
                style={{ ...styles.metaTag, ...(language === "km" ? styles.trackingNone : null) }}
                key={entry.id}
                className="hero-fade hero-meta-tag"
              >
                {category}
                {category && place ? " • " : ""}
                {place}
              </p>
            </div>
          ) : null}
        </div>

        {children}

        <div style={styles.scrollCue} className="hero-scroll-cue">
          <button
            type="button"
            style={{ ...styles.scrollCueLink, ...(language === "km" ? styles.trackingNone : null) }}
            className="scroll-cue-link"
            onClick={scrollToNextSection}
            aria-label={t("heroScrollCue")}
          >
            {t("heroScrollCue")}
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
        .hero-eyebrow {
          justify-content: flex-start;
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
            /* minmax(0, ...), not plain 1fr — a bare 1fr track's automatic
               min-width is its content's min-content size, so .hero-meta-tag's
               nowrap text (needed for its ellipsis) would force this column
               wider than the viewport instead of being clipped inside it. */
            grid-template-columns: minmax(0, 1fr);
          }
          .hero-meta-tag {
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .hero-eyebrow {
            justify-content: center;
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
