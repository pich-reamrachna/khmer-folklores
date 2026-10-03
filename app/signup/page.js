"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/shared/NavBar.js";
import { useTranslation } from "../../components/shared/uiText.js";
import authFormStyles from "../../components/shared/authFormStyles.js";
import { createClient } from "../../utils/supabase/client.js";
import { normalizeUsername, validateUsername } from "../../utils/username.js";

// Should match the minimum configured in Supabase Auth (default 6).
const PASSWORD_MIN = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Border colors double as the per-field validity indicator.
const BORDER = {
  neutral: "1px solid #2A172F",
  invalid: "1px solid #E58B8B",
  valid: "1px solid #C5A059",
};
const INVALID_COLOR = "#E58B8B";
const CHECKING_COLOR = "#8A7F91";
const VALID_COLOR = "#C5A059";

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslation();
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

  return (
    <>
      <NavBar />
      <section style={authFormStyles.section}>
        {signedUp ? (
          <div style={authFormStyles.form}>
            <h1 style={authFormStyles.title}>{t("authCheckEmailTitle")}</h1>
            <p style={{ ...authFormStyles.error, color: VALID_COLOR, fontSize: "1rem", lineHeight: 1.6 }}>
              {t("authConfirmEmail")}
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={authFormStyles.button}
              className="auth-button"
            >
              {t("authGoToLogin")}
            </button>
          </div>
        ) : (
          <form style={authFormStyles.form} onSubmit={handleSubmit} noValidate>
          <h1 style={authFormStyles.title}>{t("authSignupTitle")}</h1>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="signup-username">
              {t("authUsernameLabel")}
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameAvailable(null);
              }}
              onBlur={checkUsernameAvailability}
              style={{ ...authFormStyles.input, border: uStatus.border }}
              className="auth-input"
              maxLength={20}
              autoComplete="username"
              required
            />
            {uStatus.message ? (
              <p style={{ ...authFormStyles.error, color: uStatus.color }}>{uStatus.message}</p>
            ) : null}
          </div>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="signup-email">
              {t("authEmailLabel")}
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => markTouched("email")}
              style={{ ...authFormStyles.input, border: eStatus.border }}
              className="auth-input"
              autoComplete="email"
              required
            />
            {eStatus.message ? (
              <p style={{ ...authFormStyles.error, color: eStatus.color }}>{eStatus.message}</p>
            ) : null}
          </div>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="signup-password">
              {t("authPasswordLabel")}
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => markTouched("password")}
              style={{ ...authFormStyles.input, border: pStatus.border }}
              className="auth-input"
              autoComplete="new-password"
              required
            />
            {pStatus.message ? (
              <p style={{ ...authFormStyles.error, color: pStatus.color }}>{pStatus.message}</p>
            ) : null}
          </div>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="signup-confirm-password">
              {t("authConfirmPasswordLabel")}
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              style={{ ...authFormStyles.input, border: cStatus.border }}
              className="auth-input"
              autoComplete="new-password"
              required
            />
            {cStatus.message ? (
              <p style={{ ...authFormStyles.error, color: cStatus.color }}>{cStatus.message}</p>
            ) : null}
          </div>

          {error ? <p style={authFormStyles.error}>{error}</p> : null}

          <button type="submit" style={authFormStyles.button} className="auth-button" disabled={submitting}>
            {t("authSignupButton")}
          </button>
          </form>
        )}
      </section>

      {/* :focus/:hover can't be expressed as inline styles — see
          authFormStyles.js for why box-shadow/opacity live here. The border
          color (the validity indicator) stays inline and dynamic, a different
          property from the focus box-shadow, so they don't collide. */}
      <style jsx>{`
        .auth-input:focus {
          box-shadow: 0 0 0 2px rgba(197, 160, 89, 0.55);
        }
        .auth-button:hover {
          opacity: 0.85;
        }
        .auth-button:disabled {
          opacity: 0.55;
          cursor: default;
        }
      `}</style>
    </>
  );
}
