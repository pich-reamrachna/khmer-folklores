// "2026-09-26" → "September 26, 2026" / "26 កញ្ញា 2026". Shared by every
// page that shows a date: the story page, /my-entries and /review.
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

// The database stores timestamps in UTC, but the archive's day is Cambodia's:
// slicing the UTC string would date anything shared before 7am in Phnom Penh
// to the day before. Cambodia is UTC+7 all year (no daylight saving), so its
// calendar day is the UTC time plus 7 hours — no timezone data needed.
// "2026-10-23T23:00:00+00:00" (6am, Oct 24 in Phnom Penh) → "2026-10-24".
const CAMBODIA_OFFSET_MS = 7 * 60 * 60 * 1000;
export function cambodiaDate(timestamp) {
  return new Date(Date.parse(timestamp) + CAMBODIA_OFFSET_MS).toISOString().slice(0, 10);
}

// A database timestamp straight to its readable Cambodian date.
export function formatTimestamp(timestamp, language) {
  return formatDate(cambodiaDate(timestamp), language);
}
