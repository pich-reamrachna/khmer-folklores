"use client";

// Presentational search pill for the browse-archive section. This owns
// only its own markup/styling — ArchiveBrowser.js owns the query state
// and the actual filtering logic, passing it down as value/onChange.
// "use client" is required for the input's onChange handler.

const styles = {
  // border/flex/max-width live in app/globals.css's .archive-search-bar
  // rule — needed for :focus-within, and a plain stylesheet avoids a
  // hydration-gap flash (see globals.css).
  bar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 999,
    padding: "0.85rem 1.4rem",
    transition: "border-color 0.2s ease",
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
    </div>
  );
}
