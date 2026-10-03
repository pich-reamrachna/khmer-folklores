// Username rules, shared by the signup form and (for the availability check)
// matched by the DB's normalize_username() function. Allowed: Latin letters,
// digits, underscore, and Khmer; length 3–20; no leading/trailing underscore;
// no double underscore. Case-insensitive, and Khmer look-alikes are folded,
// so uniqueness can't be dodged with a visually identical name.

// Canonical form used for uniqueness: NFC, strip invisible chars, fold the
// look-alike coeng-TA (U+178F) to coeng-DA (U+178A), lowercase. Must mirror
// the SQL normalize_username(). Code points (not a regex of literal invisible
// chars) keep it readable and exact.
export function normalizeUsername(value) {
  let out = "";
  for (const ch of value.trim().normalize("NFC")) {
    const c = ch.codePointAt(0);
    if ((c >= 0x200b && c <= 0x200d) || c === 0xfeff || c === 0xad) continue;
    out += c === 0x178f ? String.fromCodePoint(0x178a) : ch;
  }
  return out.toLowerCase();
}

// Returns a uiText error key if invalid, or null if the username is allowed.
export function validateUsername(value) {
  const u = value.trim();
  const length = [...u].length;
  if (length < 3 || length > 20) return "usernameLength";
  // Latin letters/digits/underscore + the Khmer block (ក–៿). Anything else —
  // spaces, @, punctuation, emoji, invisible/control chars — is rejected.
  if (!/^[A-Za-z0-9_ក-៿]+$/u.test(u)) return "usernameChars";
  if (u.startsWith("_") || u.endsWith("_")) return "usernameEdges";
  if (u.includes("__")) return "usernameDouble";
  return null;
}
