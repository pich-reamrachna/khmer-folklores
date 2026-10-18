"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/shared/NavBar.js";
import { useTranslation } from "../../components/shared/uiText.js";
import authFormStyles from "../../components/shared/authFormStyles.js";
import { createClient } from "../../utils/supabase/client.js";
import CandleGlow from "../../components/shared/CandleGlow.js";
import InputIcon from "../../components/shared/InputIcon.js";

// Lays the candle and the form side by side; the form keeps its own
// maxWidth from authFormStyles.
const pageStyles = {
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4rem",
    width: "100%",
    maxWidth: 820,
  },
  // Anchors each field's InputIcon to the left end of its input.
  inputWrap: {
    position: "relative",
  },
  // Room on the left for the icon, so typed text starts after it.
  inputWithIcon: {
    paddingLeft: "2.75rem",
  },
};

// Border doubles as the validity indicator, same as the signup page.
const BORDER_NEUTRAL = "1px solid #2A172F";
const BORDER_INVALID = "1px solid #E58B8B";
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

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState("");

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // In-app required indicator (same pattern as the signup page). We don't
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

  return (
    <>
      <NavBar />
      <section style={authFormStyles.section}>
        {/* Candle on the left, form on the right; CandleGlow hides itself
            on phone, leaving the form alone and centred. */}
        <div style={pageStyles.row}>
          <CandleGlow />
          <form style={authFormStyles.form} onSubmit={handleSubmit} noValidate>
            <h1 style={authFormStyles.title}>{t("authLoginTitle")}</h1>

            <div style={authFormStyles.field}>
              <label style={authFormStyles.label} htmlFor="login-email">
                {t("authEmailLabel")}
              </label>
              <div style={pageStyles.inputWrap}>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => markTouched("email")}
                  style={{ ...authFormStyles.input, ...pageStyles.inputWithIcon, border: emailEmpty ? BORDER_INVALID : BORDER_NEUTRAL }}
                  className="auth-input"
                  autoComplete="email"
                  required
                />
                <InputIcon src="/icons/mail.png" />
              </div>
              {emailEmpty ? (
                <p style={{ ...authFormStyles.error, color: INVALID_COLOR }}>{t("fieldRequired")}</p>
              ) : null}
            </div>

            <div style={authFormStyles.field}>
              <label style={authFormStyles.label} htmlFor="login-password">
                {t("authPasswordLabel")}
              </label>
              <div style={pageStyles.inputWrap}>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => markTouched("password")}
                  style={{ ...authFormStyles.input, ...pageStyles.inputWithIcon, border: passwordEmpty ? BORDER_INVALID : BORDER_NEUTRAL }}
                  className="auth-input"
                  autoComplete="current-password"
                  required
                />
                <InputIcon src="/icons/padlock.png" />
              </div>
              {passwordEmpty ? (
                <p style={{ ...authFormStyles.error, color: INVALID_COLOR }}>{t("fieldRequired")}</p>
              ) : null}
            </div>

            {error ? <p style={authFormStyles.error}>{error}</p> : null}

            <button type="submit" style={authFormStyles.button} className="auth-button">
              {t("authLoginButton")}
            </button>
          </form>
        </div>
      </section>

      {/* :focus/:hover can't be expressed as inline styles — see
          authFormStyles.js for why backgroundColor/border stay out of
          the inline objects for these two properties. */}
      <style jsx>{`
        .auth-input:focus {
          box-shadow: 0 0 0 2px rgba(197, 160, 89, 0.55);
        }
        .auth-button:hover {
          opacity: 0.85;
        }
      `}</style>
    </>
  );
}
