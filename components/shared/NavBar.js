"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import collection from "../../collection.config.js";
import { useLanguage } from "./LanguageContext.js";

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
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
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
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
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
  // display/gap for the links row live in app/globals.css's .nav-links
  // rule, not here — needed for the phone media query and fluid tablet
  // gap, and a plain stylesheet avoids the hydration-gap flash a <style
  // jsx> block here would have (see globals.css).
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
  // Mobile menu toggle — hamburger/close icons recolored gold via
  // mask-image, same technique as every other icon in this project.
  // display lives in the .nav-toggle rule in app/globals.css (hidden by
  // default, shown only ≤640px) for the same inline-vs-media-query
  // reason as the links row above.
  toggleButton: {
    background: "transparent",
    border: "none",
    padding: "0.5rem",
    margin: "-0.5rem",
    cursor: "pointer",
  },
  toggleIcon: {
    display: "block",
    width: 22,
    height: 22,
    backgroundColor: "#C5A059",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  },
  // Dropdown panel for the mobile menu. Absolutely positioned so it never
  // adds to `nav`'s own height — StoryHero/ArchiveBrowser/StoryDetails all
  // assume a fixed 90px NavBar for their top padding. display/opacity/
  // transform (open/close animation, plus a >=641px safety hide) live in
  // app/globals.css.
  mobilePanel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    flexDirection: "column",
    gap: "1.25rem",
    padding: "1.25rem 2rem 1.5rem",
    boxSizing: "border-box",
    backgroundColor: "rgba(10, 6, 12, 0.98)",
    borderBottom: "1px solid #2A172F",
  },
  langSwitcher: {
    position: "relative",
  },
  langPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    // Fixed width, not padding-driven — "EN" and "ខ្មែរ" render at
    // different widths, and without this the pill (and the mobile
    // toggle after it) would nudge sideways on every switch.
    width: 70,
    padding: "0.45rem 0",
    border: "1px solid #2A172F",
    borderRadius: 999,
    backgroundColor: "transparent",
    color: "#E6C575",
    // Khmer first, not "inherit" — this label alternates between "EN"
    // and "ខ្មែរ", and --font-khmer has no Latin glyphs (subsets:
    // ["khmer"] in layout.js), so "EN" still falls through to
    // --font-jakarta automatically without any conditional logic.
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  // Recolored via mask-image, same technique as every other icon in this
  // project (BackButton.js, StoryHero.js's scroll cue). Rotates 180deg
  // open, same base+open merge pattern as langDropdown below.
  langPillIcon: {
    display: "inline-block",
    width: 10,
    height: 10,
    backgroundColor: "#E6C575",
    WebkitMaskImage: "url(/icons/arrow-down-sign-to-navigate.png)",
    maskImage: "url(/icons/arrow-down-sign-to-navigate.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    transition: "transform 0.2s ease",
  },
  langPillIconOpen: {
    transform: "rotate(180deg)",
  },
  // Closed by default: lifted, invisible, and inert — opacity/transform
  // (not display) drive the open/close so they can transition, same
  // pattern as nav/navScrolled above.
  langDropdown: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    minWidth: 168,
    // Solid, not translucent — this floats over whatever page content
    // sits beneath the nav, so a see-through background let that content
    // show through it.
    backgroundColor: "#0A060C",
    border: "1px solid #2A172F",
    borderRadius: 14,
    padding: 6,
    boxSizing: "border-box",
    opacity: 0,
    transform: "translateY(-6px)",
    pointerEvents: "none",
    transition: "opacity 160ms ease, transform 160ms ease",
  },
  langDropdownOpen: {
    opacity: 1,
    transform: "translateY(0)",
    pointerEvents: "auto",
  },
  // backgroundColor (not the background shorthand) since langOptionSelected
  // below overrides only that — same shorthand/longhand reasoning as
  // mobileLangChip.
  langOption: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 9,
    padding: "0.6rem 0.7rem",
    color: "#F5EFE6",
    // Khmer first — same reasoning as langPill above (one option reads
    // "English", the other "ខ្មែរ").
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  // Golden background instead of a checkmark to mark the selected option.
  langOptionSelected: {
    backgroundColor: "#3A2C12",
    color: "#E6C575",
  },
  mobileLangRow: {
    display: "flex",
    gap: "0.6rem",
    paddingTop: "0.5rem",
    borderTop: "1px solid #2A172F",
  },
  // borderWidth/Style/Color kept separate, not the border shorthand — the
  // selected variant below overrides only borderColor, and mixing a
  // shorthand base with a longhand override triggers a React warning
  // (same issue already hit once in EntryCard.js).
  mobileLangChip: {
    flex: 1,
    textAlign: "center",
    padding: "0.55rem",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#2A172F",
    backgroundColor: "transparent",
    color: "#BBAEBF",
    // Khmer first — same reasoning as langPill above.
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  mobileLangChipSelected: {
    borderColor: "#C5A059",
    color: "#E6C575",
    backgroundColor: "#1D1024",
  },
};

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const langSwitcherRef = useRef(null);

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

  useEffect(() => {
    if (!langMenuOpen) return;
    const handleClickOutside = (event) => {
      if (langSwitcherRef.current && !langSwitcherRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langMenuOpen]);

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : null) }} aria-label="Primary">
      <div style={styles.inner}>
        <Link href="/" style={styles.lockup}>
          <span style={styles.siteName}>{collection.name}</span>
          <span style={styles.kicker}>A Khmer Folklore Archive</span>
        </Link>

        <div className="nav-links">
          <Link href="/" style={styles.linkActive} aria-current="page">
            Browse the Archive
          </Link>
          <span style={styles.linkInert} aria-disabled="true">
            Share a Memory
          </span>

          <div style={styles.langSwitcher} ref={langSwitcherRef}>
            <button
              type="button"
              style={styles.langPill}
              onClick={() => setLangMenuOpen((open) => !open)}
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
              aria-label="Change language"
            >
              {language === "km" ? "ខ្មែរ" : "EN"}
              <span
                aria-hidden="true"
                style={{ ...styles.langPillIcon, ...(langMenuOpen ? styles.langPillIconOpen : null) }}
              />
            </button>

            <div
              style={{ ...styles.langDropdown, ...(langMenuOpen ? styles.langDropdownOpen : null) }}
              role="listbox"
              aria-hidden={!langMenuOpen}
            >
              <button
                type="button"
                style={{ ...styles.langOption, ...(language === "en" ? styles.langOptionSelected : null) }}
                role="option"
                aria-selected={language === "en"}
                onClick={() => {
                  setLanguage("en");
                  setLangMenuOpen(false);
                }}
              >
                English
              </button>
              <button
                type="button"
                style={{ ...styles.langOption, ...(language === "km" ? styles.langOptionSelected : null) }}
                role="option"
                aria-selected={language === "km"}
                onClick={() => {
                  setLanguage("km");
                  setLangMenuOpen(false);
                }}
              >
                ខ្មែរ
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="nav-toggle"
          style={styles.toggleButton}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            style={{
              ...styles.toggleIcon,
              WebkitMaskImage: `url(/icons/${menuOpen ? "close" : "menus"}.png)`,
              maskImage: `url(/icons/${menuOpen ? "close" : "menus"}.png)`,
            }}
          />
        </button>
      </div>

      <div
        style={styles.mobilePanel}
        className={`nav-mobile-panel${menuOpen ? " nav-mobile-panel-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <Link
          href="/"
          style={styles.linkActive}
          aria-current="page"
          onClick={() => setMenuOpen(false)}
        >
          Browse the Archive
        </Link>
        <span style={styles.linkInert} aria-disabled="true">
          Share a Memory
        </span>

        <div style={styles.mobileLangRow}>
          <button
            type="button"
            style={{ ...styles.mobileLangChip, ...(language === "en" ? styles.mobileLangChipSelected : null) }}
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            type="button"
            style={{ ...styles.mobileLangChip, ...(language === "km" ? styles.mobileLangChipSelected : null) }}
            aria-pressed={language === "km"}
            onClick={() => setLanguage("km")}
          >
            ខ្មែរ
          </button>
        </div>
      </div>
    </nav>
  );
}
