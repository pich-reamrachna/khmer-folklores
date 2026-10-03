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

  // StoryHero.js — heroEyebrow ("Featured Stories of Khmer Folklores") is
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
  // These two Khmer strings are AI-drafted (like the auth section below) —
  // flag for the curator to review before relying on them.
  memoriesShareButton: { en: "Share Your Version", km: "ចែករំលែកការនិទានរបស់អ្នក" },
  memoriesLoginToast: { en: "Log in to contribute", km: "សូមចូលគណនីដើម្បីចូលរួម" },

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

  // app/login/page.js, app/signup/page.js. Khmer strings below are
  // AI-drafted, not written by the curator like the rest of this
  // file — flag for the curator to review/correct before relying on
  // them.
  authEmailLabel: { en: "Email", km: "អ៊ីមែល" },
  authPasswordLabel: { en: "Password", km: "ពាក្យសម្ងាត់" },
  authLoginTitle: { en: "Log In", km: "ចូលគណនី" },
  authLoginButton: { en: "Log In", km: "ចូលគណនី" },
  authLoginError: { en: "Invalid email or password", km: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ" },
  authSignupTitle: { en: "Sign Up", km: "បង្កើតគណនី" },
  authSignupButton: { en: "Sign Up", km: "បង្កើតគណនី" },
  authSignupError: { en: "Something went wrong. Try again.", km: "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។" },
  authConfirmEmail: { en: "A confirmation email has been sent to your account. Please confirm to log in.", km: "បានផ្ញើអ៊ីមែលបញ្ជាក់ទៅគណនីរបស់អ្នក។ សូមបញ្ជាក់ដើម្បីចូលគណនី។" },
  authCheckEmailTitle: { en: "Check your email", km: "ពិនិត្យអ៊ីមែលរបស់អ្នក" },
  authGoToLogin: { en: "Go to login", km: "ទៅកាន់ការចូលគណនី" },
  authUsernameLabel: { en: "Username", km: "ឈ្មោះអ្នកប្រើ" },
  usernameTaken: { en: "That username is taken. Try another.", km: "ឈ្មោះអ្នកប្រើនេះមានគេយករួចហើយ។ សូមជ្រើសមួយផ្សេងទៀត។" },
  usernameLength: { en: "Username must be 3–20 characters.", km: "ឈ្មោះអ្នកប្រើត្រូវមានពី 3 ទៅ 20 តួអក្សរ។" },
  usernameChars: { en: "Username can use only letters, numbers, Khmer, and underscores.", km: "ឈ្មោះអ្នកប្រើអនុញ្ញាតតែអក្សរ លេខ ខ្មែរ និងសញ្ញា _ ប៉ុណ្ណោះ។" },
  usernameEdges: { en: "Username can't start or end with an underscore.", km: "ឈ្មោះអ្នកប្រើមិនអាចចាប់ផ្ដើម ឬបញ្ចប់ដោយសញ្ញា _ បានទេ។" },
  usernameDouble: { en: "Username can't have two underscores in a row.", km: "ឈ្មោះអ្នកប្រើមិនអាចមានសញ្ញា _ ពីរជាប់គ្នាបានទេ។" },
  usernameChecking: { en: "Checking availability…", km: "កំពុងពិនិត្យ…" },
  usernameFree: { en: "Username is available.", km: "ឈ្មោះអ្នកប្រើនេះអាចប្រើបាន។" },
  emailInvalid: { en: "Enter a valid email address.", km: "សូមបញ្ចូលអ៊ីមែលឲ្យបានត្រឹមត្រូវ។" },
  passwordShort: { en: "Password must be at least 6 characters.", km: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ។" },

  // ContributeForm.js / ContributeModal.js / LocationSelect.js. Khmer strings
  // below are AI-drafted — flag for the curator to review before relying on
  // them. Templates use {min}/{max}/{n}, filled in at render.
  contributeEyebrow: { en: "Add your telling", km: "បន្ថែមការនិទានរបស់អ្នក" },
  contributeTitleLabel: { en: "Title", km: "ចំណងជើង" },
  contributeLocationLabel: { en: "Location", km: "ទីតាំង" },
  contributeStoryLabel: { en: "Your telling", km: "ការនិទានរបស់អ្នក" },
  contributePhotoLabel: { en: "Photo (optional)", km: "រូបថត (ស្រេចចិត្ត)" },
  contributePhotoHint: { en: "JPG, PNG, or WEBP · 5 MB max", km: "JPG, PNG, ឬ WEBP · អតិបរមា 5 MB" },
  contributeSubmit: { en: "Share your telling", km: "ចែករំលែកការនិទានរបស់អ្នក" },
  contributeSubmitting: { en: "Saving…", km: "កំពុងរក្សាទុក…" },
  contributeClose: { en: "Close", km: "បិទ" },
  contributeMinHint: { en: "(min {n})", km: "(យ៉ាងតិច {n})" },
  contributeTitleLenError: { en: "Title must be {min}–{max} characters.", km: "ចំណងជើងត្រូវមានពី {min} ទៅ {max} តួអក្សរ។" },
  contributeTitleCharError: { en: "Title contains characters that aren't allowed.", km: "ចំណងជើងមានតួអក្សរដែលមិនអនុញ្ញាត។" },
  contributeLocationError: { en: "Please choose a location.", km: "សូមជ្រើសរើសទីតាំង។" },
  contributeLocationInvalid: { en: "Please choose a location from the list.", km: "សូមជ្រើសរើសទីតាំងពីបញ្ជី។" },
  contributeStoryLenError: { en: "Story must be {min}–{max} characters.", km: "រឿងត្រូវមានពី {min} ទៅ {max} តួអក្សរ។" },
  contributeStoryCharError: { en: "Story contains characters that aren't allowed.", km: "រឿងមានតួអក្សរដែលមិនអនុញ្ញាត។" },
  contributePhotoSizeError: { en: "Photo must be 5 MB or smaller.", km: "រូបថតត្រូវមានទំហំ 5 MB ឬតិចជាងនេះ។" },
  contributePhotoTypeError: { en: "Photo must be a real JPG, PNG, or WEBP image.", km: "រូបថតត្រូវជា JPG, PNG, ឬ WEBP ពិតប្រាកដ។" },
  contributeSessionError: { en: "Your session has expired. Please log in again.", km: "វគ្គរបស់អ្នកបានផុតកំណត់។ សូមចូលគណនីម្តងទៀត។" },
  contributeSubmitError: { en: "Something went wrong saving your telling. Please try again.", km: "មានបញ្ហាក្នុងការរក្សាទុកការនិទានរបស់អ្នក។ សូមព្យាយាមម្តងទៀត។" },
  contributeNoUsername: { en: "Set up a username before contributing.", km: "សូមកំណត់ឈ្មោះអ្នកប្រើជាមុនសិន មុននឹងចូលរួម។" },
  locationPlaceholder: { en: "Search a province (English or Khmer)…", km: "ស្វែងរកខេត្ត (អង់គ្លេស ឬខ្មែរ)…" },
  locationNoMatch: { en: "No matching province", km: "រកមិនឃើញខេត្តត្រូវគ្នា" },
};

// Falls back to English if a key or its Khmer translation is missing —
// same fallback spirit as pickText(), applied to static copy instead of
// per-entry data fields.
export function useTranslation() {
  const { language } = useLanguage();
  return (key) => uiText[key]?.[language] ?? uiText[key]?.en ?? key;
}
