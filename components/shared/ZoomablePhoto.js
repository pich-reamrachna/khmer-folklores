"use client";

import { useCallback, useState } from "react";
import PhotoLightbox from "./PhotoLightbox.js";
import { useTranslation } from "./uiText.js";

// A photo that opens large (PhotoLightbox.js) when clicked — a first
// telling's photo on the story page, and every photo on the review page.
// The <img> keeps the style it's given; the button around it is unstyled
// apart from the zoom-in cursor, and spans the full width only when asked
// (fullWidth — for a photo that fills its column).

const styles = {
  button: {
    display: "block",
    padding: 0,
    margin: 0,
    border: "none",
    background: "none",
    cursor: "zoom-in",
    maxWidth: "100%",
    textAlign: "left",
  },
};

export default function ZoomablePhoto({ src, alt, style, fullWidth = false }) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  // Stable, so the lightbox's keyboard/focus effect doesn't re-run each render.
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("photoEnlarge")}
        style={fullWidth ? { ...styles.button, width: "100%" } : styles.button}
      >
        <img src={src} alt={alt} style={style} />
      </button>
      {open ? <PhotoLightbox src={src} alt={alt} onClose={close} /> : null}
    </>
  );
}
