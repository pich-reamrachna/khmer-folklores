"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import collection from "../../collection.config.js";

// Text-only nav bar: site lockup on the left, page links on the right.
// No logo/icon — the archive's identity comes from collection.config.js.
// "Share a Memory" has no page yet, so it renders inert (a span, not a link).
// Fixed to the viewport (matches the mockup's .navbar) so it stays visible
// over both page sections. Once the page is scrolled past the top of the
// hero, it picks up a translucent blurred background (mockup's
// .navbar.scrolled), matching content instead of floating over it.

const SCROLL_THRESHOLD = 40;

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
    borderBottom: "1px solid transparent",
    transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  navScrolled: {
    backgroundColor: "rgba(10, 6, 12, 0.95)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid #2A172F",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // The page scrolls inside <main>, not the window, and scroll events
    // don't bubble — a capture-phase listener on document still catches
    // them, with event.target being the actual scrolling element.
    const onScroll = (event) => {
      const top = event.target?.scrollTop ?? 0;
      setScrolled(top > SCROLL_THRESHOLD);
    };
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : null) }} aria-label="Primary">
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
