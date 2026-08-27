// Draft entries for now — replace the placeholder values with real ones.
export const draftEntries = [
  {
    title: "Bramat Promong",
    description: "A story about a woman who comes to eat your inards if you don't take your naptime seriously.",
    contributor: "Rachna",
    place: "Phnom Penh",
    category: "Urban Legend",
  },
  {
    title: "Ahpt",
    description: "A story about a floating head of a woman who eat chickens at night.",
    contributor: "Numpang",
    place: "Prey Veng",
    category: "Urban Legend",
  },
];

const styles = {
  card: { padding: 24, backgroundColor: "#1C222C", border: "1px solid #2E3644", borderRadius: 10 },
  category: { fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 1, color: "#4fa3fd", margin: 0 },
  title: { fontSize: 22, fontWeight: 700, margin: "8px 0" },
  description: { fontSize: 15, lineHeight: 1.6, color: "#97A1B3", margin: "0 0 16px" },
  meta: { display: "flex", gap: 16, flexWrap: "wrap", margin: 0 },
};

export default function EntryCard({ entry }) {
  return (
    <article style={styles.card}>
      <p style={styles.category}>{entry.category.toUpperCase()}</p>
      <h2 style={styles.title}>{entry.title}</h2>
      <p style={styles.description}>{entry.description}</p>
      <p style={styles.meta}>
        <span>{entry.contributor}</span>
        <span aria-hidden="true">·</span>
        <span>{entry.place}</span>
      </p>
    </article>
  );
}