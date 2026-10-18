// data/categories.js
//
// The fixed list a new story's category is chosen from. Must stay in sync
// with submit_story() in Supabase, which only accepts these English names and
// fills in category_khmer itself — so the Khmer here is for display only.
const categories = [
  { en: "Legend", km: "រឿងព្រេង" },
  { en: "Practices/Customary", km: "ទំនៀមទម្លាប់" },
  { en: "Superstition", km: "ជំនឿអបិយមន្ត" },
];

export default categories;
