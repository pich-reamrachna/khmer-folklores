// StoryHero — the first section of the mockup. Pure presentation.
// Receives the selected entry from the parent (the page holds the state).
// No state, no navigation, no data lookup — that all lives in app/page.js.

const styles = {
  section: {
    backgroundColor: "#0C0A12",
    padding: "72px 48px 56px",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#E8EDF2",
  },
  // Single column — the decorative diamond/mandala accent has been removed
  // by request, so the hero is just the story block (kicker, title,
  // description, CTA) on a dark canvas.
  grid: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  kickerRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: "#C6A15B",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    letterSpacing: 4,
    textTransform: "uppercase",
    margin: 0,
  },
  rule: {
    flex: "0 0 48px",
    height: 1,
    backgroundColor: "#C6A15B",
    opacity: 0.7,
  },
  title: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 72,
    lineHeight: 1.05,
    fontWeight: 400,
    margin: "28px 0 24px",
    color: "#F1E9DA",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 17,
    lineHeight: 1.7,
    color: "#B4AEC2",
    margin: "0 0 32px",
    maxWidth: 520,
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    color: "#D4B368",
    border: "none",
    padding: "10px 0",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    letterSpacing: 4,
    textTransform: "uppercase",
    cursor: "pointer",
    borderBottom: "1px solid #D4B368",
  },
  metaLine: {
    marginTop: 56,
    textAlign: "right",
    color: "#8A8398",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    maxWidth: 1200,
    marginLeft: "auto",
    marginRight: "auto",
  },
  metaSep: { color: "#C6A15B", margin: "0 10px" },
};

export default function StoryHero({ entry }) {
  return (
    <section style={styles.section}>
      <div style={styles.grid}>
        <div>
          <p style={styles.kickerRow}>
            <span style={styles.rule} />
            <span>A Story from the Living Archive</span>
            <span style={styles.rule} />
          </p>

          <h1 style={styles.title}>{entry.title}</h1>

          <p style={styles.description}>{entry.description}</p>

          <button type="button" style={styles.cta} aria-label="Read this story">
            Read This Story <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>

      {entry.category || entry.place || entry.contributor ? (
        <p style={styles.metaLine}>
          {entry.category || "—"}
          {entry.place ? (
            <>
              <span style={styles.metaSep}>•</span>
              Across {entry.place}
            </>
          ) : null}
          {entry.contributor ? (
            <>
              <span style={styles.metaSep}>•</span>
              Shared by {entry.contributor}
            </>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
