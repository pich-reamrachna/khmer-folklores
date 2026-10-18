// Finds published stories that look like the one a contributor is about to
// share, so /share can point them at an existing story instead of letting
// them create a duplicate. Deliberately more forgiving than ArchiveBrowser's
// search (any word may match, small spelling differences are allowed): a
// wrong suggestion costs the user a glance, a missed one costs the archive a
// duplicate story.

const KHMER_RUN = /[ក-៿]+/g;
// Filler words that would match nearly every story.
const STOPWORDS = new Set(["the", "and", "of", "a", "an", "about", "story"]);

// NFC, minus invisible characters (pasted Khmer can carry them), lowercased.
function normalize(text) {
  let out = "";
  for (const ch of (text ?? "").normalize("NFC")) {
    const c = ch.codePointAt(0);
    if ((c >= 0x200b && c <= 0x200d) || c === 0xfeff || c === 0xad) continue;
    out += ch;
  }
  return out.toLowerCase();
}

// Latin words only — Khmer has no spaces between words, so it's matched by
// substring instead (see khmerRuns).
const latinWords = (text) => text.match(/[a-z0-9]+/g) ?? [];

// Khmer stretches of the query, ignoring single characters (which would
// match almost every Khmer text while the user is still typing).
const khmerRuns = (text) => (text.match(KHMER_RUN) ?? []).filter((run) => [...run].length >= 2);

// Number of single-letter edits (insert, delete, swap) to turn a into b.
function editDistance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

// Exact, a typed-so-far prefix ("nea" → "neang"), or a near-miss spelling.
// Tolerance grows with word length: short words must match exactly (or "cat"
// would match "bat"), while longer ones may differ by the letter or two that
// separates romanizations like "neak"/"nak".
function wordsMatch(q, w) {
  if (q === w) return true;
  if (q.length >= 3 && w.startsWith(q)) return true;
  const longer = Math.max(q.length, w.length);
  const allowed = longer >= 7 ? 2 : longer >= 4 ? 1 : 0;
  return allowed > 0 && Math.abs(q.length - w.length) <= allowed && editDistance(q, w) <= allowed;
}

// Returns up to `limit` stories, best match first. A hit in the title counts
// three times as much as a hit in the summary.
export function findSimilarStories(query, stories, limit = 5) {
  const q = normalize(query);
  const qWords = latinWords(q).filter((w) => !STOPWORDS.has(w));
  const qKhmer = khmerRuns(q);
  if (qWords.length === 0 && qKhmer.length === 0) return [];

  return stories
    .map((story) => {
      const title = normalize(`${story.title} ${story.khmerTitle ?? ""}`);
      const summary = normalize(`${story.summary ?? ""} ${story.summaryKhmer ?? ""}`);
      const titleWords = latinWords(title);
      const summaryWords = latinWords(summary);
      let score = 0;
      for (const qw of qWords) {
        if (titleWords.some((w) => wordsMatch(qw, w))) score += 3;
        else if (summaryWords.some((w) => wordsMatch(qw, w))) score += 1;
      }
      for (const run of qKhmer) {
        if (title.includes(run)) score += 3;
        else if (summary.includes(run)) score += 1;
      }
      return { story, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ story }) => story);
}
