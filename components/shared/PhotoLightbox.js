"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "./uiText.js";

// A photo shown large over the dimmed page, the whole picture, as big as the
// screen allows (ZoomablePhoto.js opens it — on the story page and the
// review page). Closes with ×, Esc, or a click anywhere outside the photo.
//
// Rendered into <body> (a portal), so no ancestor's overflow or stacking can
// clip it. Those pages scroll their <main> (StoryPageShell), not the
// window, so that's what's frozen while it's open.

export default function PhotoLightbox({ src, alt, onClose }) {
  const t = useTranslation();
  const closeRef = useRef(null);

  useEffect(() => {
    const restoreFocus = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      // The close button is the only thing to focus: keep Tab on it.
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const main = document.querySelector("main");
    const previous = main?.style.overflowY;
    if (main) main.style.overflowY = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (main) main.style.overflowY = previous;
      restoreFocus?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt || undefined}
      onClick={(e) => {
        // Anywhere but the photo itself closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <img src={src} alt={alt} className="photo-lightbox-img" />
      <button ref={closeRef} type="button" onClick={onClose} aria-label={t("contributeClose")} className="photo-lightbox-close">
        ×
      </button>

      {/* Plain <style>: the close button's hover, and the image's size
          limits in viewport units, read best as CSS. */}
      <style>{`
        .photo-lightbox {
          position: fixed;
          inset: 0;
          /* Above the fixed NavBar (100) and the telling viewer (2000). */
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3.5rem 1.5rem;
          box-sizing: border-box;
          background-color: rgba(10, 9, 8, 0.92);
          cursor: zoom-out;
        }
        .photo-lightbox-img {
          display: block;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          cursor: default;
        }
        .photo-lightbox-close {
          position: fixed;
          top: 14px;
          right: 14px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          border: 1px solid rgba(201, 169, 97, 0.45);
          background-color: rgba(26, 24, 23, 0.85);
          color: #c5a059;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .photo-lightbox-close:hover {
          background-color: #c9a961;
          border-color: #c9a961;
          color: #1a1817;
        }
      `}</style>
    </div>,
    document.body
  );
}
