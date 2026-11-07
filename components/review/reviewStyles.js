// Shared inline styles for the /review components (ReviewQueue, ReviewCard,
// ReviewSubmission, ReviewForm, TellingReviewCard, TellingDecision,
// EditReviewCard) — same idea as shared/authFormStyles.js.
//
// Each item is a two-column card: what was submitted on the left, to read,
// and the curator's form on the right on a slightly darker panel — small
// spaced-capital labels, underline / boxed fields and square buttons, like
// the site's other forms (ContributeForm.js), in the site's type: Cinzel
// titles, the body font for text. The columns stack on a narrow screen
// (app/globals.css's .review-card rule — a media query can't be inline).
// overflowWrap "anywhere" on the submitted text (titles, meta, body): those
// are whatever the submitter typed, and a long unbroken run ("wwww…", a
// pasted URL) would otherwise spill out of the card.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
// Cinzel has no Khmer letters, so a Khmer title falls through.
const cinzel = "var(--font-cinzel), var(--font-khmer), serif";

const reviewStyles = {
  // The card: a hairline box; its two columns come from .review-card.
  card: {
    border: "1px solid rgba(245, 239, 230, 0.1)",
    backgroundColor: "rgba(26, 24, 23, 0.6)",
  },
  // Left: the submission.
  read: { padding: "2rem 2.25rem", minWidth: 0 },
  // Right: the curator's form, on a darker panel.
  decide: {
    padding: "2rem 2.25rem",
    minWidth: 0,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    borderLeft: "1px solid rgba(245, 239, 230, 0.08)",
  },
  // Small spaced capitals above the title (kind of item · category · date).
  kicker: {
    fontFamily: khmerSans,
    fontSize: "0.66rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#A89F91",
    margin: "0 0 0.9rem",
    overflowWrap: "anywhere",
  },
  title: {
    fontFamily: cinzel,
    fontSize: "clamp(1.5rem, 2.4vw, 1.9rem)",
    fontWeight: 500,
    lineHeight: 1.2,
    color: "#F5EFE6",
    margin: 0,
    overflowWrap: "anywhere",
  },
  khmerTitle: {
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "0.95rem",
    color: "#A89F91",
    margin: "0.35rem 0 0",
    overflowWrap: "anywhere",
  },
  meta: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#A89F91", margin: "0.9rem 0 0", overflowWrap: "anywhere" },
  // A name in the meta line.
  metaName: { color: "#F5EFE6" },
  // A small spaced-capital heading inside the left column ("Their telling").
  subhead: {
    fontFamily: khmerSans,
    fontSize: "0.66rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#C9A961",
    margin: "1.6rem 0 0.5rem",
  },
  // The telling's own title.
  tellingTitle: {
    fontFamily: cinzel,
    fontSize: "1.15rem",
    fontWeight: 500,
    color: "#F5EFE6",
    margin: "0 0 0.6rem",
    overflowWrap: "anywhere",
  },
  body: {
    fontFamily: khmerSans,
    fontSize: "0.95rem",
    lineHeight: 1.75,
    color: "#D9D2C5",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: 0,
  },
  photo: { maxWidth: 220, maxHeight: 220, objectFit: "cover", borderRadius: 2, display: "block", marginTop: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.4rem" },
  label: {
    fontFamily: khmerSans,
    fontSize: "0.66rem",
    fontWeight: 700,
    color: "#A89F91",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  // Underline-only, like the site's other forms. colorScheme: dark, so the
  // category <select>'s native option list is dark too.
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.45rem 0 0.5rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(245, 239, 230, 0.22)",
    borderRadius: 0,
    color: "#F5EFE6",
    fontFamily: khmerSans,
    fontSize: "1rem",
    outline: "none",
    colorScheme: "dark",
  },
  // Multi-line fields keep a faint box (a bare underline under a tall box
  // reads oddly) — spread in after `input`.
  textarea: {
    marginTop: "0.2rem",
    minHeight: 96,
    padding: "0.7rem 0.8rem",
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    border: "1px solid rgba(245, 239, 230, 0.14)",
    borderRadius: 2,
    lineHeight: 1.6,
    resize: "vertical",
  },
  error: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#E58B8B", margin: 0 },
  // Khmer's stacked glyph clusters shouldn't be pried apart by Latin letter-
  // spacing — spread this in on labels when the language is Khmer.
  trackingNone: { letterSpacing: "normal" },
};

export default reviewStyles;
