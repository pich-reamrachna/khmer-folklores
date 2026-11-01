// Finds Khmer typed in an order phones can't draw. A common way of typing
// some vowels is to build them from two pieces that look right on many
// computers — e.g. េ + ី for ើ, or ុ + ី for ៊ី — but phones' text engines
// treat the pair as invalid and draw a dotted circle (◌) in the gap.
// The rules are Khmer's own spelling order (Unicode's): a syllable has at
// most one dependent vowel, after any subscript (្) and register shifter
// (៉ ៊), and a vowel or sign never starts a word on its own.
//
// Nothing here changes anyone's text: the form shows the word and, where
// there's only one right answer, the corrected spelling, and the writer
// retypes it. supabase/khmer-order.sql enforces the same rules in the
// database.
//
// Code points are written as numbers (like the invisible-character check in
// ContributeForm.js), so the rules can't be garbled by copy-paste.

const isVowel = (c) => c >= 0x17b6 && c <= 0x17c5; // dependent vowels ា … ៅ
const isMark = (c) => c >= 0x17b6 && c <= 0x17d3; // vowels, signs, ្, ៓
const COENG = 0x17d2; // ្ (subscript)
const SHIFTERS = [0x17c9, 0x17ca]; // ៉ ៊
const ABOVE_I = [0x17b7, 0x17b8, 0x17b9, 0x17ba]; // ិ ី ឹ ឺ

// Consonants that take ៊ or ៉ when an above vowel follows. People type ុ
// instead, because that's how ៊ / ៉ look under an above vowel.
const TAKES_TRIISAP = [0x179f, 0x17a0, 0x17a2]; // ស ហ អ → ៊
const TAKES_MUUSIKATOAN = [0x1784, 0x1789, 0x1798, 0x1799, 0x179a, 0x179c]; // ង ញ ម យ រ វ → ៉

// True if this word breaks the spelling order.
function hasOrderProblem(word) {
  const cps = [...word].map((ch) => ch.codePointAt(0));
  if (cps.length && isMark(cps[0])) return true;
  for (let i = 0; i < cps.length - 1; i++) {
    const next = cps[i + 1];
    if (isVowel(cps[i]) && (isVowel(next) || next === COENG || SHIFTERS.includes(next))) return true;
  }
  return false;
}

// The corrected spelling for the common, unambiguous cases (េ+ី → ើ,
// េ+ា → ោ, ុ+above vowel → ៊/៉ by consonant), or null when there isn't one
// sure answer — then the writer just gets told which word to retype.
function suggestFix(word) {
  const cps = [...word].map((ch) => ch.codePointAt(0));
  const out = [];
  for (let i = 0; i < cps.length; i++) {
    const c = cps[i];
    const next = cps[i + 1];
    if (c === 0x17c1 && next === 0x17b8) { out.push(0x17be); i++; continue; } // េ ី → ើ
    if (c === 0x17c1 && next === 0x17b6) { out.push(0x17c4); i++; continue; } // េ ា → ោ
    if (c === 0x17bb && ABOVE_I.includes(next)) {
      const base = out[out.length - 1];
      if (TAKES_TRIISAP.includes(base)) { out.push(0x17ca, next); i++; continue; }
      if (TAKES_MUUSIKATOAN.includes(base)) { out.push(0x17c9, next); i++; continue; }
    }
    out.push(c);
  }
  const fixed = String.fromCodePoint(...out);
  return hasOrderProblem(fixed) ? null : fixed;
}

// Every word in `text` (split on spaces) with an order problem, once each:
// [{ word, fix }] — fix is the corrected spelling, or null.
export function findKhmerOrderProblems(text) {
  const seen = new Set();
  const problems = [];
  for (const word of text.split(/\s+/)) {
    if (!word || seen.has(word) || !hasOrderProblem(word)) continue;
    seen.add(word);
    problems.push({ word, fix: suggestFix(word) });
  }
  return problems;
}
