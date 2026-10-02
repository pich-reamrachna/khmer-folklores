"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "../shared/Footer.js";
import ContributeModal from "../contribute/ContributeModal.js";
import { ContributeModalContext } from "../contribute/contributeModalContext.js";

// <main> wrapper for a story's dedicated page — ends on the same reusable
// Footer as the home page, with a working "back to top" button. Scrolls
// freely; no scroll-snapping on this page.
// "use client" is required for the ref/back-to-top handler.
//
// Also owns the contribute modal: this <main> (not the window/body) is the
// page's scroll container, so freezing the background while the modal is open
// means locking this element's overflow. The trigger button lives deep in
// `children`, so the opener is handed down via ContributeModalContext.

export default function StoryPageShell({ children }) {
  const mainRef = useRef(null);
  // null when closed; { storyId, storyTitle } when open.
  const [modal, setModal] = useState(null);

  const open = (storyId, storyTitle, storyTitleKhmer) =>
    setModal({ storyId, storyTitle, storyTitleKhmer });
  const close = () => setModal(null);

  // Freeze the scroll container (this <main>, not body) while the modal is open.
  useEffect(() => {
    const el = mainRef.current;
    if (!el || !modal) return;
    const previous = el.style.overflowY;
    el.style.overflowY = "hidden";
    return () => {
      el.style.overflowY = previous;
    };
  }, [modal]);

  return (
    <ContributeModalContext.Provider value={{ open }}>
      <main
        ref={mainRef}
        style={{
          backgroundColor: "#0C0A12",
          height: "100vh",
          overflowY: "auto",
          scrollBehavior: "smooth",
        }}
      >
        {/* page-fade-in lives on this wrapper, not <main> itself — see
            app/page.js for why (main's own background must stay solid). */}
        <div className="page-fade-in">
          {children}

          <Footer
            onBackToTop={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </div>
      </main>

      {modal ? (
        <ContributeModal
          storyId={modal.storyId}
          storyTitle={modal.storyTitle}
          storyTitleKhmer={modal.storyTitleKhmer}
          onClose={close}
        />
      ) : null}
    </ContributeModalContext.Provider>
  );
}
