"use client";

// Draft entries for now — replace the placeholder values with real ones.
export const draftEntries = [
  {
    title: "Bramat Promong",
    description: "A story about a woman who comes to eat your inards if you don't take your naptime seriously. It's a story that is usually told to children to make them take their naps on time.",
    contributor: "Rachna",
    place: "Kampong Cham",
    category: "Legend",
  },
  {
    title: "Ahpt",
    description: "A story about a floating head of a woman who eat chickens at night. It is usually told mostly in the countryside that if you see a glowing orb at night, you will see a floating head of a woman who will eat your chickens.",
    contributor: "Numpang",
    place: "Prey Veng",
    category: "Legend",
  },
  {
    title: "Daun Penh's Curse",
    description: "There's a saying that in every Khmer wedding tradition, the groom must go to the Phnom Penh Pagod to pay respect to the founder of Phnom Penh, Daun Penh. If the groom does not do this, it is said that the groom will be cursed and will not have a happy marriage. However, the bride MUST not go to the pagoda with him for she will be cursed by Daun Penh. The reason is that Daun Penh was a woman who had her husband cheated on her, and she does not want to see a happy marriage for the groom and bride.",
    contributor: "Kimyou",
    place: "Phnom Penh",
    category: "Practices/Customary",
  },
  {
    title: "Crocodile Reincarnation",
    description: "Many cambodians believe in superstition, and this is one of them. It is said that if you sleep right after you just ate, in the next life, you will be reincarnated as a crocodile.",
    contributor: "Rachna's Mother",
    place: "Cambodia",
    category: "Superstition",
  },
  {
    title: "Neang Neath",
    description: "It is said that if you sleep under a banana tree, a ghost called Neak Neath will come and haunt you. She appears in a long white dress, holding her pregnant belly. It is said that she died during labor while her husband was away, which led to her to becoming a vengeful spirit.",
    contributor: "Grandmother",
    place: "Kandal",
    category: "Legend",
  }
];

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