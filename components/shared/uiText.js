"use client";

import { useLanguage } from "./LanguageContext.js";

// Static interface copy — nav links, button labels, section headings,
// placeholder text — as opposed to per-entry data (title/description/
// etc.), which uses pickText() in LanguageContext.js instead. Grouped by
// the component that renders each string.

const uiText = {
  // NavBar.js / Footer.js (shared) — kicker ("A Khmer Folklore Archive")
  // is deliberately not here: it's part of the fixed brand lockup in
  // both places, kept English always. navBrowseArchive/navShareMemory
  // are only used in Footer.js's own nav section now — NavBar.js's top
  // bar keeps its matching links hardcoded English for the same reason.
  navBrowseArchive: { en: "Browse the Archive", km: "រុករកបណ្ណសារ" },
  navShareMemory: { en: "Share a Memory", km: "ចែករំលែកការចងចាំ" },
  navOpenMenu: { en: "Open menu", km: "បើកម៉ឺនុយ" },
  navCloseMenu: { en: "Close menu", km: "បិទម៉ឺនុយ" },
  navChangeLanguage: { en: "Change language", km: "ប្ដូរភាសា" },

  // StoryHero.js — heroEyebrow ("A Story from the Living Archive") is
  // deliberately not here: a decorative label, kept English always.
  heroReadStory: { en: "Read This Story", km: "អានរឿងនេះ" },
  heroScrollCue: { en: "Scroll to open ledger", km: "អូសដើម្បីបើកសៀវភៅកត់ត្រា" },

  // ArchiveBrowser.js / ArchiveSearch.js — archiveEyebrow ("Open the
  // Ledger") is deliberately not here, same reason as heroEyebrow above.
  archiveTitle: { en: "Find a story to follow.", km: "ស្វែងរករឿងមួយដើម្បីតាមដាន។" },
  archiveSubtitle: {
    en: "A living archive of Khmer legends, spirits, and the community memories that keep them alive.",
    km: "បណ្ណសាររស់មួយនៃរឿងព្រេងខ្មែរ វិញ្ញាណ និងការចងចាំសហគមន៍ដែលរក្សាវាឲ្យនៅរស់។",
  },
  archiveStoriesInView: { en: "Stories in View", km: "រឿងកំពុងបង្ហាញ" },
  archiveNoResultsSuffix: { en: "does not match any stories.", km: "មិនត្រូវគ្នានឹងរឿងណាមួយឡើយ។" },
  searchPlaceholder: {
    en: "Search by name, place, or story",
    km: "ស្វែងរកតាមឈ្មោះ ទីកន្លែង ឬរឿង",
  },
  searchAriaLabel: { en: "Search stories", km: "ស្វែងរករឿង" },
  clearSearchAriaLabel: { en: "Clear search", km: "សម្អាតការស្វែងរក" },

  // BackButton.js
  goBack: { en: "Go Back", km: "ត្រឡប់ក្រោយ" },

  // StoryMemories.js — memoriesEyebrow ("Voices from the Community") is
  // deliberately not here, same reason as heroEyebrow above.
  memoriesTitle: { en: "What people remember.", km: "អ្វីដែលមនុស្សនៅចាំ។" },
  memoriesSubtitle: {
    en: "Each memory is a small lantern showing how folklore lives in daily Cambodian conversation.",
    km: "ការចងចាំនីមួយៗគឺជាចង្កៀងតូចមួយ បង្ហាញពីរបៀបដែលរឿងព្រេងនៅរស់ក្នុងការសន្ទនាប្រចាំថ្ងៃរបស់ខ្មែរ។",
  },
  memoriesTellingsCount: { en: "Tellings", km: "ការនិទាន" },

  // Footer.js
  footerNavHeading: { en: "Archive Navigation", km: "ការរុករកបណ្ណសារ" },
  footerAscendHeading: { en: "Ascend", km: "ឡើងលើ" },
  footerBackToTop: { en: "Back to top ↑", km: "ត្រឡប់ទៅលើ ↑" },
  footerCreditLine: { en: "Curated by", km: "ថែរក្សាដោយ" },
  footerSourceLine: { en: "Source:", km: "ប្រភព៖" },
  footerBuiltIn: {
    en: "Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026. This archive is under construction all semester. Come back in December.",
    km: "សាងសង់ក្នុងមុខវិជ្ជា ICT 340 — Vibe Coding សាកលវិទ្យាល័យអាមេរិកកាំងភ្នំពេញ រដូវស្លឹកឈើជ្រុះ ២០២៦។ បណ្ណសារនេះកំពុងសាងសង់ពេញមួយឆមាស។ សូមត្រឡប់មកម្ដងទៀតនៅខែធ្នូ។",
  },
};

// Falls back to English if a key or its Khmer translation is missing —
// same fallback spirit as pickText(), applied to static copy instead of
// per-entry data fields.
export function useTranslation() {
  const { language } = useLanguage();
  return (key) => uiText[key]?.[language] ?? uiText[key]?.en ?? key;
}
