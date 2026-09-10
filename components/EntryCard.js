"use client";

// The mockup's .story-card. Dark surface, gold active border, no icon.
// "use client" is required for the <style jsx> hover rules below.

const styles = {
  card: {
    width: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    cursor: "pointer",
    padding: "1.2rem 1.4rem",
    backgroundColor: "#120916",
    // Width and style are constant (2px solid) across active/inactive/
    // hover states — only the color ever changes. The card's height is
    // auto (content-driven), so box-sizing: border-box does NOT protect
    // it from a genuine border-WIDTH change the way it does for the
    // explicit flex-basis width; a 1px-to-2px animated width difference
    // between the deactivating and activating card briefly desynced the
    // carousel row's stretch-height (both cards mid-transition at once),
    // nudging the vertically-centered hero content above it for a frame.
    border: "2px solid #2A172F",
    borderRadius: 16,
    color: "#F5EFE6",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    display: "flex",
    alignItems: "center",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "relative",
    // z-index lives in the <style jsx> block below, not here — an inline
    // z-index would always beat the .entry-card:hover CSS rule, so a
    // hovered card's glow could never rise above its siblings.
  },
  // Persistent indicator for the selected card — stays gold regardless
  // of hover. Inline styles always win over the .entry-card:hover CSS
  // class below, so hovering the active card can't dull this. Only
  // borderColor (not the border shorthand) so width/style stay constant.
  cardActive: {
    backgroundColor: "#1D1024",
    borderColor: "#C5A059",
    boxShadow: "0 0 3px rgba(197, 160, 89, 0.8), 0 0 24px rgba(197, 160, 89, 0.45)",
  },
  // Small glowing dot that previews on hover for unselected cards only
  // (the active card already has its own persistent indicator, so it
  // isn't rendered there — see the isActive check below).
  hoverPip: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#C5A059",
    opacity: 0,
    transition: "opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    pointerEvents: "none",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    minWidth: 0,
    flex: 1,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  number: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#E6C575",
    letterSpacing: "0.15em",
    margin: 0,
    flex: "0 0 auto",
  },
  place: {
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#C5A059",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    margin: 0,
    textAlign: "right",
  },
  title: {
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
    fontSize: "1.15rem",
    fontWeight: 600,
    color: "#F5EFE6",
    margin: "2px 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  category: {
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#7A697F",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    margin: 0,
  },
};

export default function EntryCard({ entry, place, index, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      style={{ ...styles.card, ...(isActive ? styles.cardActive : null) }}
      aria-pressed={isActive}
      className="entry-card"
    >
      <div style={styles.body}>
        <div style={styles.headerRow}>
          <p style={styles.number}>{String(index + 1).padStart(2, "0")}</p>
          {place ? <p style={styles.place}>{place}</p> : null}
        </div>
        <h2 style={styles.title}>{entry.title}</h2>
        <p style={styles.category}>{entry.category}</p>
      </div>

      {!isActive ? (
        <span style={styles.hoverPip} className="entry-card-pip" aria-hidden="true" />
      ) : null}

      {/* :hover, translateY lift, and the pip's descendant selector can't
          be expressed as inline styles — styled-jsx (built into Next.js)
          scopes real CSS to just this component. */}
      <style jsx>{`
        .entry-card {
          z-index: 1;
        }
        .entry-card:hover {
          z-index: 10;
          border-color: #c5a059;
          background-color: #170f1c;
          box-shadow: 0 0 3px rgba(197, 160, 89, 0.8), 0 0 24px rgba(197, 160, 89, 0.45);
          transform: translateY(-4px);
        }
        .entry-card:hover .entry-card-pip {
          opacity: 1;
          box-shadow: 0 0 8px rgba(197, 160, 89, 0.65);
        }
      `}</style>
    </button>
  );
}
