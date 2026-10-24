// Shared look for the cards on /my-entries: your stories (SubmissionCard.js)
// and your tellings (TellingCard.js) — same card, title, status badge and
// note, so both sections read as one list.

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";

const entryCardStyles = {
  card: { backgroundColor: "#120916", border: "1px solid #2A172F", borderRadius: 16, padding: "1.2rem 1.4rem" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  khmerTitle: { fontFamily: "var(--font-khmer), serif", fontSize: "0.9rem", fontWeight: 600, color: "#D4AF37", margin: "0 0 0.2rem" },
  // overflowWrap: the title is whatever the submitter typed.
  title: { fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 600, color: "#F5EFE6", margin: 0, overflowWrap: "anywhere" },
  meta: { fontFamily: khmerSans, fontSize: "0.8rem", color: "#8A7F91", margin: "0.35rem 0 0" },
  badge: { fontFamily: khmerSans, fontSize: "0.75rem", fontWeight: 700, border: "1px solid", borderRadius: 999, padding: "0.2rem 0.7rem", whiteSpace: "nowrap" },
  note: { fontFamily: khmerSans, fontSize: "0.9rem", lineHeight: 1.6, color: "#BBAEBF", margin: "1rem 0 0", padding: "0.8rem 1rem", borderLeft: "2px solid #E0736A", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  noteLabel: { display: "block", fontWeight: 700, color: "#E0736A", marginBottom: "0.25rem" },
  hint: { fontFamily: khmerSans, fontSize: "0.85rem", color: "#8A7F91", margin: "0.8rem 0 0" },
  link: { display: "inline-block", marginTop: "0.8rem", fontFamily: khmerSans, fontSize: "0.85rem", fontWeight: 700, color: "#C5A059", textDecoration: "none" },
};

export default entryCardStyles;
