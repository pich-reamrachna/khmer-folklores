"use client";

import BackButton from "../shared/BackButton.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// First section of a story's dedicated page, in two bands:
//  - the header: back link, the English title with the Khmer title under
//    it, then the story-level summary as a pull quote (not any one
//    contributor's description — see StoryMemories.js for those), and the
//    story's picture on the right — with the Khmer title again, huge and
//    faint, as a watermark behind;
//  - under a hairline, `children` — the story page passes its first telling
//    (FirstTelling.js) — and beside it a small table of the story's details
//    (kind, first sharer, where it's told).
// Backdrop: the home hero's charcoal texture with the ink splash
// (public/splash.jpg) in place of its gold brush strokes.
//
// The two-column grids collapse to one column on narrow screens, which an
// inline style can't do — their columns live in the <style> tag below.

const styles = {
  section: {
    position: "relative",
    width: "100%",
    // Top padding clears the fixed 90px NavBar, matching StoryHero/ArchiveBrowser.
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    // The home hero's warm charcoal (StoryHero.js), shown until the texture
    // below loads.
    backgroundColor: "#1A1817",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  // The home hero's backdrop, with the ink splash (public/splash.jpg) in
  // place of its gold brush strokes: its own layer under the text, clipped
  // to the section, never catching clicks.
  backdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  // Same worn charcoal texture as the hero, faded out at the bottom into the
  // plain charcoal of the section below (StoryMemories.js), so the two meet
  // without a hard line.
  texture: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url(/rustic-charcoal.webp)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    WebkitMaskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)",
    maskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)",
  },
  // The splash over the right half, where the hero's brush strokes sit —
  // the empty side beside the text column. Its pale wash at the top runs
  // down into black drips; warmed and dimmed toward the charcoal, and faded
  // out to the left (toward the text) and at the bottom (into the section).
  splash: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "58%",
    backgroundImage: "url(/splash.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    filter: "sepia(0.35) brightness(0.7)",
    opacity: 0.55,
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to bottom, #000 55%, transparent 100%)",
    maskImage:
      "linear-gradient(to right, transparent 0%, #000 45%), linear-gradient(to bottom, #000 55%, transparent 100%)",
    WebkitMaskComposite: "source-in",
    maskComposite: "intersect",
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
  },
  backButton: {
    margin: "0 0 2rem",
  },
  // The Khmer title, huge and faint behind the header — part of the
  // backdrop layer, so it's clipped to the section and never catches clicks.
  watermark: {
    position: "absolute",
    top: 110,
    left: "1.5rem",
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "clamp(7rem, 15vw, 14rem)",
    fontWeight: 700,
    lineHeight: 1,
    color: "rgba(245, 239, 230, 0.035)",
    whiteSpace: "nowrap",
  },
  // Text on the left, picture on the right (columns in the <style> tag).
  header: {
    display: "grid",
    alignItems: "center",
    gap: "2rem",
    paddingBottom: "3rem",
    borderBottom: "1px solid rgba(245, 239, 230, 0.1)",
  },
  // Type follows the home hero (StoryHero.js): the English title in gold
  // Cinzel, the Khmer title under it.
  // overflowWrap: lets a single long word (e.g. "Reincarnation") break
  // instead of overflowing the page at the clamp's smallest size.
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "clamp(2.8rem, 5.2vw, 4.8rem)",
    fontWeight: 500,
    color: "#C9A961",
    lineHeight: 1.05,
    letterSpacing: "0.01em",
    margin: "0 0 0.8rem",
    overflowWrap: "break-word",
  },
  // Under the English title, quieter than it — the English one leads.
  // overflowWrap: Khmer script often has no spaces to break on, so a long
  // khmerTitle is effectively one unbreakable word without this.
  khmerTitle: {
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "1.35rem",
    fontWeight: 400,
    color: "#D9D2C5",
    margin: 0,
    overflowWrap: "break-word",
  },
  // The story's picture (stories.photo_url, the same one its home hero slide
  // shows). contain, so an illustration is never cropped; its bottom fades
  // into the backdrop, with the hero's cast shadow behind the figure.
  // Its box keeps the header's size; the scale only draws it bigger (a
  // transform takes up no extra room), growing up and out from its bottom
  // edge so it stays clear of the line and details table below.
  // The picture's slot: the same fixed size on every story, picture or not,
  // so every story's header is laid out alike — a story without one just
  // leaves the space empty.
  pictureSlot: {
    height: 460,
  },
  picture: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: "scale(1.35)",
    transformOrigin: "center bottom",
    WebkitMaskImage: "linear-gradient(to bottom, #000 75%, transparent 100%)",
    maskImage: "linear-gradient(to bottom, #000 75%, transparent 100%)",
    filter: "drop-shadow(-22px 28px 30px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.6))",
  },
  // First telling on the left, details table on the right.
  body: {
    display: "grid",
    alignItems: "start",
    gap: "4rem",
    paddingTop: "3rem",
  },
  // The summary as a pull quote: large italic old-print serif. Can show
  // summaryKhmer — the Fell font has no Khmer letters, so Khmer falls
  // through to the Khmer font.
  summary: {
    fontFamily: "var(--font-fell), var(--font-khmer), serif",
    fontStyle: "italic",
    fontSize: "clamp(1.4rem, 2vw, 1.75rem)",
    color: "#F5EFE6",
    fontWeight: 400,
    lineHeight: 1.45,
    maxWidth: 680,
    margin: "1.75rem 0 0",
    // Breaks a long unbroken run (or space-less Khmer) instead of letting it
    // run out of its column into the details table beside it.
    overflowWrap: "anywhere",
  },
  // The details table: one ruled row per detail, label left in small
  // spaced capitals, value right.
  details: {
    margin: 0,
  },
  detailRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: "1.5rem",
    padding: "0.95rem 0",
    borderBottom: "1px solid rgba(245, 239, 230, 0.1)",
  },
  detailLabel: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#A89F91",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  detailValue: {
    fontFamily: "var(--font-fell), var(--font-khmer), serif",
    fontSize: "1.1rem",
    color: "#F5EFE6",
    textAlign: "right",
    margin: 0,
    overflowWrap: "anywhere",
  },
  // Letter-spacing pries apart Khmer glyph clusters.
  trackingNone: {
    letterSpacing: "normal",
  },
};

export default function StoryDetails({ entry, children }) {
  const { language } = useLanguage();
  const t = useTranslation();
  // khmerTitle/title stack (both shown together) regardless of language.
  // The category and place are in the details table below. summary (story-
  // level), not description (StoryMemories.js's per-contributor telling),
  // swaps, falling back to English when untranslated.
  const summary = pickText(language, entry.summaryKhmer, entry.summary);
  const place = pickText(language, entry.placeKhmer, entry.place);
  // The kind in the chosen language (English when there's no Khmer one).
  const kind = pickText(language, entry.categoryKhmer, entry.category);
  const tracking = language === "km" ? styles.trackingNone : null;

  // Only the details this story has.
  const details = [
    ["detailsKind", kind],
    ["detailsFirstSharedBy", entry.contributor],
    ["detailsToldIn", place],
  ].filter(([, value]) => value);

  return (
    <section style={styles.section}>
      <div style={styles.backdrop} aria-hidden="true">
        <div style={styles.texture} />
        <div style={styles.splash} />
        {entry.khmerTitle ? <div style={styles.watermark}>{entry.khmerTitle}</div> : null}
      </div>

      <div style={styles.container}>
        <div style={styles.backButton}>
          <BackButton />
        </div>

        <div style={styles.header} className="details-header">
          <div>
            <h1 style={styles.title}>{entry.title}</h1>

            {entry.khmerTitle ? (
              <div style={styles.khmerTitle}>{entry.khmerTitle}</div>
            ) : null}

            {summary ? <p style={styles.summary}>“{summary}”</p> : null}
          </div>

          {/* Decorative here — the title says what it is. */}
          <div style={styles.pictureSlot} className={entry.storyPhotoUrl ? "details-picture-slot" : "details-picture-slot is-empty"}>
            {entry.storyPhotoUrl ? <img src={entry.storyPhotoUrl} alt="" style={styles.picture} /> : null}
          </div>
        </div>

        <div style={styles.body} className="details-body">
          <div>{children}</div>

          {details.length ? (
            <dl style={styles.details}>
              {details.map(([labelKey, value]) => (
                <div key={labelKey} style={styles.detailRow}>
                  <dt style={{ ...styles.detailLabel, ...tracking }}>{t(labelKey)}</dt>
                  <dd style={styles.detailValue}>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so this layout is correct from the first
          paint instead of only after hydration. */}
      <style>{`
        .details-header {
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
        }
        .details-body {
          grid-template-columns: minmax(0, 1fr) minmax(260px, 380px);
        }
        @media (max-width: 860px) {
          .details-header,
          .details-body {
            grid-template-columns: minmax(0, 1fr);
          }
          .details-body {
            gap: 2.5rem;
          }
          /* Stacked, an empty slot would just be a gap under the title. */
          .details-picture-slot.is-empty {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
