"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EntryCard from "./EntryCard.js";

// The hero-carousel-wrapper from the mockup. It has no max-width of its
// own — it lives inside StoryHero's 1560px container and fills 100% of
// that, with each card taking a third of the row via the same percentage
// formula the mockup's .story-card uses.

const GAP = 20; // 1.25rem
const CARD_MIN_WIDTH = 260;
const CARD_WIDTH = `calc((100% - ${2 * GAP}px) / 3)`;

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
    padding: "4px 0",
    width: "100%",
  },
  cardSlot: {
    flex: `0 0 ${CARD_WIDTH}`,
    minWidth: CARD_MIN_WIDTH,
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
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
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
    scrollRef.current?.scrollBy({
      left: direction * (el.clientWidth / 3 + GAP),
      behavior: "smooth",
    });
    // Re-check edges after the scroll animation completes.
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
