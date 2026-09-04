"use client";

// Card palette and structure match the hero: dark surface, gold active border.
// We accept an isActive prop and an onClick so the parent (app/page.js) can
// drive which entry is selected. The card is a <button> inside an <li> for
// keyboard/screen-reader support; click semantics live in the parent.

const styles = {
  card: {
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    padding: 20,
    backgroundColor: "#171122",
    border: "1px solid #2A2136",
    borderRadius: 12,
    color: "#E8EDF2",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "border-color 120ms ease, box-shadow 120ms ease",
  },
  cardActive: {
    borderColor: "#D4B368",
    boxShadow: "0 0 0 1px #D4B368 inset",
  },
  body: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  number: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 12,
    letterSpacing: 2,
    color: "#8A8398",
    margin: 0,
  },
  numberActive: { color: "#D4B368" },
  title: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 22,
    fontWeight: 400,
    margin: 0,
    color: "#F1E9DA",
    lineHeight: 1.2,
  },
  category: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#8A8398",
    margin: 0,
  },
};

export default function EntryCard({ entry, index, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      style={{ ...styles.card, ...(isActive ? styles.cardActive : null) }}
      aria-pressed={isActive}
    >
      <div style={styles.body}>
        <p style={{ ...styles.number, ...(isActive ? styles.numberActive : null) }}>
          {String(index + 1).padStart(2, "0")}
        </p>
        <h2 style={styles.title}>{entry.title}</h2>
        <p style={styles.category}>{entry.category}</p>
      </div>
    </button>
  );
}