"use client";

import Link from "next/link";

// A small "back to the archive" link, meant to be reused on any sub-page
// that needs a way back to the browse view. A fixed href to "/" rather
// than router.back(), so it still works correctly if the page was opened
// directly (a shared link or bookmark) instead of navigated to.
// "use client" is required for the <style jsx> hover rule below.

const styles = {
  // color lives in the .back-button stylesheet rule below, not here — an
  // inline value would always beat the :hover stylesheet rule for the
  // same property, so hovering could never turn the text white.
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  // The PNG is recolored gold via mask-image (background-color shows
  // through wherever the image is opaque) rather than an <img>, same
  // technique as the search icon and scroll-cue icon — the source
  // asset's own color doesn't have to be gold for this to work.
  // background-color lives in the stylesheet below for the same
  // inline-vs-:hover reason as the link's color above.
  icon: {
    display: "inline-block",
    width: 24,
    height: 24,
    WebkitMaskImage: "url(/icons/icons8-back-button-48.png)",
    maskImage: "url(/icons/icons8-back-button-48.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  },
};

export default function BackButton() {
  return (
    <Link href="/" style={styles.link} className="back-button">
      <span style={styles.icon} className="back-button-icon" aria-hidden="true" />
      Go Back

      {/* :hover and Link's rendered <a> can't be scoped the normal
          styled-jsx way — Link is a custom component, not a plain DOM
          element, so the compiler can't auto-inject its scoping hash
          class onto the <a> it renders. :global() matches on the class
          name alone instead, same fix used for StoryHero's read-link. */}
      <style jsx>{`
        :global(.back-button) {
          color: #c5a059;
          transition: color 0.2s ease;
        }
        :global(.back-button:hover) {
          color: #ffffff;
        }
        :global(.back-button-icon) {
          background-color: #c5a059;
          transition: background-color 0.2s ease;
        }
        :global(.back-button:hover .back-button-icon) {
          background-color: #ffffff;
        }
      `}</style>
    </Link>
  );
}
