"use client";

// Presentational search pill for the browse-archive section. This owns
// only its own markup/styling — ArchiveBrowser.js owns the query state
// and the actual filtering logic, passing it down as value/onChange.

const styles = {
  // border, flex, and max-width live in the .archive-search-bar stylesheet
  // rule below, not here — an inline value for any of these would always
  // beat the :focus-within stylesheet rule for the same property, so the
  // gold outline and the widen-on-focus effect could never actually show.
  bar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 999,
    padding: "0.85rem 1.4rem",
    transition: "border-color 0.2s ease, flex-basis 0.2s ease, max-width 0.2s ease",
  },
  // The PNG icon is recolored gold via mask-image (background-color shows
  // through wherever the image is opaque) rather than an <img>, since the
  // source asset's own color doesn't have to be gold for this to work.
  icon: {
    flex: "0 0 18px",
    width: 18,
    height: 18,
    backgroundColor: "#C5A059",
    WebkitMaskImage: "url(/icons/icons8-search-32.png)",
    maskImage: "url(/icons/icons8-search-32.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#F5EFE6",
    fontFamily: "inherit",
    fontSize: "0.95rem",
  },
};

export default function ArchiveSearch({ value, onChange }) {
  return (
    <div style={styles.bar} className="archive-search-bar">
      <span style={styles.icon} aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name, place, or story"
        aria-label="Search stories"
        style={styles.input}
        className="archive-search-input"
      />

      {/* ::placeholder and reacting to the input's focus from its parent
          (:focus-within) can't be expressed as inline styles — styled-jsx
          (built into Next.js) scopes real CSS to just this component. */}
      <style jsx>{`
        .archive-search-input::placeholder {
          color: #8a7f91;
        }
        .archive-search-bar {
          border: 1px solid #2a172f;
          flex: 0 1 320px;
          max-width: 520px;
        }
        .archive-search-bar:focus-within {
          border-color: #c5a059;
          flex-basis: 400px;
          max-width: 580px;
        }
      `}</style>
    </div>
  );
}
