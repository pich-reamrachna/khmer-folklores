// Shared inline styles for the /review components (ReviewQueue, ReviewCard,
// ReviewSubmission, ReviewForm) — same idea as shared/authFormStyles.js.
// Colours and type match ContributeForm so the curator's side of the archive
// looks like the contributor's.
// overflowWrap "anywhere" on the submitted text (titles, meta, body): those
// are whatever the submitter typed, and a long unbroken run ("wwww…", a
// pasted URL) would otherwise spill out of the card — same fix as
// StoryMemories.js.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";

const reviewStyles = {
  card: {
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 16,
    padding: "1.5rem",
  },
  khmerTitle: {
    fontFamily: "var(--font-khmer), 'Kantumruy Pro', serif",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#D4AF37",
    margin: "0 0 0.2rem",
    overflowWrap: "anywhere",
  },
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.4rem",
    fontWeight: 600,
    color: "#F5EFE6",
    margin: 0,
    overflowWrap: "anywhere",
  },
  meta: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#8A7F91", margin: "0.4rem 0 0", overflowWrap: "anywhere" },
  body: {
    fontFamily: khmerSans,
    fontSize: "0.95rem",
    lineHeight: 1.7,
    color: "#BBAEBF",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: "1rem 0 0",
  },
  photo: { maxWidth: 220, maxHeight: 220, objectFit: "cover", borderRadius: 8, display: "block", marginTop: "1rem" },
  divider: { border: "none", borderTop: "1px solid #2A172F", margin: "1.5rem 0" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.1rem" },
  label: {
    fontFamily: khmerSans,
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#BBAEBF",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.7rem 0.9rem",
    backgroundColor: "#0C0A12",
    border: "1px solid #2A172F",
    borderRadius: 10,
    color: "#F5EFE6",
    fontFamily: khmerSans,
    fontSize: "0.95rem",
  },
  textarea: { minHeight: 90, resize: "vertical" },
  error: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#E0736A", margin: 0 },
  // Khmer's stacked glyph clusters shouldn't be pried apart by Latin letter-
  // spacing — spread this in on labels when the language is Khmer.
  trackingNone: { letterSpacing: "normal" },
};

export default reviewStyles;
