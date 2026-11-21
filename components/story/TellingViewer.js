"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "../shared/uiText.js";

// An opened telling (StoryMemories.js), laid out like a social-media post
// viewer: the photo fills the left side, uncropped, and the telling — title,
// byline, full text — sits on the right, its text scrolling if it's long. A
// telling without a photo opens as the text column alone. On a phone the
// photo goes on top and the text underneath.
//
// Presentational: StoryMemories hands it the already-picked text (language),
// the photo's description and the byline it shows on the card, so both say
// the same thing. Closes with ×, Esc or a click on the backdrop.
//
// Rendered into <body> (a portal), so no ancestor's overflow or stacking can
// clip it. The story page scrolls its <main> (StoryPageShell), not the
// window, so that's what's frozen while it's open.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const styles = {
  // Same Khmer-aware stacks and colours as the telling cards.
  title: {
    fontFamily: "var(--font-cinzel), var(--font-khmer-serif), serif",
    fontSize: "1.6rem",
    fontWeight: 500,
    color: "#F5EFE6",
    lineHeight: "var(--khmer-leading, 1.3)",
    margin: 0,
    overflowWrap: "anywhere",
  },
  body: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "#D9D2C5",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: 0,
  },
  photo: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
};

export default function TellingViewer({ title, byline, description, photoUrl, photoAlt, onClose }) {
  const t = useTranslation();
  const dialogRef = useRef(null);
  const hasPhoto = !!photoUrl;

  // Focus the dialog, trap Tab inside it, close on Esc; give focus back to
  // the card that opened it afterwards. Same pattern as ContributeModal.js.
  useEffect(() => {
    const restoreFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector(FOCUSABLE)?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = dialog?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocus?.focus?.();
    };
  }, [onClose]);

  // Freeze the page's scroll container behind it.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const previous = main.style.overflowY;
    main.style.overflowY = "hidden";
    return () => {
      main.style.overflowY = previous;
    };
  }, []);

  return createPortal(
    <div
      className="telling-viewer-overlay"
      onMouseDown={(e) => {
        // Only a click that starts on the backdrop itself dismisses.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="telling-viewer-title"
        tabIndex={-1}
        className={hasPhoto ? "telling-viewer has-photo" : "telling-viewer"}
      >
        {hasPhoto ? (
          <div className="telling-viewer-photo">
            <img src={photoUrl} alt={photoAlt} style={styles.photo} />
          </div>
        ) : null}

        <div className="telling-viewer-text">
          <div className="telling-viewer-head">
            {/* A telling may have no title of its own; the byline (with the
                contributor's name) then names the dialog instead. */}
            {title ? (
              <h2 id="telling-viewer-title" style={styles.title}>
                {title}
              </h2>
            ) : null}
            <div id={title ? undefined : "telling-viewer-title"}>{byline}</div>
          </div>
          <div className="telling-viewer-body">
            <p style={styles.body}>{description}</p>
          </div>
        </div>

        <button type="button" onClick={onClose} aria-label={t("contributeClose")} className="telling-viewer-close">
          ×
        </button>
      </div>

      {/* Plain <style>, not inline: the layout switches at the phone
          breakpoint, which an inline style can't express. */}
      <style>{`
        .telling-viewer-overlay {
          position: fixed;
          inset: 0;
          /* Above the fixed NavBar (z-index 100). */
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          box-sizing: border-box;
          background-color: rgba(10, 9, 8, 0.8);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
        }
        .telling-viewer {
          position: relative;
          display: flex;
          width: 100%;
          max-width: 640px;
          max-height: 100%;
          background-color: #1a1817;
          border: 1px solid rgba(201, 169, 97, 0.25);
          border-radius: 4px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          outline: none;
        }
        /* With a photo: photo on the left (the larger share), telling on the
           right, at a fixed height so a tall photo or long text doesn't make
           the window jump in size. */
        .telling-viewer.has-photo {
          max-width: 1180px;
          height: min(780px, 100%);
        }
        .telling-viewer-photo {
          flex: 1 1 60%;
          min-width: 0;
          background-color: #0d0c0b;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .telling-viewer-text {
          flex: 1 1 40%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(201, 169, 97, 0.15);
        }
        .telling-viewer:not(.has-photo) .telling-viewer-text {
          border-left: none;
        }
        .telling-viewer.has-photo .telling-viewer-text {
          max-width: 440px;
        }
        .telling-viewer-head {
          /* Room on the right for the close button. */
          padding: 1.75rem 3.75rem 1.25rem 1.75rem;
          border-bottom: 1px solid rgba(245, 239, 230, 0.1);
        }
        .telling-viewer-body {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 1.25rem 1.75rem 2rem;
        }
        .telling-viewer-close {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 1;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          line-height: 1;
          cursor: pointer;
          border: 1px solid rgba(201, 169, 97, 0.45);
          background-color: rgba(26, 24, 23, 0.85);
          color: #c5a059;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .telling-viewer-close:hover {
          background-color: #c9a961;
          border-color: #c9a961;
          color: #1a1817;
        }
        /* Phone: one column that scrolls as a whole, photo on top. */
        @media (max-width: 760px) {
          .telling-viewer-overlay {
            padding: 0;
          }
          .telling-viewer,
          .telling-viewer.has-photo {
            flex-direction: column;
            max-width: none;
            height: 100%;
            border: none;
            border-radius: 0;
            overflow-y: auto;
          }
          .telling-viewer-photo {
            flex: 0 0 auto;
            height: 50vh;
          }
          .telling-viewer-text,
          .telling-viewer.has-photo .telling-viewer-text {
            flex: 0 0 auto;
            max-width: none;
            border-left: none;
          }
          .telling-viewer-body {
            overflow-y: visible;
          }
          /* The whole sheet scrolls here, so pin × to the screen's corner
             — it would otherwise scroll away with a long telling. */
          .telling-viewer-close {
            position: fixed;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
