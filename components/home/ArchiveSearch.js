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
  // Only rendered once there's a query, so there's no hydration-gap flash
  // risk here (unlike bar/icon above). backgroundColor is left out of
  // clearIcon on purpose: an inline style always beats a stylesheet rule
  // regardless of selector specificity, which would make the :hover rule
  // in this file's own <style jsx> below unable to ever override it.
  clearButton: {
    flex: "0 0 18px",
    width: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  clearIcon: {
    width: 12,
    height: 12,
    WebkitMaskImage: "url(/icons/close.png)",
    maskImage: "url(/icons/close.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
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
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          style={styles.clearButton}
          className="archive-clear-button"
          aria-label="Clear search"
        >
          <span style={styles.clearIcon} className="archive-clear-icon" aria-hidden="true" />
        </button>
      ) : null}

      {/* :hover can't be expressed as an inline style — styled-jsx (built
          into Next.js) scopes real CSS to just this component. Safe here
          (unlike bar/input above) since this button only ever exists
          after a user has typed something, never at first paint. */}
      <style jsx>{`
        .archive-clear-icon {
          background-color: #c5a059;
          transition: background-color 0.15s ease;
        }
        .archive-clear-button:hover .archive-clear-icon {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
}
