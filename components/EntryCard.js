"use client";

// The mockup's .story-card. Dark surface, gold active border, no icon.

const styles = {
  card: {
    width: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    cursor: "pointer",
    padding: "1.2rem 1.4rem",
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 16,
    color: "#F5EFE6",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    display: "flex",
    alignItems: "center",
    transition: "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease",
    position: "relative",
    zIndex: 1,
  },
  cardActive: {
    backgroundColor: "#1D1024",
    border: "2px solid #C5A059",
    boxShadow: "0 0 24px rgba(197, 160, 89, 0.22)",
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
    >
      <div style={styles.body}>
        <div style={styles.headerRow}>
          <p style={styles.number}>{String(index + 1).padStart(2, "0")}</p>
          {place ? <p style={styles.place}>{place}</p> : null}
        </div>
        <h2 style={styles.title}>{entry.title}</h2>
        <p style={styles.category}>{entry.category}</p>
      </div>
    </button>
  );
}
