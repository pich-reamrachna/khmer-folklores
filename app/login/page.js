"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/shared/NavBar.js";
import { useTranslation } from "../../components/shared/uiText.js";
import authFormStyles from "../../components/shared/authFormStyles.js";
import { createClient } from "../../utils/supabase/client.js";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

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

    router.push("/");
  };

  return (
    <>
      <NavBar />
      <section style={authFormStyles.section}>
        <form style={authFormStyles.form} onSubmit={handleSubmit}>
          <h1 style={authFormStyles.title}>{t("authLoginTitle")}</h1>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="login-email">
              {t("authEmailLabel")}
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={authFormStyles.input}
              className="auth-input"
              required
            />
          </div>

          <div style={authFormStyles.field}>
            <label style={authFormStyles.label} htmlFor="login-password">
              {t("authPasswordLabel")}
            </label>
            <input
              id="login-password"
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
            {t("authLoginButton")}
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
