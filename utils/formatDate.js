// "2026-09-26" → "September 26, 2026" / "26 កញ្ញា 2026". Shared by the story
// page's first telling (FirstTelling.js) and its comments (StoryMemories.js).
//
// Manual month names, not toLocaleDateString("km-KH", ...) — Khmer locale
// data isn't reliably bundled across browsers (Intl.DateTimeFormat
// .supportedLocalesOf(["km"]) returns empty in some Chrome builds), which
// silently falls back to English. This also sidesteps Date's UTC-midnight
// parsing of "YYYY-MM-DD" shifting the day in timezones behind UTC.
const MONTH_NAMES = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  km: ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"],
};

export function formatDate(dateString, language) {
  const [year, month, day] = dateString.split("-").map(Number);
  const monthName = MONTH_NAMES[language][month - 1];
  return language === "km" ? `${day} ${monthName} ${year}` : `${monthName} ${day}, ${year}`;
}
