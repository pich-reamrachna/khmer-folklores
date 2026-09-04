// data/entries.js
//
// Each story is a shared topic. Different contributors can each add their
// own telling of the same story, so each story holds an array of versions.
// If a story only has one telling, its version array holds exactly one item.
// A story always has at least one version — never zero versions.
//
// Fields
// ──────────────────────────────────
// Story-level (shared by every version):
//   id         – unique slug derived from the English title
//   title      – the story's English name
//   category   – e.g. Legend, Superstition, Practices/Customary
//   khmerTitle – optional Khmer-script title (absent until contributed)
//   versions[] – array of tellings, each with:
//     contributor – the person who told this version
//     place       – where this telling comes from
//     description – what happens in this version
//
// The data below is migrated from the old flat draftEntries array.
// Each former entry becomes a separate story with exactly one version,
// because every entry had a unique title/contributor/place. No two
// entries shared a story topic, so no grouping was possible.

const stories = [
  {
    id: "bramat-promong",
    title: "Bramat Promong",
    category: "Legend",
    versions: [
      {
        contributor: "Rachna",
        place: "Kampong Cham",
        description:
          "A story about a woman who comes to eat your inards if you don't take your naptime seriously. It's a story that is usually told to children to make them take their naps on time.",
      },
    ],
  },
  {
    id: "ahpt",
    title: "Ahpt",
    category: "Legend",
    versions: [
      {
        contributor: "Numpang",
        place: "Prey Veng",
        description:
          "A story about a floating head of a woman who eat chickens at night. It is usually told mostly in the countryside that if you see a glowing orb at night, you will see a floating head of a woman who will eat your chickens.",
      },
    ],
  },
  {
    id: "daun-penhs-curse",
    title: "Daun Penh's Curse",
    category: "Practices/Customary",
    versions: [
      {
        contributor: "Kimyou",
        place: "Phnom Penh",
        description:
          "There's a saying that in every Khmer wedding tradition, the groom must go to the Phnom Penh Pagod to pay respect to the founder of Phnom Penh, Daun Penh. If the groom does not do this, it is said that the groom will be cursed and will not have a happy marriage. However, the bride MUST not go to the pagoda with him for she will be cursed by Daun Penh. The reason is that Daun Penh was a woman who had her husband cheated on her, and she does not want to see a happy marriage for the groom and bride.",
      },
    ],
  },
  {
    id: "crocodile-reincarnation",
    title: "Crocodile Reincarnation",
    category: "Superstition",
    versions: [
      {
        contributor: "Rachna's Mother",
        place: "Cambodia",
        description:
          "Many cambodians believe in superstition, and this is one of them. It is said that if you sleep right after you just ate, in the next life, you will be reincarnated as a crocodile.",
      },
    ],
  },
  {
    id: "neang-neath",
    title: "Neang Neath",
    category: "Legend",
    versions: [
      {
        contributor: "Grandmother",
        place: "Kandal",
        description:
          "It is said that if you sleep under a banana tree, a ghost called Neak Neath will come and haunt you. She appears in a long white dress, holding her pregnant belly. It is said that she died during labor while her husband was away, which led to her to becoming a vengeful spirit.",
      },
    ],
  },
];

export default stories;