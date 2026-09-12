"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EntryCard from "./EntryCard.js";

// The hero-carousel-wrapper from the mockup. Arrows are real flex
// siblings of the track (not an absolute overlay), so they can't overlap
// a card.
//
// cardSlot needs min-width: 0 — flex items default to min-width: auto,
// so a card could never shrink below its nowrap title's full width
// otherwise, breaking the CARD_WIDTH formula.
//
// No side padding on the track — scroll-snap-type: x mandatory never
// rests in a padding-only zone, so it would just be dead scrollable
// space, not a visible gap.

const GAP = 20; // 1.25rem
const CARDS_PER_VIEW = 3;
const CARD_WIDTH = `calc((100% - ${GAP * (CARDS_PER_VIEW - 1)}px) / ${CARDS_PER_VIEW})`;

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(42, 23, 47, 0.8)",
    width: "100%",
    boxSizing: "border-box",
  },
  track: {
    display: "flex",
    gap: GAP,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    overscrollBehaviorX: "contain",
    // Vertical only — no side padding (see file-level note).
    padding: "10px 0",
    boxSizing: "border-box",
    // Grow to fill whatever space remains after the two arrow buttons —
    // clientWidth then already excludes them, no manual accounting needed.
    flex: "1 1 0%",
    minWidth: 0,
  },
  cardSlot: {
    flex: `0 0 ${CARD_WIDTH}`,
    minWidth: 0,
    scrollSnapAlign: "start",
  },
  arrowBtn: {
    flex: "0 0 44px",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "1px solid #2A172F",
    backgroundColor: "#120916",
    color: "#C5A059",
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDisabled: {
    opacity: 0.35,
    cursor: "default",
  },
};

export default function EntryCardRow({ entries, selectedIndex, onSelect }) {
  const scrollRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 0);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [updateEdges, entries.length]);

  const scrollByPage = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    // An approximate nudge is enough — scroll-snap-align on each card
    // pulls the final rest position to the exact card boundary regardless
    // of small overshoot/undershoot here.
    el.scrollBy({
      left: direction * (el.clientWidth / CARDS_PER_VIEW),
      behavior: "smooth",
    });
    setTimeout(updateEdges, 350);
  };

  return (
    <div style={styles.wrapper} className="hide-scrollbar">
      <button
        type="button"
        aria-label="Scroll to previous entries"
        onClick={() => scrollByPage(-1)}
        disabled={atStart}
        style={{ ...styles.arrowBtn, ...(atStart ? styles.arrowDisabled : null) }}
      >
        {"<"}
      </button>

      <div
        ref={scrollRef}
        onScroll={updateEdges}
        className="hide-scrollbar"
        style={styles.track}
        aria-label="Entries in the archive"
      >
        {entries.map((entry, index) => (
          <div key={entry.id} style={styles.cardSlot}>
            <EntryCard
              entry={entry}
              place={entry.place}
              index={index}
              isActive={index === selectedIndex}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll to next entries"
        onClick={() => scrollByPage(1)}
        disabled={atEnd}
        style={{ ...styles.arrowBtn, ...(atEnd ? styles.arrowDisabled : null) }}
      >
        {">"}
      </button>
    </div>
  );
}
