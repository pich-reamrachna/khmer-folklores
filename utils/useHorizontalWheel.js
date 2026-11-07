"use client";

import { useEffect, useRef } from "react";

// Sideways scrolling over an element — a trackpad swipe left or right, or
// Shift + mouse wheel — as one step per gesture: onStep(1) for scrolling
// right (fingers pushing the content left, the way a carousel moves on to
// the next one), onStep(-1) for left. Used by the home hero (StoryHero.js)
// to move its story carousel.
//
// Mostly-vertical scrolling is left alone — useSectionPager.js already
// ignores mostly-sideways wheels, so the two never both act on one gesture.
// Sideways ones are swallowed (preventDefault) so the browser doesn't also
// treat the swipe as back/forward navigation.
//
// A trackpad keeps sending a gliding tail of ever-smaller events for a
// second or so after the fingers lift, so — same as the section pager —
// events closer together than QUIET_MS belong to the same gesture and only
// its first STEP_PX of travel counts; the rest is ignored. A fresh swipe
// made during that tail makes the events suddenly bigger again, so once the
// step has had time to play (COOLDOWN_MS), an event RISE_FACTOR times the
// recent average (and at least RISE_MIN_PX) starts a new gesture.

const QUIET_MS = 180;
const STEP_PX = 30;
const COOLDOWN_MS = 450;
const RISE_MIN_PX = 6;
const RISE_FACTOR = 2.5;

export default function useHorizontalWheel(ref, onStep) {
  // The latest onStep, without re-attaching the listener every render.
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let lastWheel = 0; // time of the last sideways event
    let travel = 0; // sideways distance so far in this gesture
    let stepped = false; // this gesture has already moved the carousel
    let steppedAt = 0;
    let average = 0; // recent event size, for spotting a fresh swipe

    function onWheel(e) {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      const px = e.deltaX * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1);
      const size = Math.abs(px);
      const now = performance.now();
      const turned = travel !== 0 && Math.sign(px) !== Math.sign(travel);
      const rose =
        stepped && now - steppedAt > COOLDOWN_MS && size >= RISE_MIN_PX && size > average * RISE_FACTOR;

      if (now - lastWheel > QUIET_MS || turned || rose) {
        travel = 0;
        stepped = false;
        average = size;
      }
      lastWheel = now;
      travel += px;
      average = average * 0.7 + size * 0.3;

      if (!stepped && Math.abs(travel) >= STEP_PX) {
        stepped = true;
        steppedAt = now;
        onStepRef.current(Math.sign(travel));
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref]);
}
