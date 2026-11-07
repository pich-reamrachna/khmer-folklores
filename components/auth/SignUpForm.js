"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";
import { createClient } from "../../utils/supabase/client.js";
import { normalizeUsername, validateUsername } from "../../utils/username.js";
import styles, { underline } from "./authStyles.js";

// The sign-up form, inside the sign-in / sign-up box (AuthCard.js).
// `tabs` is the box's phone-only Sign In / Sign Up switch, shown above it;
// onGoToLogin switches the box to sign-in (from the "check your email" view).

// Should match the minimum configured in Supabase Auth (default 6).
const PASSWORD_MIN = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Underline colours double as the per-field validity indicator.
const BORDER = underline;

const INVALID_COLOR = "#E58B8B";
const CHECKING_COLOR = "#A89F91";
const VALID_COLOR = "#C5A059";

export default function SignUpForm({ tabs, onGoToLogin }) {
  const router = useRouter();
  const t = useTranslation();
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ username: false, email: false, password: false, confirmPassword: false });
  // null = not checked, "checking", true = free, false = taken.
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [error, setError] = useState("");
  // Once sign-up succeeds, the form is replaced by a confirmation view.
  const [signedUp, setSignedUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Synchronous guard: blocks a rapid second click before the disabled state
  // has re-rendered (the `submitting` state closure lags a render behind).
  const submittingRef = useRef(false);

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Field validity, recomputed each render.
  const usernameFormatKey = validateUsername(username.trim());
  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= PASSWORD_MIN;
  const confirmValid = confirmPassword === password;

  // Empty-but-touched flags as required; a field is only "touched" after blur
  // or a submit attempt, so this never nags while the form is still untouched.
  const required = { border: BORDER.invalid, message: t("fieldRequired"), color: INVALID_COLOR };

  // Each returns { border, message?, color? } for the indicator.
  const usernameStatus = () => {
    if (!touched.username) return { border: BORDER.neutral };
    if (username.trim() === "") return required;
    if (usernameFormatKey) return { border: BORDER.invalid, message: t(usernameFormatKey), color: INVALID_COLOR };
    if (usernameAvailable === "checking") return { border: BORDER.neutral, message: t("usernameChecking"), color: CHECKING_COLOR };
    if (usernameAvailable === false) return { border: BORDER.invalid, message: t("usernameTaken"), color: INVALID_COLOR };
    if (usernameAvailable === true) return { border: BORDER.valid, message: t("usernameFree"), color: VALID_COLOR };
    return { border: BORDER.neutral };
  };
  const emailStatus = () => {
    if (!touched.email) return { border: BORDER.neutral };
    if (email.trim() === "") return required;
    return emailValid ? { border: BORDER.valid } : { border: BORDER.invalid, message: t("emailInvalid"), color: INVALID_COLOR };
  };
  const passwordStatus = () => {
    if (!touched.password) return { border: BORDER.neutral };
    if (password === "") return required;
    return passwordValid ? { border: BORDER.valid } : { border: BORDER.invalid, message: t("passwordShort"), color: INVALID_COLOR };
  };
  const confirmStatus = () => {
    if (!touched.confirmPassword) return { border: BORDER.neutral };
    if (confirmPassword === "") return required;
    return confirmValid ? { border: BORDER.valid } : { border: BORDER.invalid, message: t("passwordMismatch"), color: INVALID_COLOR };
  };

  // Availability check on blur (only once the format is valid).
  const checkUsernameAvailability = async () => {
    markTouched("username");
    const u = username.trim();
    if (validateUsername(u)) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameAvailable("checking");
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username_normalized", normalizeUsername(u))
      .maybeSingle();
    setUsernameAvailable(data ? false : true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return; // guard against a double-submit race
    setError("");
    setTouched({ username: true, email: true, password: true, confirmPassword: true });

    if (usernameFormatKey || !emailValid || !passwordValid || !confirmValid) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const u = username.trim();

      // Availability pre-check (the unique index on the normalized username is
      // the race-safe backstop if two people grab it at once).
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username_normalized", normalizeUsername(u))
        .maybeSingle();
      if (taken) {
        setUsernameAvailable(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: u } },
      });

      // Deliberately generic — doesn't reveal whether the email is
      // already registered, the same information leak as a specific
      // login error, in the other direction.
      if (signUpError) {
        setError(t("authSignupError"));
        return;
      }

      // With email confirmation on, signUp() returns no session — swap to the
      // confirmation view. If confirmation is off, a session comes back and we
      // go straight home.
      if (!data.session) {
        setSignedUp(true);
        return;
      }
      router.push("/");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const uStatus = usernameStatus();
  const eStatus = emailStatus();
  const pStatus = passwordStatus();
  const cStatus = confirmStatus();

  // Small spaced capitals — off for Khmer text.
  const tracking = language === "km" ? styles.trackingNone : null;

  // One labelled, underlined field and its message slot (always there, so
  // a message appearing doesn't push the fields below — see authStyles).
  const field = (id, labelKey, status, inputProps, twoLines = false) => (
    <div style={styles.field}>
      <label style={{ ...styles.label, ...tracking }} htmlFor={id}>
        {t(labelKey)}
      </label>
      <input
        id={id}
        {...inputProps}
        style={{ ...styles.input, borderBottom: status.border }}
        className="auth-input"
        required
      />
      <p
        style={{ ...styles.message, ...(twoLines ? styles.messageSlotTwoLines : null), color: status.color }}
        aria-live="polite"
      >
        {status.message ?? ""}
      </p>
    </div>
  );

  // Once sign-up succeeds (with email confirmation on), the form gives way
  // to a "check your email" note.
  if (signedUp) {
    return (
      <div style={styles.form}>
        <h1 style={styles.title}>{t("authCheckEmailTitle")}</h1>
        <p style={{ ...styles.message, color: VALID_COLOR, fontSize: "1rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
          {t("authConfirmEmail")}
        </p>
        <button type="button" onClick={onGoToLogin} style={{ ...styles.button, ...tracking }} className="auth-button">
          {t("authGoToLogin")}
        </button>
      </div>
    );
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      {tabs}
      <h1 style={styles.title}>{t("authSignupTitle")}</h1>

      {field("signup-username", "authUsernameLabel", uStatus, {
        type: "text",
        value: username,
        onChange: (event) => {
          setUsername(event.target.value);
          setUsernameAvailable(null);
        },
        onBlur: checkUsernameAvailability,
        maxLength: 20,
        autoComplete: "username",
      }, true)}
      {field("signup-email", "authEmailLabel", eStatus, {
        type: "email",
        value: email,
        onChange: (event) => setEmail(event.target.value),
        onBlur: () => markTouched("email"),
        autoComplete: "email",
      })}
      {field("signup-password", "authPasswordLabel", pStatus, {
        type: "password",
        value: password,
        onChange: (event) => setPassword(event.target.value),
        onBlur: () => markTouched("password"),
        autoComplete: "new-password",
      })}
      {field("signup-confirm-password", "authConfirmPasswordLabel", cStatus, {
        type: "password",
        value: confirmPassword,
        onChange: (event) => setConfirmPassword(event.target.value),
        onBlur: () => markTouched("confirmPassword"),
        autoComplete: "new-password",
      })}

      {/* Reserved like the fields' slots, so a failed sign-up doesn't push
          the button down. */}
      <p style={{ ...styles.message, margin: "0 0 0.6rem" }} aria-live="polite">
        {error}
      </p>

      <button type="submit" style={{ ...styles.button, ...tracking }} className="auth-button" disabled={submitting}>
        {t("authSignupButton")}
      </button>
    </form>
  );
}
