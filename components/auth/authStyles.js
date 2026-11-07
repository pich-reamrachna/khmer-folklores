// Shared styles for the sign-in / sign-up box (AuthCard.js) and its two
// forms (SignInForm.js, SignUpForm.js). Same idea as shared/authFormStyles.js
// and review/reviewStyles.js: one style file, used by both forms, so they
// can't drift apart. The box's own sliding layout lives in AuthCard.js's
// plain <style> tag — it changes with the switch and on phone, which inline
// styles can't do.

import authFormStyles from "../shared/authFormStyles.js";

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";

const authStyles = {
  // The page: the home hero's rustic charcoal texture, with the box centred
  // under the fixed 90px NavBar.
  section: {
    minHeight: "100vh",
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1817",
    backgroundImage: "url(/rustic-charcoal.webp)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  form: {
    width: "100%",
    maxWidth: 360,
    display: "flex",
    flexDirection: "column",
  },
  // Phone only (AuthCard.js's .auth-tabs rule shows them): small Sign In /
  // Sign Up tabs above the form, since there's no room for the slide there.
  tabs: {
    gap: "1.75rem",
    marginBottom: "2rem",
  },
  // Small spaced capitals; the current tab is bright with a gold underline.
  // The other tab's colour (and its hover) lives in app/globals.css's
  // .auth-tab rule. letterSpacing pries apart Khmer glyph clusters —
  // trackingNone below.
  tab: {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid transparent",
    padding: "0 0 0.55rem",
    cursor: "pointer",
    fontFamily: khmerSans,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  tabActive: {
    color: "#F5EFE6",
    borderBottom: "1px solid #C5A059",
  },
  title: {
    fontFamily: "var(--font-fell), var(--font-khmer), serif",
    fontSize: "clamp(2.2rem, 3.2vw, 2.8rem)",
    fontWeight: 400,
    lineHeight: 1.1,
    margin: "0 0 1.75rem",
  },
  // Tighter than it looks: each field ends in a message slot (below), which
  // adds its own reserved line of space.
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "0.7rem",
  },
  label: {
    fontFamily: khmerSans,
    fontSize: "0.66rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#A89F91",
  },
  // Underline-only fields. Each form sets borderBottom (one of `underline`
  // below — it doubles as the validity indicator); the focus glow lives in
  // AuthCard.js's <style> tag.
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "transparent",
    border: "none",
    padding: "0.5rem 0 0.55rem",
    color: "#F5EFE6",
    fontFamily: "var(--font-fell), var(--font-khmer), serif",
    fontSize: "1.15rem",
    outline: "none",
  },
  // A field's message under its underline (required, taken, too short…),
  // and the form-wide error above the button. The slot is always there,
  // empty until there's something to say, with room for one line (two for
  // username — see `messageSlotTwoLines`) — so a message appearing never
  // pushes the fields below it down.
  message: {
    ...authFormStyles.error,
    fontSize: "0.8rem",
    lineHeight: 1.35,
    minHeight: "1.35em",
    marginTop: "0.45rem",
  },
  // Username's longest message ("…letters, numbers, Khmer, and
  // underscores.") wraps to two lines at the form's width.
  messageSlotTwoLines: {
    minHeight: "2.7em",
  },
  // Square, full-width gold button in small spaced capitals. Hover and the
  // disabled look live in AuthCard.js's <style> tag (.auth-button).
  button: {
    ...authFormStyles.button,
    marginTop: "0.6rem",
    borderRadius: 2,
    padding: "1rem",
    fontSize: "0.72rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  trackingNone: {
    letterSpacing: "normal",
  },
  // Wraps a form's fields and button: disabled while it's sending, which
  // locks every field and the button at once. Reset to look like nothing.
  lock: {
    border: "none",
    margin: 0,
    padding: 0,
    minWidth: 0,
  },
};

// The fields' underline colours: resting, invalid, valid.
export const underline = {
  neutral: "1px solid rgba(245, 239, 230, 0.22)",
  invalid: "1px solid #E58B8B",
  valid: "1px solid #C5A059",
};

export default authStyles;
