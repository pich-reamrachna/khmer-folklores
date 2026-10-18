// Inline styles for ShareSearch.js (the /share search page), kept in their
// own file so the component stays short — same idea as
// components/review/reviewStyles.js.

const shareSearchStyles = {
  // Top padding grows with the screen (never under 130px, which clears the
  // fixed NavBar), so the heading + search sit around the middle of the
  // screen. Not true vertical centring on purpose: results appear below the
  // search bar, and a centred block would jump upward as they arrive.
  section: {
    backgroundColor: "#0D0812",
    minHeight: "100vh",
    padding: "max(130px, 24vh) 2rem 4rem",
    boxSizing: "border-box",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: { maxWidth: 760, margin: "0 auto" },
  // Deliberately not translated — decorative label, like the site's other
  // eyebrows.
  eyebrow: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: "0 0 1rem",
    textAlign: "center",
  },
  title: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "2.5rem",
    fontWeight: 600,
    lineHeight: 1.15,
    margin: "0 0 1rem",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.05rem",
    fontWeight: 300,
    lineHeight: 1.6,
    color: "#BBAEBF",
    maxWidth: 620,
    margin: "0 auto 2rem",
    textAlign: "center",
  },
  // Centres the search pill (its own max-width is 520px + padding, set in
  // globals.css .archive-search-bar).
  searchWrap: { maxWidth: 568, margin: "0 auto" },
  // Headings/messages under the search are centred; the result cards keep
  // their text left-aligned for readability.
  results: { marginTop: "2rem" },
  centred: { textAlign: "center" },
  resultsHeading: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#8A7F91",
    margin: "0 0 1rem",
    textAlign: "center",
  },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 },
};

export default shareSearchStyles;
