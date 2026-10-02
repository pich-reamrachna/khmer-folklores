"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ContributeForm from "./ContributeForm.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Overlay + dialog styling lives in the <style> block below, not inline —
// their layout changes at the phone breakpoint, and a media query can never
// override an inline style. Only the non-responsive close button stays inline.
const styles = {
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid #2A172F",
    backgroundColor: "#120916",
    color: "#C5A059",
    fontSize: "1.4rem",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default function ContributeModal({ storyId, storyTitle, storyTitleKhmer, onClose }) {
  const router = useRouter();
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector(FOCUSABLE);
    (first ?? dialog)?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Focus trap — keep Tab/Shift+Tab cycling inside the dialog.
      const nodes = dialog?.querySelectorAll(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [onClose]);

  // Close the modal and re-fetch the server-rendered tellings so the new one
  // shows (router.push to the same route wouldn't refresh them).
  const handleSuccess = () => {
    onClose();
    router.refresh();
  };

  return (
    <div
      className="contribute-overlay"
      onMouseDown={(e) => {
        // Only a click that starts and ends on the backdrop itself dismisses.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Share your telling of ${storyTitle}`}
        tabIndex={-1}
        className="contribute-dialog"
      >
        <button type="button" onClick={onClose} aria-label="Close" style={styles.closeBtn}>
          ×
        </button>
        <ContributeForm
          storyId={storyId}
          storyTitle={storyTitle}
          storyTitleKhmer={storyTitleKhmer}
          onSuccess={handleSuccess}
          embedded
        />
      </div>

      {/* Plain <style>, not inline — the phone breakpoint turns the centered
          card into a full-screen sheet, which an inline style can't express. */}
      <style>{`
        .contribute-overlay {
          position: fixed;
          inset: 0;
          /* Above the fixed NavBar (z-index 100). */
          z-index: 2000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
          box-sizing: border-box;
          background-color: rgba(8, 4, 10, 0.6);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
          /* The overlay scrolls if the dialog is taller than the viewport —
             the page behind stays locked (StoryPageShell freezes its main). */
          overflow-y: auto;
        }
        .contribute-dialog {
          position: relative;
          /* auto margins center it when it fits, yet let it scroll from the top
             when taller than the viewport — unlike align-items: center, which
             would clip the top. */
          margin: auto;
          width: 100%;
          max-width: 680px;
          background-color: #0c0a12;
          border: 1px solid #2a172f;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          outline: none;
        }
      `}</style>
    </div>
  );
}
