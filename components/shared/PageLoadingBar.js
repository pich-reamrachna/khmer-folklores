"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// A thin gold bar along the bottom edge of the fixed NavBar (90px tall)
// while the next page loads. No package for this — the dependency list is
// fixed — so it watches for the start of a page change itself:
//   - a click on a link to another page of this site (left click, no
//     modifier keys, not opening a new tab), or
//   - the browser's Back / Forward buttons;
// and it finishes when the address (usePathname) changes, i.e. the new page
// is on screen. While waiting it creeps towards 90% and never gets there, so
// a slow page still shows it's working; finishing jumps it to 100% and fades
// it out. A click on a link to the page you're already on does nothing.
//
// Mounted once in app/layout.js, so it survives the page change it's
// reporting on (app/template.js is rebuilt on every navigation).

// How far it has got: null = hidden.
const START = 0.12;
const CREEP_TO = 0.9;

export default function PageLoadingBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const start = () => {
      clearTimers();
      setFinishing(false);
      setProgress(START);
      // Creep on in shrinking steps towards CREEP_TO.
      const step = (value, delay) => {
        timers.current.push(
          setTimeout(() => {
            const next = value + (CREEP_TO - value) * 0.35;
            setProgress(next);
            step(next, Math.min(delay * 1.4, 1200));
          }, delay)
        );
      };
      step(START, 180);
    };

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (or just a #jump on it): nothing to load.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };
    const onPop = () => start();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      clearTimers();
    };
  }, []);

  // The new page is here: run to the end, then fade out and hide.
  useEffect(() => {
    if (progress === null) return;
    clearTimers();
    setProgress(1);
    setFinishing(true);
    timers.current.push(
      setTimeout(() => {
        setProgress(null);
        setFinishing(false);
      }, 450)
    );
    // Only the address changing should finish it, not progress itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`page-loading-bar${progress === null ? "" : " is-active"}${finishing ? " is-finishing" : ""}`}
      style={{ transform: `scaleX(${progress ?? 0})` }}
    />
  );
}
