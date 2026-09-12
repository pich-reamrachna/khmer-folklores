import Link from "next/link";

// A small "back to the archive" link, meant to be reused on any sub-page
// that needs a way back to the browse view. A fixed href to "/" rather
// than router.back(), so it still works correctly if the page was opened
// directly (a shared link or bookmark) instead of navigated to.

const styles = {
  // color lives in app/globals.css's .back-button rule, not here — a
  // <style jsx> block here would leave a real hydration-gap flash
  // (link-blue/visited-purple text, invisible icon) on every refresh.
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
  },
  // Recolored via mask-image, same technique as the other icons in this
  // app. background-color lives in globals.css, same reason as above.
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
    </Link>
  );
}
