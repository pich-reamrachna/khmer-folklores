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
// Anything inside that scrolls on its own (the archive list) has its own
// patch: a gesture that starts with the pointer (or a finger) over it, in a
// direction the list can still scroll, scrolls only that list — never the
// page, not even past the list's end, where a brief gold glow at its edge
// shows it has run out. A gesture that starts anywhere else — or over the
// list in a direction it can't go (up at its top, down at its bottom) —
// moves the page; otherwise there'd be no way up or down from the list
// short of moving the mouse off it. Where it starts decides it for the
// whole gesture: sliding the cursor onto the list mid-scroll doesn't hand
// the rest of a page scroll to the list, and sliding off the list doesn't
// hand the rest of a list scroll to the page.
//
// One exception: right after a page move, the list has just slid in under
// a cursor that never moved — so until the mouse actually moves, a gesture
// over the list still moves the page. Without this, scrolling to the
// archive and scrolling again went to the list instead of on down.

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
// How much wheel movement (px) a flick must add up to, in one direction,
// before it moves the page; and the smallest single event (px) that counts
// as turning round. A trackpad sends a tiny nudge the opposite way as the
// fingers land — before these, that nudge counted as a new flick, moved the
// page the wrong way, and the real swipe was then ignored while that move
// played, so the page went nowhere. A mouse notch (~100px) still acts at once.
const START_PX = 15;
const TURN_PX = 3;
// A trackpad's glide keeps trickling tiny events in for half a second or more
// after the page has finished moving — never far enough apart to end the
// flick — so a second swipe the same way, made during that trickle, used to
// count as more of the first and be ignored. A glide only ever fades, though;
// a fresh swipe makes the events suddenly bigger again. So once the move is
// over, an event at least RISE_MIN_PX and RISE_FACTOR times the recent
// average starts a new flick.
const RISE_MIN_PX = 6;
const RISE_FACTOR = 2.5;
// How much taller than the screen (as a share of its height) a section must
// be before it gets stops inside it, not just at its top.
const MIN_OVERHANG = 0.25;
// How far the pointer must move (px) to count as the visitor moving the
// mouse — browsers can send a mousemove with no real movement when content
// scrolls under a still cursor.
const MOVE_PX = 2;

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
    // Only a section that overhangs the screen by a real amount gets stops
    // inside it. A small overhang (the archive is a few dozen px taller
    // than the screen) would make a stop just that far down — a move so
    // short it feels like the scroll did nothing — and the next stop shows
    // that strip anyway.
    if (height - view > view * MIN_OVERHANG) {
      for (let y = top + view; y < top + height - view; y += view) stops.push(y);
      stops.push(top + height - view);
    }
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

// The inner scrolling area `target` is in (closest first), if any — the
// part of the page where a gesture belongs to that area, not the page.
function innerScroller(target, main) {
  for (let el = target; el && el !== main; el = el.parentElement) {
    if (!(el instanceof Element) || el.scrollHeight <= el.clientHeight + 1) continue;
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
  }
  return null;
}

// Plays the one-shot glow (app/globals.css's .pager-end-down/-up) on the
// edge of `el` that a gesture in direction `dir` just ran into. Removing
// the class and forcing a layout first restarts the animation if it's
// still showing from last time.
function flashEnd(el, dir) {
  el.classList.remove("pager-end-down", "pager-end-up");
  void el.offsetWidth;
  el.classList.add(dir > 0 ? "pager-end-down" : "pager-end-up");
}

// mainRef: the page's <main>. enabled: false while there's no real page to
// page through yet (loading, empty). Returns scrollToY(y), for anything that
// moves the page itself (the footer's "Back to top").
export function useSectionPager(mainRef, enabled) {
  const frame = useRef(0);
  const moving = useRef(false);
  // Whether the mouse has moved since the last page move — until it has,
  // gestures over the inner list still move the page (see the file note).
  const mouseMoved = useRef(false);

  const scrollToY = useCallback(
    (y) => {
      const main = mainRef.current;
      if (!main) return;
      cancelAnimationFrame(frame.current);
      mouseMoved.current = false;
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
    let lastDir = 0;
    let flickUsed = false;
    // How far this flick has scrolled so far (px, signed), until it moves
    // the page.
    let flickSum = 0;
    // A running level of this flick's event sizes (px), to tell a fresh
    // swipe (sudden rise) from a fading glide.
    let flickAvg = 0;
    // The inner list this flick started on (it owns the whole flick), or
    // null when it started on the page.
    let flickList = null;
    // Whether the inner list's end has glowed for this flick yet.
    let listEndShown = false;
    const onWheel = (e) => {
      // Pinch-zoom on a trackpad arrives as ctrl+wheel; sideways scrolls
      // aren't ours either.
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const dir = Math.sign(e.deltaY);
      const now = performance.now();
      // The event's movement in px — Firefox can report lines or pages.
      const px = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? main.clientHeight : 1);
      // A new flick starts after a pause, or when the direction really
      // turns round. On a touchpad or smooth-scrolling mouse, scrolling down
      // then straight back up is one unbroken stream of events — without
      // the direction check, the "back up" counted as the same flick and
      // was ignored until the stream (and any glide) fully stopped. A tiny
      // event the other way doesn't count as turning (see TURN_PX).
      const turned = dir !== lastDir && Math.abs(px) >= TURN_PX;
      const mag = Math.abs(px);
      const rose = flickUsed && !moving.current && mag >= RISE_MIN_PX && mag > flickAvg * RISE_FACTOR;
      const newFlick = now - lastWheel > QUIET_MS || turned || rose;
      // Falls fast with a fading glide, rises only slowly — so a new swipe's
      // events, which ramp up over a few steps, stand out above it rather
      // than dragging it up with them.
      const weight = mag > flickAvg ? 0.1 : 0.3;
      flickAvg = newFlick ? mag : flickAvg * (1 - weight) + mag * weight;
      if (newFlick) {
        flickUsed = false;
        flickSum = 0;
        listEndShown = false;
        flickList =
          mouseMoved.current && canScrollInside(e.target, main, dir) ? innerScroller(e.target, main) : null;
      }
      lastWheel = now;
      if (newFlick || Math.abs(px) >= TURN_PX) lastDir = dir;
      // A flick that started on the inner list is the list's alone. While
      // the cursor is still on it and it can scroll, the browser scrolls
      // it; otherwise the wheel is swallowed (never passed on to the page),
      // and reaching the list's end makes its edge glow once per flick.
      if (flickList) {
        const onList = flickList.contains(e.target);
        if (onList && canScrollInside(e.target, main, dir)) return;
        e.preventDefault();
        if (onList && !listEndShown) {
          flashEnd(flickList, dir);
          listEndShown = true;
        }
        return;
      }
      // A flick that started on the page is the page's, even once the
      // cursor crosses onto the list — so this event mustn't reach the
      // browser, which would scroll the list under it.
      e.preventDefault();
      if (flickUsed || moving.current) return;
      // Wait until the flick has really gone somewhere, then move the page
      // the way it went.
      flickSum += px;
      if (Math.abs(flickSum) < START_PX) return;
      flickUsed = true;
      page(Math.sign(flickSum));
    };

    // Real mouse movement (not a still cursor that content scrolled under)
    // lets gestures over the inner list belong to it again.
    let lastX = null;
    let lastY = null;
    const onMouseMove = (e) => {
      if (lastX !== null && (Math.abs(e.clientX - lastX) > MOVE_PX || Math.abs(e.clientY - lastY) > MOVE_PX)) {
        mouseMoved.current = true;
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    // Touch: one swipe, one move. A swipe that starts on the inner list is
    // the list's alone, same as the wheel — the browser scrolls it, and the
    // page never moves from it. A mostly sideways swipe isn't a page move
    // either: the hero uses those to step through its stories
    // (useHorizontalWheel.js).
    let touchY = null;
    let touchX = null;
    let touchInside = false;
    const onTouchStart = (e) => {
      touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
      touchX = e.touches.length === 1 ? e.touches[0].clientX : null;
      touchInside = !!innerScroller(e.target, main);
    };
    const onTouchMove = (e) => {
      if (touchY === null || touchInside) return;
      e.preventDefault();
    };
    const onTouchEnd = (e) => {
      if (touchY === null || touchInside) return;
      const dy = touchY - e.changedTouches[0].clientY;
      const dx = touchX - e.changedTouches[0].clientX;
      touchY = null;
      if (Math.abs(dx) > Math.abs(dy)) return;
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
    main.addEventListener("mousemove", onMouseMove, { passive: true });
    main.addEventListener("touchstart", onTouchStart, { passive: true });
    main.addEventListener("touchmove", onTouchMove, { passive: false });
    main.addEventListener("touchend", onTouchEnd);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame.current);
      moving.current = false;
      main.removeEventListener("wheel", onWheel);
      main.removeEventListener("mousemove", onMouseMove);
      main.removeEventListener("touchstart", onTouchStart);
      main.removeEventListener("touchmove", onTouchMove);
      main.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, mainRef, page, scrollToY]);

  return scrollToY;
}
