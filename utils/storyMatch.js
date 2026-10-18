// Finds published stories that look like the one a contributor is about to
// share, so /share can point them at an existing story instead of letting
// them create a duplicate. Two tiers: stories matching every typed word are
// shown as results; failing that, the closest partial or near-miss spelling
// is offered as "Did you mean …?" — a guess is labelled as a guess, but a
// misspelled name still leads to the existing story.

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

// How well query word q matches word w: 2 for exact or a typed-so-far prefix
// ("nea" → "neang"), 1 for a near-miss spelling, 0 for no match. Near-misses
// score lower so a real word match outranks a lookalike — for "neang neak",
// Neang Neath (exact "neang") is the suggestion, not Boeung Yeak Lorm
// ("neak" ≈ "yeak").
// Tolerance grows with word length: short words must match exactly (or "cat"
// would match "bat"), while longer ones may differ by the letter or two that
// separates romanizations like "neak"/"nak".
function matchStrength(q, w) {
  if (q === w) return 2;
  if (q.length >= 3 && w.startsWith(q)) return 2;
  const longer = Math.max(q.length, w.length);
  const allowed = longer >= 7 ? 2 : longer >= 4 ? 1 : 0;
  const near = allowed > 0 && Math.abs(q.length - w.length) <= allowed && editDistance(q, w) <= allowed;
  return near ? 1 : 0;
}

// The strongest match q has against any of `words`.
const bestStrength = (q, words) => words.reduce((best, w) => Math.max(best, matchStrength(q, w)), 0);

// Scores one story against the query. `exact` is true only when every query
// word matches exactly (or as a prefix) and every Khmer run appears — that
// story is a real match. `score` ranks stories, including partial and
// near-miss ones: each query word scores once, from where it matches best —
// title hits count three times as much as summary hits, a near-miss spelling
// half as much as an exact match (title 6 / 3, summary 2 / 1). Khmer runs
// only match exactly (title 6, summary 2).
function scoreStory(story, qWords, qKhmer) {
  const title = normalize(`${story.title} ${story.khmerTitle ?? ""}`);
  const summary = normalize(`${story.summary ?? ""} ${story.summaryKhmer ?? ""}`);
  const titleWords = latinWords(title);
  const summaryWords = latinWords(summary);
  let score = 0;
  let exact = true;
  for (const qw of qWords) {
    const inTitle = bestStrength(qw, titleWords);
    const inSummary = bestStrength(qw, summaryWords);
    score += Math.max(3 * inTitle, inSummary);
    if (inTitle < 2 && inSummary < 2) exact = false;
  }
  for (const run of qKhmer) {
    if (title.includes(run)) score += 6;
    else if (summary.includes(run)) score += 2;
    else exact = false;
  }
  return { story, score, exact };
}

// Searches for the story a contributor is about to share. Returns:
// - matches: up to `limit` stories where every typed word matches, best first.
// - suggestion: only when there are no matches — the single best partial or
//   near-miss story, for a "Did you mean …?" prompt (null if nothing is close).
// Words under 3 letters are skipped, like the filler words: they'd match
// almost anything, and skipping them keeps a half-typed last word
// ("neang ne") from knocking out a real match while the user is typing.
export function searchStories(query, stories, limit = 5) {
  const ranked = rankStories(query, stories);
  const matches = ranked.filter(({ exact }) => exact).slice(0, limit).map(({ story }) => story);
  const suggestion = matches.length === 0 && ranked.length > 0 ? ranked[0].story : null;
  return { matches, suggestion };
}

// The single closest story to the query, exact or not (null if nothing is
// close). For a search with its own, stricter matching — the home page's
// ArchiveBrowser — that found nothing and wants a "Did you mean …?".
export function closestStory(query, stories) {
  return rankStories(query, stories)[0]?.story ?? null;
}

// Every story with any score, best first. Stable sort, so a tie keeps the
// stories' original order.
function rankStories(query, stories) {
  const q = normalize(query);
  const qWords = latinWords(q).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const qKhmer = khmerRuns(q);
  if (qWords.length === 0 && qKhmer.length === 0) return [];

  return stories
    .map((story) => scoreStory(story, qWords, qKhmer))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}
