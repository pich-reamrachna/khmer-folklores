// Inline styles for ShareSearch.js (the /share search page), kept in their
// own file so the component stays short — same idea as
// components/review/reviewStyles.js.

const shareSearchStyles = {
  // Top padding grows with the screen (never under 130px, which clears the
  // fixed NavBar), so the heading + search sit around the middle of the
  // screen. Not true vertical centring on purpose: results appear below the
  // search bar, and a centred block would jump upward as they arrive.
  //
  // Misty ink-wash mountains on old paper, with dark ink text — the same
  // parchment as the home page's "Find a story" section (ArchiveBrowser.js).
  // The plain paper colour shows until the picture loads.
  // position: relative anchors the golden waves layer (`waves` below).
  section: {
    position: "relative",
    backgroundColor: "#D8D3CA",
    backgroundImage: "url(/mist-inkwash.webp)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    padding: "max(130px, 24vh) 2rem 4rem",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#24201B",
  },
  // The golden waves (golden-waves.webp), along the bottom of the page over
  // the paper and behind the content, in a slightly deepened gold (the
  // filter darkens it a touch and keeps its colour rich). Set 7vw below the
  // bottom edge, so they sit lower — mostly under the search results, the
  // bottom of the picture running off the page. Otherwise shown whole — the page's full width at its own proportions,
  // sitting on the bottom edge — so its top lines are never cropped. Its own
  // layer so it can be faded. aria-hidden and pointerEvents: none: purely
  // decorative, never in the way.
  waves: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url(/golden-waves.webp)",
    backgroundSize: "100% auto",
    backgroundPosition: "center bottom -7vw",
    backgroundRepeat: "no-repeat",
    filter: "brightness(0.75) saturate(1.2)",
    opacity: 0.65,
    pointerEvents: "none",
  },
  // position/zIndex: above the waves layer.
  container: { position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" },
  // Deliberately not translated — decorative label, like the site's other
  // eyebrows.
  eyebrow: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7A5C2E",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: "0 0 1rem",
    textAlign: "center",
  },
  // Cinzel first: the Khmer font also draws Latin letters, so listed first
  // it would win for English too; Khmer still falls through to it.
  title: {
    fontFamily: "var(--font-cinzel), var(--font-khmer), serif, 'Times New Roman'",
    fontSize: "clamp(2rem, 3.6vw, 3rem)",
    fontWeight: 500,
    color: "#24201B",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    lineHeight: 1.1,
    margin: "0 0 1.2rem",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.1rem",
    fontWeight: 400,
    lineHeight: 1.6,
    color: "#4A4339",
    maxWidth: 620,
    margin: "0 auto 2rem",
    textAlign: "center",
  },
  // The parchment search bar (ArchiveSearch `light`) fills this width.
  searchWrap: { display: "flex", maxWidth: 680, margin: "0 auto" },
  // Headings/messages under the search are centred; the result cards keep
  // their text left-aligned for readability.
  results: { marginTop: "2rem" },
  centred: { textAlign: "center" },
  // An italic old-print note, like the archive's story count.
  resultsHeading: {
    fontFamily: "var(--font-fell), var(--font-khmer), serif",
    fontSize: "1.05rem",
    fontStyle: "italic",
    color: "#5A5248",
    margin: "0 0 1rem",
    textAlign: "center",
  },
  // Matches sit edge to edge as ruled rows (StoryMatchCard.js), with a rule
  // above the first one too.
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid rgba(60, 50, 40, 0.25)",
  },
};

export default shareSearchStyles;
