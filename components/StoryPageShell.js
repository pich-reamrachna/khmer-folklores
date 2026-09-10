"use client";

import { useRef } from "react";
import Footer from "./Footer.js";

// Scroll-snap <main> wrapper for a story's dedicated page — same pattern
// as app/page.js's <main>, so the page snaps section-by-section and ends
// on the same reusable Footer with a working "back to top" button.
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
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      {children}

      <Footer
        onBackToTop={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </main>
  );
}
