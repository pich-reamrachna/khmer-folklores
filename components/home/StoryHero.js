"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import useHorizontalWheel from "../../utils/useHorizontalWheel.js";

// StoryHero — the home page's first screen: the selected story's category,
// title, summary and "Read the Story" button over a charcoal-and-gold-brush
// backdrop with its picture, plus previous/next arrows at the edges.
// `children` (the featured-story row) renders below the text, inside the
// same container, so it shares this section's padding/gap instead of
// managing its own. "use client" is required for the arrows' onClick.

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
    // No overflow:hidden here — the backdrop layer below clips its own
    // overhanging images instead.
    // Warm charcoal rather than the site's purple-black, so the gold brush
    // strokes behind the picture read as paint on a dark wall.
    backgroundColor: "#1A1817",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  // Decorative gold-brush backdrop. Lives in its own absolutely
  // positioned layer (below `container`'s zIndex: 2) with its own
  // overflow:hidden, so the brush strokes and picture that overhang the
  // section are clipped to it. pointerEvents:none keeps it from ever
  // intercepting clicks on the content above it.
  backdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  // Worn charcoal texture (soft smudges, faint scratches) under everything
  // else — the dark wall the brush strokes are painted on. `section`'s
  // backgroundColor shows until it loads. app/page.js preloads it.
  texture: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url(/rustic-charcoal.webp)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  // The big diagonal gold stroke behind the picture, running from the
  // bottom-left of the right half up past the top-right corner. Its box and
  // opacity live in this file's <style> tag below (.hero-brush-main) —
  // phone fades it right down, and a media query can't beat inline styles.
  // app/page.js preloads it.
  brushMain: {
    position: "absolute",
    backgroundImage: "url(/gold-brush-main-cropped.png)",
    backgroundSize: "contain",
    backgroundPosition: "right center",
    backgroundRepeat: "no-repeat",
  },
  // A smaller, muted stroke low on the left, under the story row — balances
  // the main stroke. Box/opacity in the <style> tag (.hero-brush-accent).
  brushAccent: {
    position: "absolute",
    backgroundImage: "url(/gold-brush-accent-cropped.png)",
    backgroundSize: "contain",
    backgroundPosition: "left bottom",
    backgroundRepeat: "no-repeat",
  },
  // A dark band across the bottom of the hero, on top of the brush and the
  // picture, so the story row under the text stays readable where it
  // crosses the bright gold stroke. Fades in from nothing, so there's no
  // hard edge where it starts.
  rowBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
    background:
      "linear-gradient(to top, rgba(14, 12, 11, 0.88) 0%, rgba(14, 12, 11, 0.72) 45%, rgba(14, 12, 11, 0) 100%)",
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
  // Fills the frame; carries the picture's enter/exit slide.
  pictureMotion: {
    width: "100%",
    height: "100%",
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
  // gap: shrinks on short viewports. No max-width: the side padding in the
  // <style> tag below scales with the screen instead, so the text keeps the
  // same distance from the edge on a wide monitor as on a laptop.
  container: {
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
  },
  // The story's category ("LEGEND") above the title. Can show
  // categoryKhmer, so it needs var(--font-khmer).
  eyebrow: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#A89F91",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    margin: "0 0 1.2rem",
  },
  // minHeight: shrinks on short viewports.
  main: {
    display: "flex",
    alignItems: "center",
  },
  // Under the English title, quieter than it — the English one leads.
  khmerTitle: {
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "1.35rem",
    fontWeight: 400,
    color: "#D9D2C5",
    margin: "0 0 1.4rem",
  },
  // Three hairlines of different lengths under the Khmer title — a
  // decorative break before the summary, like ruled lines in a ledger.
  rule: {
    display: "flex",
    gap: 6,
    margin: "0 0 1.6rem",
  },
  ruleLine: {
    height: 1,
    backgroundColor: "rgba(245, 239, 230, 0.28)",
  },
  // fontSize/marginBottom: shrink on short viewports, so this box doesn't
  // single-handedly keep `main` tall on wide-but-short screens.
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontWeight: 500,
    color: "#C9A961",
    lineHeight: 1.05,
    letterSpacing: "0.01em",
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
    fontSize: "1.15rem",
    color: "#F5EFE6",
    fontWeight: 400,
    lineHeight: 1.65,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  // The filled gold button. backgroundColor/color live in app/globals.css's
  // .hero-read-btn rule — it's a Link, and its :hover can only be styled
  // from there (see CLAUDE.md on <style jsx> and Link).
  // padding and fontSize live there too: the button is smaller on phone,
  // and a media query can't beat an inline style.
  readButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.9rem",
    textDecoration: "none",
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  // The small ◆ either side of the button's label.
  diamond: {
    fontSize: "0.55rem",
    letterSpacing: "normal",
  },
  // Letter-spacing is a Latin small-caps convention — applied to Khmer,
  // it pries apart the stacked consonant/vowel signs that make up a
  // single visual glyph cluster, since it inserts a gap after every
  // Unicode code point rather than every whole cluster. Spread this in
  // (after the base style) whenever the text might be Khmer.
  trackingNone: {
    letterSpacing: "normal",
  },
  // The previous/next arrows at the hero's left and right edges.
  // left/right/top live in this file's <style> tag below (.hero-arrow-prev/-next) — they tighten on
  // phone, and a media query can't beat inline styles.
  // display lives in this file's <style> tag below (.hero-arrow) — phone
  // hides the arrows, and a media query can't beat an inline style.
  arrow: {
    position: "absolute",
    zIndex: 3,
    transform: "translateY(-50%)",
    padding: "0.5rem",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  // The blade-shaped arrows (public/arrow-left.svg / arrow-right.svg), each
  // a lit facet over a shaded one. Shown as images, not recoloured through
  // mask-image like the site's other icons: a mask would flatten the two
  // facets into one colour, and the shading is the point of the design.
  // Sized to the files' own 40:72 shape. The hover glow and nudge live in
  // app/globals.css's .hero-arrow rules.
  arrowIcon: {
    display: "block",
    width: 22,
    height: 40,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
};

// The three hairlines' lengths, left to right (see `rule` above).
const RULE_WIDTHS = [108, 216, 72];

// `index` is the shown story's place among the `total` featured stories;
// onSelect(index) switches the hero to another one.
export default function StoryHero({ entry, index, total, onSelect, children }) {
  const { language } = useLanguage();

  // Whether the hero is the section in view — drives the text block's (and
  // picture's) enter/exit animation (.hero-section.is-in-view in the <style> below):
  // the text slides in from the left as the page arrives here (including on
  // first load) and back out as it leaves. Watched against <main>, the
  // page's scroll container, by how much of the screen the hero fills —
  // measured against the screen rather than the section, so a hero taller
  // than the screen still counts. Which way it's moving decides the line:
  // arriving, it counts once it fills half the screen, so the slide starts
  // mid-scroll (no wait) and finishes as the page settles; leaving, it stops
  // counting the moment it no longer fills the screen, so the slide-out
  // starts as soon as the page moves.
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let lastShown = 0;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (!e.rootBounds) return;
        const shown = e.intersectionRect.height / e.rootBounds.height;
        const arriving = shown >= lastShown;
        lastShown = shown;
        setInView(shown >= (arriving ? 0.5 : 0.95));
      },
      {
        root: section.closest("main"),
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  const t = useTranslation();

  // khmerTitle/title stack (both shown together) regardless of language —
  // everything else swaps, falling back to English when untranslated.
  // summary (story-level), not description (one contributor's specific
  // telling) — description is reserved for StoryMemories.js, where each
  // version is shown separately and correctly attributed.
  const summary = pickText(language, entry.summaryKhmer, entry.summary);
  const category = pickText(language, entry.categoryKhmer, entry.category);
  // Letter-spacing off for Khmer labels (see trackingNone above).
  const tracking = language === "km" ? styles.trackingNone : null;

  // The arrows wrap around: before the first story comes the last, and
  // after the last comes the first.
  const prevIndex = (index - 1 + total) % total;
  const nextIndex = (index + 1) % total;

  // Scrolling sideways over the hero (trackpad swipe, Shift + wheel, or a
  // finger swiped across it on a phone) steps through the stories like the
  // arrows: on to the next, or back to the previous.
  useHorizontalWheel(sectionRef, (step) => {
    if (total > 1) onSelect(step > 0 ? nextIndex : prevIndex);
  });

  return (
    <section ref={sectionRef} style={styles.section} className={inView ? "hero-section is-in-view" : "hero-section"}>
      <div style={styles.backdrop} aria-hidden="true">
        <div style={styles.texture} />
        <div style={styles.brushMain} className="hero-brush-main" />
        <div style={styles.brushAccent} className="hero-brush-accent" />
        {entry.photoUrl ? (
          <div style={styles.pictureLayer} className="hero-picture-layer">
            {/* key + hero-fade: fades in with the text when the selected
                story changes. Decorative here (the title says what it is),
                and this whole backdrop is aria-hidden. */}
            {/* hero-picture-motion: the enter/exit slide (in the <style>
                below), on its own wrapper so it doesn't clash with the
                frame's own transform on tall screens or the img's fade. */}
            <div style={styles.pictureMotion} className="hero-picture-motion">
              <img
                key={entry.id}
                src={entry.photoUrl}
                alt=""
                style={styles.picture}
                className="hero-fade hero-picture-img"
              />
            </div>
          </div>
        ) : null}
        <div style={styles.rowBand} />
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            style={styles.arrow}
            className="hero-arrow hero-arrow-prev"
            onClick={() => onSelect(prevIndex)}
            aria-label={t("heroPrevStory")}
          >
            <span
              style={{ ...styles.arrowIcon, backgroundImage: "url(/arrow-left.svg)" }}
              className="hero-arrow-icon"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            style={styles.arrow}
            className="hero-arrow hero-arrow-next"
            onClick={() => onSelect(nextIndex)}
            aria-label={t("heroNextStory")}
          >
            <span
              style={{ ...styles.arrowIcon, backgroundImage: "url(/arrow-right.svg)" }}
              className="hero-arrow-icon"
              aria-hidden="true"
            />
          </button>
        </>
      ) : null}

      <div style={styles.container} className="hero-container">
        <div style={styles.main} className="hero-main-grid">
          {/* max-width lives in the <style> tag below (.hero-text) — it
              narrows on small screens to keep clear of the picture. */}
          <div key={entry.id} className="hero-fade hero-text">
            {category ? <p style={{ ...styles.eyebrow, ...tracking }}>{category}</p> : null}

            <h1 style={styles.title} className="hero-title">{entry.title}</h1>

            {entry.khmerTitle ? (
              <div style={styles.khmerTitle}>{entry.khmerTitle}</div>
            ) : null}

            <div style={styles.rule} aria-hidden="true">
              {RULE_WIDTHS.map((width) => (
                <span key={width} style={{ ...styles.ruleLine, width }} />
              ))}
            </div>

            <p style={styles.summary} className="hero-summary">{summary}</p>

            <Link href={`/${entry.id}`} style={{ ...styles.readButton, ...tracking }} className="hero-read-btn">
              <span style={styles.diamond} aria-hidden="true">◆</span>
              {t("heroReadStory")}
              <span style={styles.diamond} aria-hidden="true">◆</span>
            </Link>
          </div>
        </div>

        {children}
      </div>

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so this phone layout is correct from the
          first paint instead of only after hydration. */}
      <style>{`
        .hero-section {
          padding-top: 130px;
          padding-bottom: 3rem;
        }
        /* Side padding puts the text about 9% of the screen width in from
           each edge (with the section's own 2rem), and never less than 5rem
           — the gutter the edge arrows need so they never sit on the text
           or the story row. */
        .hero-container {
          gap: 2.2rem;
          padding-left: max(5rem, calc(9vw - 2rem));
          padding-right: max(5rem, calc(9vw - 2rem));
          box-sizing: border-box;
        }
        .hero-arrow {
          display: flex;
          top: 42%;
        }
        .hero-arrow-prev {
          left: 2.75rem;
        }
        .hero-arrow-next {
          right: 2.75rem;
        }
        .hero-main-grid {
          min-height: 280px;
        }
        /* Enter/exit, after the reference site's text panels: away from the
           hero, the text block rests faded and shifted 5rem left; arriving,
           it slides into place and fades up, and leaving reverses it. On
           the wrapper, not .hero-text, whose own fade replays per story.
           0.9s: arriving, it starts mid-scroll and runs on past the landing. */
        .hero-main-grid {
          opacity: 0.2;
          transform: translateX(-5rem);
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-section.is-in-view .hero-main-grid {
          opacity: 1;
          transform: none;
        }
        /* The picture does the same, mirrored: it rests shifted 5rem right
           and slides in from the right as the text comes in from the left. */
        .hero-picture-motion {
          opacity: 0.2;
          transform: translateX(5rem);
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-section.is-in-view .hero-picture-motion {
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-picture-motion {
            transform: none;
            transition: opacity 0.3s ease;
          }
          .hero-main-grid {
            transform: none;
            transition: opacity 0.3s ease;
          }
        }
        /* Overhangs the top and bottom so the stroke's ragged ends run off
           the section instead of stopping inside it. */
        .hero-brush-main {
          top: -14%;
          bottom: -14%;
          right: -4%;
          width: 72%;
        }
        /* Flush with the left edge: the image's own left side is cut
           straight, so anywhere else it shows as a hard vertical line. */
        .hero-brush-accent {
          left: 0;
          bottom: -2%;
          width: 34%;
          height: 22%;
          opacity: 0.55;
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
        /* Narrow like the mockup's column, so the summary wraps into short
           lines and the picture on the right has room. */
        .hero-text {
          max-width: 560px;
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
        /* Narrow screens: keep the text column clear of the picture on the
           right. */
        @media (max-width: 860px) {
          .hero-text {
            max-width: 56%;
          }
        }
        .hero-title {
          font-size: clamp(2.8rem, 5.2vw, 4.8rem);
          margin-bottom: 0.8rem;
        }
        .hero-summary {
          height: 4.95em;
          -webkit-line-clamp: 3;
          margin-bottom: 2rem;
        }
        /* Phone: stacked, like a poster — the story's picture large across
           the top with the gold brush stroke behind it, fading down into the
           dark; the text under it; the story row at the bottom (it replaces
           the edge arrows here). */
        @media (max-width: 640px) {
          .hero-section {
            justify-content: flex-start;
            padding-top: calc(42svh + 1.25rem);
            padding-bottom: 1.25rem;
          }
          /* The picture's frame: the screen's full width, from under the
             NavBar down to about half the screen. */
          .hero-picture-layer {
            display: block;
            top: 70px;
            right: 0;
            bottom: auto;
            left: 0;
            width: 100%;
            height: calc(42svh - 50px);
            aspect-ratio: auto;
            transform: none;
          }
          /* The whole picture, centred in that frame, fading out at its
             bottom into the text. !important: the left-edge fade it uses on
             wider screens is an inline style, which only this can beat. */
          .hero-picture-img {
            object-position: center center;
            -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 100%) !important;
            mask-image: linear-gradient(to bottom, #000 72%, transparent 100%) !important;
          }
          /* The brush stroke behind the picture, stronger than on wider
             screens since the text no longer runs across it. */
          .hero-brush-main {
            top: 85px;
            bottom: auto;
            right: 2%;
            width: 125%;
            height: calc(42svh - 40px);
            opacity: 0.85;
            /* Fades out at the bottom instead of stopping on a straight line
               above the text. */
            -webkit-mask-image: linear-gradient(to bottom, #000 60%, transparent 100%);
            mask-image: linear-gradient(to bottom, #000 60%, transparent 100%);
          }
          .hero-brush-accent {
            display: none;
          }
          /* The text uses the full width, under the picture. min-width: 0
             lets it wrap inside the screen instead of running off its edge. */
          .hero-main-grid {
            min-height: 0;
          }
          .hero-text {
            max-width: none;
            min-width: 0;
            flex: 1;
          }
          /* The section's own 2rem is the side margin on phone. */
          .hero-container {
            gap: 1rem;
            padding-left: 0;
            padding-right: 0;
          }
          /* The story row does the stepping on phone. */
          .hero-arrow {
            display: none;
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
            height: 3.3em;
            -webkit-line-clamp: 2;
            margin-bottom: 1rem;
          }
        }
        /* Smaller title on phone: a long single word in Cinzel capitals
           ("Reincarnation") was wider than the screen and got cut off. Last
           in this block so it also wins over the short-screen rule above
           (a short phone matches both). */
        @media (max-width: 640px) {
          /* Only as tall as the title is: the two lines it keeps on wider
             screens (so switching stories never moves the text) left a gap
             under a one-line title here. !important: that fixed height is
             an inline style. */
          .hero-title {
            font-size: clamp(1.8rem, 7.4vw, 2.8rem);
            height: auto !important;
          }
          .hero-summary {
            font-size: 0.95rem;
            margin-bottom: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}
