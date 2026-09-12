import BackButton from "../shared/BackButton.js";

// First section of a story's dedicated page: eyebrow (category • place),
// optional Khmer title, English title, and the full description. No
// image/graphic/shape and no "share what you heard" button — those belong
// to later sections that aren't built yet.

const styles = {
  section: {
    width: "100%",
    // Top padding clears the fixed 90px NavBar, matching StoryHero/ArchiveBrowser.
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    backgroundColor: "#08040A",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
  },
  backButton: {
    margin: "0 0 2rem",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "0 0 2rem",
  },
  eyebrowLine: {
    height: 1,
    width: 48,
    backgroundColor: "rgba(197, 160, 89, 0.65)",
  },
  eyebrowText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  // overflowWrap: Khmer script often has no spaces to break on, so a long
  // khmerTitle is effectively one unbreakable word without this.
  khmerTitle: {
    fontFamily: "'Kantumruy Pro', serif",
    fontSize: "2.2rem",
    fontWeight: 600,
    color: "#D4AF37",
    letterSpacing: "0.04em",
    margin: "0 0 0.5rem",
    overflowWrap: "break-word",
  },
  // overflowWrap: lets a single long word (e.g. "Reincarnation") break
  // instead of overflowing the page at the clamp's smallest size.
  title: {
    fontFamily: "var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
    margin: "0 0 1.5rem",
    overflowWrap: "break-word",
  },
  description: {
    fontSize: "1.05rem",
    color: "#BBAEBF",
    fontWeight: 300,
    lineHeight: 1.7,
    maxWidth: 680,
    margin: 0,
  },
};

export default function StoryDetails({ entry }) {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.backButton}>
          <BackButton />
        </div>

        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText} className="details-eyebrow-text">
            {entry.category}
            {entry.category && entry.place ? " • " : ""}
            {entry.place}
          </span>
          <span style={styles.eyebrowLine} />
        </p>

        {entry.khmerTitle ? (
          <div style={styles.khmerTitle}>{entry.khmerTitle}</div>
        ) : null}

        <h1 style={styles.title}>{entry.title}</h1>

        <p style={styles.description}>{entry.description}</p>
      </div>

      {/* Plain <style>, not <style jsx> — its CSS text renders straight into
          the server-rendered HTML, so this phone truncation is correct from
          the first paint instead of only after hydration. */}
      <style>{`
        @media (max-width: 640px) {
          .details-eyebrow-text {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
    </section>
  );
}
