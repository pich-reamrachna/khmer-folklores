"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/shared/NavBar.js";
import { useTranslation } from "../../components/shared/uiText.js";
import authFormStyles from "../../components/shared/authFormStyles.js";
import { createClient } from "../../utils/supabase/client.js";

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    // Deliberately generic — doesn't reveal whether the email is
    // already registered, the same information leak as a specific
    // login error, in the other direction.
    if (signUpError) {
      setError(t("authSignupError"));
      return;
    }

    // Email confirmation is currently disabled in this Supabase
    // project, so signUp() always returns an active session here.
    router.push("/");
  };

  return (
    <>
      <NavBar />
      <section style={authFormStyles.section}>
        <form style={authFormStyles.form} onSubmit={handleSubmit}>
          <h1 style={authFormStyles.title}>{t("authSignupTitle")}</h1>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="signup-email">
              {t("authEmailLabel")}
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={authFormStyles.input}
              className="auth-input"
              required
            />
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
              style={authFormStyles.input}
              className="auth-input"
              required
            />
          </div>

          {error ? <p style={authFormStyles.error}>{error}</p> : null}

          <button type="submit" style={authFormStyles.button} className="auth-button">
            {t("authSignupButton")}
          </button>
        </form>
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
