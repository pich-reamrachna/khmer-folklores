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
  // Decorative golden-waves backdrop. Lives in its own absolutely
  // positioned layer (below `container`'s zIndex: 2) with its own
  // overflow:hidden, so the image is clipped to the section without
  // clipping the entry cards' hover lift/glow the way overflow:hidden on
  // `section` itself would. pointerEvents:none keeps it from ever
  // intercepting clicks on the content above it.
  backdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  // The waves sit in the image's lower two-thirds, so anchoring it to the
  // bottom keeps them behind the card row and away from the title/summary.
  // Low opacity plus the mask fade (top and bottom edges dissolve into
  // `section`'s background) keep it an ambient texture, not a picture
  // competing with the text.
  backdropImage: {
    position: "absolute",
    inset: 0,
    // A 2000px WebP of the original PNG (602 KB instead of 2.7 MB) — at this
    // low opacity the smaller size isn't visible. app/page.js preloads it.
    backgroundImage: "url(/golden-waves.webp)",
    backgroundSize: "cover",
    backgroundPosition: "center bottom",
    backgroundRepeat: "no-repeat",
    opacity: 0.25,
    WebkitMaskImage:
      "linear-gradient(to bottom, transparent 0%, #000 35%, #000 80%, transparent 100%)",
    maskImage:
      "linear-gradient(to bottom, transparent 0%, #000 35%, #000 80%, transparent 100%)",
  },
  // Readability scrim: darkest behind the left-aligned text column and
  // fading out toward the right, so the waves stay visible on the open
  // side of the layout while the title/summary keep full contrast.
  backdropScrim: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(8, 4, 10, 0.92) 0%, rgba(8, 4, 10, 0.7) 35%, rgba(8, 4, 10, 0.2) 70%, rgba(8, 4, 10, 0) 100%)",
  },
  // The selected story's own picture (stories.photo_url), as a large
  // cinematic layer filling the right of the hero — above the waves/scrim,
  // below the text and cards (container's zIndex: 2). display lives in this
  // file's <style> tag below (hidden on phone, where the text fills the
  // width), since an inline display would beat that media query.
  // One fixed frame for every story's picture: the right 60% of the hero,
  // from just above the top to well past the bottom (the figure's lower body
  // runs off behind the card row and fades out). The backdrop's
  // overflow:hidden clips it. Each picture is prepared to sit well in this
  // frame (transparent space added around it where needed), rather than
  // tuning the frame per story.
  // top/right/bottom/width live in this file's <style> tag below (class
  // .hero-picture-layer): tall screens re-anchor the frame to the middle
  // of the hero, and a media query can't override inline styles.
  pictureLayer: {
    position: "absolute",
    // Fades the top and bottom edges into the section: the bottom so the
    // picture doesn't end in a hard line behind the card row, the top so an
    // illustration that touches its own top edge (like Ahpt's hair) doesn't
    // show its gold glow cut off flat.
    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 70%, transparent 100%)",
    maskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 70%, transparent 100%)",
  },
  // contain (not cover) so a portrait illustration is never cropped.
  // objectPosition lives in this file's <style> tag below (class
  // .hero-picture-img) — top centre on landscape screens, lower on tall
  // ones. The left fade melts its left edge into the dark side where the
  // text sits, and the drop-shadow traces its transparent outline.
  picture: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 25%)",
    maskImage: "linear-gradient(to right, transparent 0%, #000 25%)",
    // Cast shadow behind the figure: a deep, soft one thrown down-left onto
    // the gold waves, plus a tight one hugging the outline — so the figure
    // reads as standing in front of the landscape, not printed on it.
    filter: "drop-shadow(-22px 28px 30px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.6))",
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
    // Sits over the story's picture, which can be light there (Bramat
    // Promong's scarf) — a soft dark halo keeps the gold text readable.
    textShadow: "0 0 10px rgba(8, 4, 10, 0.9), 0 0 3px rgba(8, 4, 10, 0.9)",
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
      <div style={styles.backdrop} aria-hidden="true">
        <div style={styles.backdropImage} />
        <div style={styles.backdropScrim} />
        {entry.photoUrl ? (
          <div style={styles.pictureLayer} className="hero-picture-layer">
            {/* key + hero-fade: fades in with the text when the selected
                story changes. Decorative here (the title says what it is),
                and this whole backdrop is aria-hidden. */}
            <img
              key={entry.id}
              src={entry.photoUrl}
              alt=""
              style={styles.picture}
              className="hero-fade hero-picture-img"
            />
          </div>
        ) : null}
      </div>

      <div style={styles.container} className="hero-container">
        <p style={styles.eyebrow} className="hero-eyebrow">
          <span style={styles.eyebrowLine} />
          {/* Deliberately not translated — decorative label, kept English
              like the site's other stylistic branding text. */}
          <span style={styles.eyebrowText}>Featured Stories of Khmer Folklores</span>
          <span style={styles.eyebrowLine} />
        </p>

        <div style={styles.main} className="hero-main-grid">
          {/* max-width lives in the <style> tag below (.hero-text) — it
              narrows on small screens to keep clear of the picture. */}
          <div key={entry.id} className="hero-fade hero-text">
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
        /* Landscape screens: the frame is the right 60% of the hero, from
           just above its top to well past its bottom — each picture file is
           prepared (empty space around the figure) to sit right here. */
        .hero-picture-layer {
          display: block;
          top: -4%;
          right: 0;
          bottom: -34%;
          width: 60%;
        }
        .hero-picture-img {
          object-position: center top;
        }
        .hero-text {
          max-width: 760px;
        }
        /* Tall screens (portrait tablets, narrow windows): the hero is taller
           than it is wide, so its text sits around the middle while a
           top-anchored frame would put the picture up behind the NavBar.
           Here the frame keeps the same 60% width and its proportions, but
           is centred on the hero (nudged up to sit beside the title) — the
           picture moves with the text instead of with the top edge. */
        @media (max-aspect-ratio: 5/4) {
          .hero-picture-layer {
            top: 50%;
            bottom: auto;
            aspect-ratio: 5 / 7;
            transform: translateY(-58%);
          }
          /* In this tall frame a wide picture (the crocodile) fills only
             the frame's width, and pinned to the top it sat high above the
             title. 35% places it lower; pictures that already fill the
             frame's height (Bramat) barely move. */
          .hero-picture-img {
            object-position: center 35%;
          }
        }
        /* Too narrow for the title column and the category/place tag side by
           side (the tag never wraps, and was running off-screen): the tag
           drops onto its own line under the text, as on phone, shortened
           with an ellipsis only if it still doesn't fit. */
        @media (max-width: 860px) {
          .hero-main-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .hero-meta-tag {
            overflow: hidden;
            text-overflow: ellipsis;
          }
          /* With the tag on its own line the text column would otherwise
             stretch across the full width, over the picture on the right. */
          .hero-text {
            max-width: 56%;
          }
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
          /* Phone: the text spans the full width, so a picture behind it
             would fight the title and summary — hidden here. */
          .hero-picture-layer {
            display: none;
          }
          /* No picture on phone, so the text uses the full width again. */
          .hero-text {
            max-width: none;
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
        /* Smaller title on phone: a long single word in Cinzel capitals
           ("Reincarnation") was wider than the screen and got cut off. Last
           in this block so it also wins over the short-screen rule above
           (a short phone matches both). */
        @media (max-width: 640px) {
          .hero-title {
            font-size: clamp(1.8rem, 7.4vw, 2.8rem);
          }
        }
      `}</style>
    </section>
  );
}
