"use client";

import { useEffect, useRef, useState } from "react";
import provinces from "../../data/provinces.js";

// Searchable custom dropdown for the location field, replacing the native
// <select> so (a) the option list is a real page element that can use the
// themed gold scrollbar (.archive-scroll), and (b) the user can type to filter
// by English or Khmer. Implements the ARIA editable-combobox pattern: type to
// filter, arrows to move, Enter to pick, Escape/Tab/click-outside to dismiss.
// `value` stays the committed English province name (or ""), so typing never
// leaves an invalid value — the box resets to the last selection on dismiss.

// Typed/pasted Khmer often carries invisible characters (zero-width
// space/joiners, BOM, soft hyphen) or differs in Unicode composition, so a raw
// substring match fails on text that looks identical. Dropping the invisibles
// by code point (avoiding a regex full of literal invisible chars) + NFC
// normalizing both sides fixes it — the same guard the archive search uses.
function stripInvisible(s) {
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if ((c >= 0x200b && c <= 0x200d) || c === 0xfeff || c === 0xad) continue;
    out += ch;
  }
  return out;
}
// Fold look-alike Khmer subscripts that are genuinely different code points
// but render near-identically, so common spelling variants still match. The
// classic case: coeng-TA (U+178F) vs coeng-DA (U+178A) — Kandal is written both
// កណ្តាល and កណ្ដាល. (Hex code points, not literal Khmer, to stay readable.)
function foldConfusables(s) {
  let out = "";
  for (const ch of s) {
    out += ch.codePointAt(0) === 0x178f ? String.fromCodePoint(0x178a) : ch;
  }
  return out;
}
// toLowerCase is a no-op for Khmer but folds English case.
const normalize = (s) => foldConfusables(stripInvisible(s.normalize("NFC"))).toLowerCase();

const styles = {
  wrap: { position: "relative" },
  listbox: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    zIndex: 30,
    margin: 0,
    padding: "0.3rem",
    listStyle: "none",
    maxHeight: 240,
    overflowY: "auto",
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 10,
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.5)",
  },
  option: {
    padding: "0.55rem 0.8rem",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.95rem",
    color: "#F5EFE6",
  },
  // Highlight follows keyboard/mouse (JS-driven, so no CSS :hover needed).
  optionActive: { backgroundColor: "#1D1024" },
  optionSelected: { color: "#E6C575", fontWeight: 700 },
  empty: {
    padding: "0.6rem 0.8rem",
    color: "#8A7F91",
    fontSize: "0.9rem",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
  },
};

export default function LocationSelect({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);

  const listboxId = `${id}-listbox`;
  const optionId = (i) => `${id}-option-${i}`;
  const selected = provinces.find((p) => p.en === value) ?? null;

  // Sync the input text when the selection changes from outside.
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // While the typed text still equals the committed selection (or is empty),
  // show the whole list; once the user types something new, filter by English
  // or Khmer — normalized so invisible chars / composition don't break a match.
  const q = query.trim();
  const showAll = q === "" || (selected && q === selected.en);
  const nq = normalize(q);
  const filtered = showAll
    ? provinces
    : provinces.filter((p) => normalize(p.en).includes(nq) || normalize(p.km).includes(nq));

  // Close + revert the text to the committed selection when clicking outside.
  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value || "");
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open, value]);

  // Keep the active option scrolled into view while navigating.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openList = () => {
    const si = provinces.findIndex((p) => p.en === value);
    setActiveIndex(si >= 0 ? si : 0);
    setOpen(true);
  };
  const choose = (i) => {
    const p = filtered[i];
    if (!p) return;
    onChange(p.en);
    setQuery(p.en);
    setOpen(false);
  };
  const resetAndClose = () => {
    setOpen(false);
    setQuery(value || "");
  };

  function onKeyDown(e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (open) {
          e.preventDefault();
          choose(activeIndex);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          resetAndClose();
        }
        break;
      case "Tab":
        if (open) resetAndClose();
        break;
      default:
        break;
    }
  }

  return (
    <div style={styles.wrap} ref={wrapRef}>
      <input
        type="text"
        id={id}
        className="loc-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered.length > 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        placeholder="Search a province (English or Khmer)…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={(e) => {
          openList();
          e.target.select();
        }}
        onKeyDown={onKeyDown}
      />

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Province"
          className="archive-scroll"
          style={styles.listbox}
        >
          {filtered.length === 0 ? (
            <li style={styles.empty}>No matching province</li>
          ) : (
            filtered.map((p, i) => {
              const isSelected = p.en === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={p.en}
                  id={optionId(i)}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  // Keep focus in the input (editable combobox pattern).
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  style={{
                    ...styles.option,
                    ...(isActive ? styles.optionActive : null),
                    ...(isSelected ? styles.optionSelected : null),
                  }}
                >
                  {p.en} — {p.km}
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      {/* Native <input>, so styled-jsx scoping works. All input styling (incl.
          focus + placeholder) lives here, none inline, per the no-split rule. */}
      <style jsx>{`
        .loc-input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.8rem 1rem;
          background-color: #120916;
          border: 1px solid #2a172f;
          border-radius: 10px;
          color: #f5efe6;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 1rem;
        }
        .loc-input:focus {
          outline: none;
          border-color: #c5a059;
        }
        .loc-input::placeholder {
          color: #8a7f91;
        }
      `}</style>
    </div>
  );
}
