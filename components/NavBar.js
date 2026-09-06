import Link from "next/link";
import collection from "../collection.config.js";

// Text-only nav bar: site lockup on the left, page links on the right.
// No logo/icon — the archive's identity comes from collection.config.js.
// "Share a Memory" has no page yet, so it renders inert (a span, not a link).
// Fixed to the viewport (matches the mockup's .navbar) so it stays visible
// over both page sections, not just the hero.

const styles = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 90,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    backgroundColor: "transparent",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  // Inner wrapper: centered 1560px max-width, matching the mockup's
  // .nav-container. Side padding (2rem) lives here, not on `nav`.
  inner: {
    width: "100%",
    maxWidth: 1560,
    margin: "0 auto",
    padding: "0 2rem",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lockup: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
  },
  siteName: {
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
    fontSize: "1.55rem",
    fontWeight: 700,
    color: "#F5EFE6",
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  },
  kicker: {
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#C5A059",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginTop: 4,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "2.5rem",
  },
  linkActive: {
    textDecoration: "none",
    color: "#F5EFE6",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    padding: "0.5rem 0",
    borderBottom: "2px solid #C5A059",
  },
  linkInert: {
    color: "#BBAEBF",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    padding: "0.5rem 0",
    cursor: "default",
  },
};

export default function NavBar() {
  return (
    <nav style={styles.nav} aria-label="Primary">
      <div style={styles.inner}>
        <Link href="/" style={styles.lockup}>
          <span style={styles.siteName}>{collection.name}</span>
          <span style={styles.kicker}>A Khmer Folklore Archive</span>
        </Link>

        <div style={styles.links}>
          <Link href="/" style={styles.linkActive} aria-current="page">
            Browse the Archive
          </Link>
          <span style={styles.linkInert} aria-disabled="true">
            Share a Memory
          </span>
        </div>
      </div>
    </nav>
  );
}
