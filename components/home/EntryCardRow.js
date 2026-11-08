"use client";

import EntryCard from "./EntryCard.js";

// The row of featured stories under the hero, as a ring: the selected story
// always sits in the middle, the one before it on the left and the one after
// it on the right, and the row slides round when the selection changes (from
// StoryHero.js's edge arrows, or by clicking a neighbour). It wraps — on the
// last story, the first one appears on its right.
//
// Each story gets an offset from the selected one (0 = middle, -1 = left,
// +1 = right, further = hidden) and is moved there with translateX, so the
// slide is a plain CSS transition. All the stories share one grid cell, so
// the row is as tall as its tallest story without any measuring.

// Space between neighbouring stories — small, so their hairlines read as
// one line broken into lengths.
const GAP = 12;

// Where a story sits relative to the selected one, the short way round the
// ring: with 5 stories, the one 4 places after is really 1 place before.
function ringOffset(index, selectedIndex, count) {
  let offset = (((index - selectedIndex) % count) + count) % count;
  if (offset > count / 2) offset -= count;
  return offset;
}

const styles = {
  // paddingTop lives in the <style> tag below (.entry-ring) — it's smaller
  // on phone.
  wrapper: {
    width: "100%",
    boxSizing: "border-box",
  },
  // overflow: hidden clips the stories waiting off to the sides. The
  // vertical padding gives the titles' soft shadow room before the clip.
  track: {
    display: "grid",
    overflow: "hidden",
    padding: "10px 0",
  },
  // width (a third of the row, or all of it on phone) lives in this file's
  // <style> tag below — a media query can't override an inline style.
  slot: {
    gridArea: "1 / 1",
    justifySelf: "center",
    minWidth: 0,
  },
};

export default function EntryCardRow({ entries, selectedIndex, onSelect }) {
  const count = entries.length;

  return (
    <div style={styles.wrapper} className="entry-ring">
      <div style={styles.track} aria-label="Featured stories">
        {entries.map((entry, index) => {
          const offset = ringOffset(index, selectedIndex, count);
          const visible = Math.abs(offset) <= 1;
          return (
            <div
              key={entry.id}
              className="entry-ring-slot"
              // Off-screen stories can't be clicked, focused or read out.
              inert={!visible}
              style={{
                ...styles.slot,
                transform: `translateX(calc(${offset * 100}% + ${offset * GAP}px))`,
                opacity: visible ? 1 : 0,
              }}
            >
              <EntryCard
                entry={entry}
                index={index}
                isActive={index === selectedIndex}
                onSelect={onSelect}
              />
            </div>
          );
        })}
      </div>

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so the slot width is right from the first
          paint instead of only after hydration. Phone shows only the
          selected story; its neighbours wait just off-screen. */}
      <style>{`
        /* Nudged down on its own, below where the layout puts it. The hero
           centres its content as one block, so more space above the row
           would push the text up too — a transform moves only the row.
           Not on short screens, where it would run off the hero's bottom. */
        .entry-ring {
          padding-top: 5rem;
          transform: translateY(3rem);
        }
        @media (max-height: 700px) {
          .entry-ring {
            transform: none;
          }
        }
        .entry-ring-slot {
          width: calc((100% - ${GAP * 2}px) / 3);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
        }
        /* Phone: the selected story and its two neighbours share one line,
           like tabs along a rule — small titles, no place names, right under
           the text instead of nudged down. */
        @media (max-width: 640px) {
          .entry-ring {
            padding-top: 0.5rem;
            transform: none;
          }
          .entry-ring-slot {
            width: calc((100% - ${GAP * 2}px) / 3);
          }
          .entry-card-meta {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .entry-ring-slot {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
