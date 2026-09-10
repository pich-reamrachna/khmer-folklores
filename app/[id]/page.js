import { notFound } from "next/navigation";
import stories from "../../data/entries.js";
import NavBar from "../../components/NavBar.js";
import StoryMemories from "../../components/StoryMemories.js";

// First section of a story's dedicated page: eyebrow (category • place),
// optional Khmer title, English title, and the full description. No
// image/graphic/shape and no "share what you heard" button — those belong
// to later sections that aren't built yet.

const styles = {
  section: {
    minHeight: "100vh",
    width: "100%",
    // Top padding clears the fixed 90px NavBar, matching StoryHero/ArchiveBrowser.
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    backgroundColor: "#08040A",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
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
  khmerTitle: {
    fontFamily: "'Kantumruy Pro', serif",
    fontSize: "2.2rem",
    fontWeight: 600,
    color: "#D4AF37",
    letterSpacing: "0.04em",
    margin: "0 0 0.5rem",
  },
  title: {
    fontFamily: "'Cinzel', serif, 'Times New Roman'",
    fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
    margin: "0 0 1.5rem",
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

export default async function StoryPage({ params }) {
  const { id } = await params;
  const story = stories.find((s) => s.id === id);

  if (!story) {
    notFound();
  }

  const entry = { ...story, ...story.versions[0] };

  return (
    <>
      <NavBar />
      <section style={styles.section}>
        <div style={styles.container}>
          <p style={styles.eyebrow}>
            <span style={styles.eyebrowLine} />
            <span style={styles.eyebrowText}>
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
      </section>

      <StoryMemories versions={story.versions} />
    </>
  );
}
