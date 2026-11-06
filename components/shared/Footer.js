"use client";

import { useEffect, useState } from "react";
import collection from "../../collection.config.js";
import { pickText, useLanguage } from "./LanguageContext.js";
import { useTranslation } from "./uiText.js";

// The archive's trailing footer — name, description, curator and source —
// plus a round "back to top" button fixed to the bottom-right corner of the
// screen. Reused on both the home page and each story page; the caller owns
// the scroll container and passes down what "back to top" means for it.
// "use client" is required for the button's onClick and its show/hide.
//
// Warm charcoal, like the home hero, with the course line under a faint
// rule. The button's look (and hover/visible states) lives in
// app/globals.css's .scroll-top-btn rule — a media query and hover need it
// out of inline styles.

// How far the page must be scrolled (px) before the button appears.
const SHOW_AFTER = 400;

const styles = {
  footer: {
    backgroundColor: "#1A1817",
    padding: "48px 0 28px",
    color: "#E8E2D6",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    boxSizing: "border-box",
  },
  // Same box as NavBar.js's inner wrapper — up to 1800px wide including
  // its 2rem side padding — so the footer's edges line up with the bar's
  // at every screen width.
  inner: {
    maxWidth: 1800,
    margin: "0 auto",
    width: "100%",
    padding: "0 2rem",
    boxSizing: "border-box",
  },
  // Three columns across the full width — name + tagline, description,
  // curator + source — so the footer doesn't sit in one narrow stack with
  // empty space beside it. grid-template-columns becomes one column ≤860px
  // via the plain <style> tag below (a media query can't beat inline).
  topRow: {
    display: "grid",
    alignItems: "start",
    gap: "2.5rem 4rem",
  },
  siteName: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.9rem",
    fontWeight: 500,
    color: "#F5EFE6",
    lineHeight: 1.15,
    margin: 0,
  },
  // kicker: deliberately not translated, matching NavBar's lockup — the
  // site name + tagline reads as one fixed brand unit in both places.
  kicker: {
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#A89F91",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    margin: "6px 0 0",
  },
  // fontFamily on description/creditLine: still translated, so still
  // need var(--font-khmer) explicitly instead of inheriting `footer`'s
  // Latin-only stack.
  description: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.9rem",
    color: "#E8E2D6",
    lineHeight: 1.9,
    margin: 0,
    maxWidth: 520,
  },
  creditLine: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.85rem",
    color: "#9C9488",
    lineHeight: 1.8,
    margin: 0,
    maxWidth: 380,
  },
  // The curator's name, picked out from the rest of the credit line.
  curator: {
    color: "#F5EFE6",
    fontWeight: 600,
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(245, 239, 230, 0.08)",
    margin: "36px 0 22px",
  },
  // Translated ("Built in ICT 340…" line) — needs var(--font-khmer).
  bottomText: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.8rem",
    color: "#8C8478",
    margin: 0,
  },
  // The site's chevron icon, turned to point up, recoloured via mask-image
  // like every other icon here. Its colour lives in .scroll-top-btn-icon
  // (globals.css), which changes on hover.
  scrollTopIcon: {
    display: "block",
    width: 16,
    height: 16,
    transform: "rotate(180deg)",
    WebkitMaskImage: "url(/icons/arrow-down-sign-to-navigate.png)",
    maskImage: "url(/icons/arrow-down-sign-to-navigate.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  },
};

export default function Footer({ onBackToTop }) {
  const { language } = useLanguage();
  const t = useTranslation();
  // collection.config.js's own content (not app UI copy) — same
  // pickText fallback rule as entry data. curator (a name) never
  // translates, same as a story's contributor.
  const description = pickText(language, collection.descriptionKhmer, collection.description);
  const source = pickText(language, collection.sourceKhmer, collection.source);

  // Show the button only once the page is scrolled down. The page scrolls
  // inside <main> (not the window), and scroll events don't bubble, so a
  // capture-phase listener on document catches them — only <main>'s count,
  // not a list that scrolls on its own (same rule as NavBar.js).
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = (event) => {
      if (!(event.target instanceof Element) || event.target.tagName !== "MAIN") return;
      setShowTop(event.target.scrollTop > SHOW_AFTER);
    };
    document.addEventListener("scroll", onScroll, true);
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);

  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.topRow} className="footer-top-row">
          <div>
            <p style={styles.siteName}>{collection.name}</p>
            <p style={styles.kicker}>A Khmer Folklore Archive</p>
          </div>
          <p style={styles.description}>{description}</p>
          <p style={styles.creditLine} className="footer-credit">
            {t("footerCreditLine")} <span style={styles.curator}>{collection.curator}</span> ·{" "}
            {t("footerSourceLine")} {source}
          </p>
        </div>

        <hr style={styles.divider} />

        <p style={styles.bottomText} className="footer-bottom">{t("footerBuiltIn")}</p>
      </div>

      {/* Fixed to the screen's bottom-right corner, not the footer. Hidden
          (and unfocusable) until the page is scrolled down. */}
      <button
        type="button"
        className={showTop ? "scroll-top-btn is-visible" : "scroll-top-btn"}
        onClick={onBackToTop}
        aria-label={t("footerBackToTop")}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
      >
        <span style={styles.scrollTopIcon} className="scroll-top-btn-icon" aria-hidden="true" />
      </button>

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so this layout is right from the first
          paint instead of only after hydration. The credit sits at the
          right edge on wide screens; everything stacks on narrow ones. */}
      <style>{`
        .footer-top-row {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr);
        }
        .footer-credit {
          justify-self: end;
        }
        @media (max-width: 860px) {
          .footer-top-row {
            grid-template-columns: minmax(0, 1fr);
          }
          .footer-credit {
            justify-self: start;
          }
          /* Room under the last line for the floating back-to-top button,
             which would otherwise sit on top of it here. */
          .footer-bottom {
            padding-bottom: 64px;
          }
        }
      `}</style>
    </footer>
  );
}
