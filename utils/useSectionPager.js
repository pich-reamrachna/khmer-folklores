"use client";

import { useCallback, useEffect, useRef } from "react";

// Section-by-section paging for the home page, in place of CSS scroll-snap.
// The page doesn't scroll freely: each wheel flick, swipe or key press plays
// one smooth, fixed-length move to the next stop, and input is ignored until
// the move (and the rest of that flick, e.g. a trackpad's momentum) is over.
// So one gesture always moves exactly one stop — never two, never halfway.
//
// <main> stays the scroll container but with overflow: hidden, which stops
// the user scrolling it while still letting code set its scrollTop. Moving
// scrollTop (not a CSS transform) keeps real scroll events firing, which
// NavBar.js listens for to switch to its solid background.
//
// Stops are worked out from the page itself on each move, so they follow
// whatever is rendered: the top of each section, plus — for a section
// taller than the screen — a stop every screen-height through it, ending
// with its bottom edge, so nothing in it is ever skipped.
//
// Anything inside that scrolls on its own (the archive list) keeps working:
// while it can still scroll in the gesture's direction, the gesture is left
// to it, and only at its end does paging take over.

// How long one move takes, and the easing it follows: CSS's own `ease`
// curve, cubic-bezier(0.25, 0.1, 0.25, 1) — the one Swiper's slides use
// by default. It gets moving straight away and spends most of its time
// slowing down, so the page coasts on from your scroll like momentum. An
// ease-in-out curve starts slowly instead, which felt like the page being
// pushed along after a pause rather than scrolled.
const DURATION = 650;
const ease = cubicBezier(0.25, 0.1, 0.25, 1);
// Wheel events closer together than this belong to the same flick
// (a trackpad's momentum keeps sending them for a second or more).
const QUIET_MS = 180;
// How far a finger must travel for a swipe to count.
const SWIPE_PX = 40;

// A CSS cubic-bezier(x1, y1, x2, y2) timing curve as a function of time
// (0–1) to progress (0–1), the same curve the browser would draw. The
// curve is defined by x(s) and y(s) for a parameter s, so for a given time
// it first finds the s where x(s) equals it (Newton's method, then halving
// as a fallback), then returns y(s).
function cubicBezier(x1, y1, x2, y2) {
  const coord = (s, a, b) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const slope = (s, a, b) => 3 * a * (1 - s) ** 2 + 6 * (b - a) * s * (1 - s) + 3 * (1 - b) * s * s;
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let s = t;
    for (let i = 0; i < 8; i++) {
      const dx = coord(s, x1, x2) - t;
      if (Math.abs(dx) < 1e-5) return coord(s, y1, y2);
      const d = slope(s, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      s -= dx / d;
    }
    let lo = 0;
    let hi = 1;
    s = t;
    for (let i = 0; i < 30; i++) {
      const x = coord(s, x1, x2);
      if (Math.abs(x - t) < 1e-5) break;
      if (x < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return coord(s, y1, y2);
  };
}

// Every stop, top to bottom, as scrollTop values.
function stopsOf(main) {
  const view = main.clientHeight;
  const max = main.scrollHeight - view;
  // Where content at scrollTop 0 starts, so each section's position can be
  // measured in scrollTop terms whatever the page is scrolled to now.
  const origin = main.getBoundingClientRect().top - main.scrollTop;
  const stops = [0, max];
  for (const el of main.children) {
    // The fixed NavBar sits over the page, not in its flow.
    if (getComputedStyle(el).position === "fixed") continue;
    const { top: rectTop, height } = el.getBoundingClientRect();
    const top = rectTop - origin;
    stops.push(top);
    for (let y = top + view; y < top + height - view; y += view) stops.push(y);
    if (height > view) stops.push(top + height - view);
  }
  const clamped = stops.map((s) => Math.round(Math.min(Math.max(s, 0), max)));
  return [...new Set(clamped)].sort((a, b) => a - b);
}

// True when something between `target` and <main> can still scroll in
// direction `dir` (1 down, -1 up) — then the gesture belongs to it.
function canScrollInside(target, main, dir) {
  for (let el = target; el && el !== main; el = el.parentElement) {
    if (!(el instanceof Element) || el.scrollHeight <= el.clientHeight + 1) continue;
    const { overflowY } = getComputedStyle(el);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    if (dir > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    if (dir < 0 && el.scrollTop > 0) return true;
  }
  return false;
}

// mainRef: the page's <main>. enabled: false while there's no real page to
// page through yet (loading, empty). Returns scrollToY(y), for anything that
// moves the page itself (the footer's "Back to top").
export function useSectionPager(mainRef, enabled) {
  const frame = useRef(0);
  const moving = useRef(false);

  const scrollToY = useCallback(
    (y) => {
      const main = mainRef.current;
      if (!main) return;
      cancelAnimationFrame(frame.current);
      const from = main.scrollTop;
      const distance = y - from;
      if (Math.abs(distance) < 1) return;
      // "Reduce motion": arrive straight away, no glide.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        main.scrollTop = y;
        return;
      }
      moving.current = true;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / DURATION, 1);
        main.scrollTop = from + distance * ease(t);
        if (t < 1) frame.current = requestAnimationFrame(step);
        else moving.current = false;
      };
      frame.current = requestAnimationFrame(step);
    },
    [mainRef]
  );

  // One stop down (dir 1) or up (dir -1) from wherever the page is now.
  const page = useCallback(
    (dir) => {
      const main = mainRef.current;
      if (!main || moving.current) return;
      const stops = stopsOf(main);
      const now = main.scrollTop;
      const target = dir > 0 ? stops.find((s) => s > now + 2) : stops.findLast((s) => s < now - 2);
      if (target !== undefined) scrollToY(target);
    },
    [mainRef, scrollToY]
  );

  useEffect(() => {
    const main = mainRef.current;
    if (!enabled || !main) return;

    // Wheel: the first event of a flick pages; the rest of that flick is
    // swallowed, so momentum can't carry on to a second stop.
    let lastWheel = 0;
    let flickUsed = false;
    const onWheel = (e) => {
      // Pinch-zoom on a trackpad arrives as ctrl+wheel; sideways scrolls
      // aren't ours either.
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const dir = Math.sign(e.deltaY);
      const now = performance.now();
      if (now - lastWheel > QUIET_MS) flickUsed = false;
      lastWheel = now;
      if (canScrollInside(e.target, main, dir)) {
        // Hitting the inner list's end mid-flick shouldn't spill over into
        // a page move — only a fresh flick does that.
        flickUsed = true;
        return;
      }
      e.preventDefault();
      if (flickUsed || moving.current) return;
      flickUsed = true;
      page(dir);
    };

    // Touch: one swipe, one move. Inner scrolling areas keep their swipe.
    let touchY = null;
    let touchInside = false;
    const onTouchStart = (e) => {
      touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
      touchInside = false;
    };
    const onTouchMove = (e) => {
      if (touchY === null) return;
      const dir = Math.sign(touchY - e.touches[0].clientY);
      if (!touchInside && dir && canScrollInside(e.target, main, dir)) touchInside = true;
      if (!touchInside) e.preventDefault();
    };
    const onTouchEnd = (e) => {
      if (touchY === null || touchInside) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) >= SWIPE_PX) page(Math.sign(dy));
    };

    // Keyboard: the usual page keys, except while typing (the search box)
    // or when a focused button/link is using Space to press itself.
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        scrollToY(e.key === "Home" ? 0 : main.scrollHeight - main.clientHeight);
        return;
      }
      let dir = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
      else if (e.key === " ") {
        if (t instanceof Element && t.closest("button, a")) return;
        dir = e.shiftKey ? -1 : 1;
      }
      if (!dir || canScrollInside(t, main, dir)) return;
      e.preventDefault();
      page(dir);
    };

    // Resizing moves every stop; settle on the nearest new one at once.
    const onResize = () => {
      if (moving.current) return;
      const stops = stopsOf(main);
      const now = main.scrollTop;
      const nearest = stops.reduce((a, b) => (Math.abs(b - now) < Math.abs(a - now) ? b : a));
      main.scrollTop = nearest;
    };

    // passive: false — only a non-passive listener may call preventDefault.
    main.addEventListener("wheel", onWheel, { passive: false });
    main.addEventListener("touchstart", onTouchStart, { passive: true });
    main.addEventListener("touchmove", onTouchMove, { passive: false });
    main.addEventListener("touchend", onTouchEnd);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame.current);
      moving.current = false;
      main.removeEventListener("wheel", onWheel);
      main.removeEventListener("touchstart", onTouchStart);
      main.removeEventListener("touchmove", onTouchMove);
      main.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, mainRef, page, scrollToY]);

  return scrollToY;
}
