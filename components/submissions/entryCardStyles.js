// Shared look for the rows on /my-entries: your stories (SubmissionCard.js)
// and your tellings (TellingCard.js) — same row, title, status badge and
// note, so both tabs read as one list.
//
// Each entry is a ruled row rather than a boxed card: small details on top,
// the title in the chosen language — Cinzel for English (as on the story
// pages' tellings), the Khmer font at the same size for Khmer — and its
// status on the right. A row the curator sent back (a story
// not accepted, a telling returned) carries a red rule down its left side,
// with the curator's note in a dark panel.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
// Cinzel for titles; Khmer (which it has no letters for) falls through to
// the Khmer font.
const cinzel = "var(--font-cinzel), var(--font-khmer), serif";

const entryCardStyles = {
  card: {
    padding: "1.75rem 0 1.85rem 1.25rem",
    borderBottom: "1px solid rgba(245, 239, 230, 0.08)",
  },
  // Added to `card` for a story not accepted / a telling returned.
  cardFlagged: {
    borderLeft: "1px solid rgba(224, 115, 106, 0.7)",
  },
  top: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" },
  // The date, above the title.
  meta: { fontFamily: khmerSans, fontSize: "0.78rem", color: "#A89F91", margin: "0 0 0.55rem", overflowWrap: "anywhere" },
  // overflowWrap: the title is whatever the submitter typed.
  title: { fontFamily: cinzel, fontSize: "1.3rem", fontWeight: 500, lineHeight: 1.25, color: "#F5EFE6", margin: 0, overflowWrap: "anywhere" },
  // A telling's own title, under the story's (TellingCard.js). Whatever
  // the sharer typed, English or Khmer.
  subtitle: { fontFamily: khmerSans, fontSize: "0.95rem", color: "#D9D2C5", margin: "0.4rem 0 0", overflowWrap: "anywhere" },
  // The status, as plain coloured small spaced capitals — no box, so it reads
  // as information rather than something to click. color comes from the
  // status.
  badge: {
    display: "inline-flex",
    alignItems: "center",
    paddingTop: "0.15rem",
    fontFamily: khmerSans,
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  // The curator's note: a dark panel, its label in small spaced capitals.
  note: {
    fontFamily: khmerSans,
    fontSize: "0.92rem",
    lineHeight: 1.6,
    color: "#D9D2C5",
    margin: "1.1rem 0 0",
    padding: "0.9rem 1.1rem",
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    border: "1px solid rgba(245, 239, 230, 0.06)",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  noteLabel: {
    display: "block",
    fontFamily: khmerSans,
    fontSize: "0.66rem",
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#C9A961",
    marginBottom: "0.4rem",
  },
  // "The curator will read it…" under a waiting entry.
  hint: { fontFamily: khmerSans, fontSize: "0.88rem", color: "#A89F91", margin: "0.9rem 0 0" },
  // The row's "View story" link (left) and Edit button (bottom right).
  actions: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" },
  // Pushes the Edit button to the right end of `actions`, with or without
  // a link before it.
  editSlot: { marginLeft: "auto" },
  link: {
    display: "inline-block",
    marginTop: "1.1rem",
    fontFamily: khmerSans,
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#C9A961",
    textDecoration: "none",
  },
  // Letter-spacing pries apart Khmer glyph clusters — spread this in after
  // the badge/link/label styles when the text is Khmer.
  trackingNone: { letterSpacing: "normal" },
};

export default entryCardStyles;
