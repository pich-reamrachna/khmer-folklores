"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";
import { createClient } from "../../utils/supabase/client.js";
import styles, { underline } from "./authStyles.js";

// The sign-in form, inside the sign-in / sign-up box (AuthCard.js).
// `tabs` is the box's phone-only Sign In / Sign Up switch, shown above it.

const INVALID_COLOR = "#E58B8B";

// Where to go after logging in: the ?next= path when the link that sent the
// user here asked to come back (e.g. /share's "Log in"), otherwise home.
// Only same-site paths are accepted — "/share" yes, but "https://..." or
// "//other.site" (which browsers treat as another site) fall back to home, so
// a crafted login link can't send someone off-site right after they log in.
// Read from window.location at submit time rather than useSearchParams,
// which would need a Suspense boundary around this whole page.
function safeNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}

export default function SignInForm({ tabs }) {
  const router = useRouter();
  const t = useTranslation();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState("");

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // In-app required indicator (same pattern as the sign-up form). We don't
  // validate the email format here — login accepts whatever's on file — only
  // that both fields are filled before hitting Supabase.
  const emailEmpty = touched.email && email.trim() === "";
  const passwordEmpty = touched.password && password === "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setTouched({ email: true, password: true });

    if (email.trim() === "" || password === "") return;

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Deliberately generic — doesn't reveal whether the email exists or
    // the password was wrong, so a failed login can't be used to check
    // which accounts are registered.
    if (signInError) {
      setError(t("authLoginError"));
      return;
    }

    router.push(safeNextPath());
  };

  // Small spaced capitals — off for Khmer text.
  const tracking = language === "km" ? styles.trackingNone : null;

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      {tabs}
      <h1 style={styles.title}>{t("authLoginTitle")}</h1>

      <div style={styles.field}>
        <label style={{ ...styles.label, ...tracking }} htmlFor="login-email">
          {t("authEmailLabel")}
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => markTouched("email")}
          style={{ ...styles.input, borderBottom: emailEmpty ? underline.invalid : underline.neutral }}
          className="auth-input"
          autoComplete="email"
          required
        />
        <p style={{ ...styles.message, color: INVALID_COLOR }} aria-live="polite">
          {emailEmpty ? t("fieldRequired") : ""}
        </p>
      </div>

      <div style={styles.field}>
        <label style={{ ...styles.label, ...tracking }} htmlFor="login-password">
          {t("authPasswordLabel")}
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => markTouched("password")}
          style={{ ...styles.input, borderBottom: passwordEmpty ? underline.invalid : underline.neutral }}
          className="auth-input"
          autoComplete="current-password"
          required
        />
        <p style={{ ...styles.message, color: INVALID_COLOR }} aria-live="polite">
          {passwordEmpty ? t("fieldRequired") : ""}
        </p>
      </div>

      {/* Reserved like the fields' slots, so a failed sign-in doesn't push
          the button down. */}
      <p style={{ ...styles.message, margin: "0 0 0.6rem" }} aria-live="polite">
        {error}
      </p>

      <button type="submit" style={{ ...styles.button, ...tracking }} className="auth-button">
        {t("authLoginButton")}
      </button>
    </form>
  );
}
