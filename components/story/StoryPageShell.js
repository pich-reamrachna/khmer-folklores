"use client";

import { useRef } from "react";
import Footer from "../shared/Footer.js";

// <main> wrapper for a story's dedicated page — ends on the same reusable
// Footer as the home page, with a working "back to top" button. Scrolls
// freely; no scroll-snapping on this page.
// "use client" is required for the ref/back-to-top handler.

export default function StoryPageShell({ children }) {
  const mainRef = useRef(null);

  return (
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
  );
}
