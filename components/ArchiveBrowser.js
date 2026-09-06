"use client";

// The "browse the archive" section beneath the hero. This implements only
// the eyebrow, title, subtitle, and the stacked list of stories from the
// mockup — the stat badges, category filters, search bar, and the "share
// a memory" banner aren't built yet. No icons: rows are plain text,
// matching the no-icon rule already applied to the nav/hero/entry cards.
// "use client" is required here for the <style jsx> block below.

const ROW_HEIGHT = 104;
const ROW_GAP = 14;
const VISIBLE_ROWS = 4;
const SNIPPET_WORD_LIMIT = 16;

// Truncates by word count rather than relying only on CSS overflow —
// descriptions vary wildly in length, and pixel-width ellipsis truncation
// shows a different amount of text per row depending on how wide its
// place tag happens to be, which reads as cramped/inconsistent.
function truncateSnippet(text) {
  const words = text.trim().split(/\s+/);
  if (words.length <= SNIPPET_WORD_LIMIT) return text;
  return `${words.slice(0, SNIPPET_WORD_LIMIT).join(" ")}...`;
}

const styles = {
  section: {
    backgroundColor: "#0D0812",
    minHeight: "100vh",
    width: "100%",
    // Same top padding as StoryHero — clears the fixed 90px NavBar.
    // Same side padding as StoryHero — keeps the columns aligned.
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    // Makes this a valid stop for <main>'s scroll-snap-type: y mandatory —
    // without this, a scroll gesture from the hero skips straight past
    // this section to the next one that has scroll-snap-align set.
    scrollSnapAlign: "start",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "0 0 1rem",
  },
  eyebrowLine: {
    height: 1,
    width: 32,
    backgroundColor: "rgba(197, 160, 89, 0.65)",
  },
  eyebrowText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
    fontSize: "2.75rem",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  subtitle: {
    fontSize: "1.05rem",
    color: "#BBAEBF",
    fontWeight: 300,
    lineHeight: 1.6,
    maxWidth: 640,
    margin: "0 0 2.5rem",
  },
  // Shows exactly VISIBLE_ROWS rows; the rest scroll into view — matches
  // the mockup's "5 stories in view" scrollable panel with a gold
  // scrollbar (see the <style jsx> block below for .archive-scroll).
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    paddingRight: "0.4rem",
    display: "flex",
    flexDirection: "column",
    gap: ROW_GAP,
    maxHeight: VISIBLE_ROWS * ROW_HEIGHT + (VISIBLE_ROWS - 1) * ROW_GAP,
    overflowY: "auto",
  },
  // border and backgroundColor live in the .archive-row stylesheet rule
  // below, not here — an inline style on this element would always beat
  // the .archive-row:hover stylesheet rule for the same properties, so
  // the hover effect would never be visible.
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.25rem",
    minHeight: ROW_HEIGHT,
    boxSizing: "border-box",
    padding: "1.1rem 1.4rem",
    borderRadius: 16,
    cursor: "pointer",
  },
  textCol: {
    minWidth: 0,
    flex: 1,
  },
  khmerTitle: {
    fontFamily: "'Kantumruy Pro', serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#D4AF37",
    margin: "0 0 0.2rem",
  },
  rowTitle: {
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#F5EFE6",
    margin: 0,
  },
  snippet: {
    fontSize: "0.88rem",
    color: "#8A7F91",
    margin: "0.3rem 0 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  place: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#BBAEBF",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
  },
};

export default function ArchiveBrowser({ stories }) {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>Open the Ledger</span>
        </p>

        <h2 style={styles.title}>Find a story to follow.</h2>
        <p style={styles.subtitle}>
          A living archive of Khmer legends, spirits, and the community
          memories that keep them alive.
        </p>

        <ul style={styles.list} className="archive-scroll">
          {stories.map((entry) => (
            <li key={entry.id} style={styles.row} className="archive-row">
              <div style={styles.textCol}>
                {entry.khmerTitle ? (
                  <p style={styles.khmerTitle}>{entry.khmerTitle}</p>
                ) : null}
                <h3 style={styles.rowTitle}>{entry.title}</h3>
                <p style={styles.snippet}>{truncateSnippet(entry.description)}</p>
              </div>

              {entry.place ? <span style={styles.place}>{entry.place}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {/* :hover and ::-webkit-scrollbar can't be expressed as inline
          styles — styled-jsx (built into Next.js) scopes real CSS to
          just this component without a separate stylesheet. */}
      <style jsx>{`
        .archive-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c5a059 rgba(255, 255, 255, 0.06);
        }
        .archive-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .archive-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
        }
        .archive-scroll::-webkit-scrollbar-thumb {
          background-color: #c5a059;
          border-radius: 8px;
        }
        .archive-row {
          border: 1px solid #2a172f;
          background-color: #120916;
          transition: background-color 150ms ease, border-color 150ms ease;
        }
        .archive-row:hover {
          background-color: #1d1024;
          border-color: #c5a059;
        }
      `}</style>
    </section>
  );
}
