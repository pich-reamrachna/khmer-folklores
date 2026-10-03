"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../../components/shared/NavBar.js";
import { useTranslation } from "../../components/shared/uiText.js";
import authFormStyles from "../../components/shared/authFormStyles.js";
import { createClient } from "../../utils/supabase/client.js";
import { normalizeUsername, validateUsername } from "../../utils/username.js";

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setUsernameError("");

    const trimmedUsername = username.trim();
    const formatKey = validateUsername(trimmedUsername);
    if (formatKey) {
      setUsernameError(t(formatKey));
      return;
    }

    const supabase = createClient();

    // Pre-check availability for a clear message. The DB's unique index on the
    // normalized username is the race-safe backstop if two people grab the
    // same name at once (that signUp then fails with the generic error below).
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username_normalized", normalizeUsername(trimmedUsername))
      .maybeSingle();
    if (taken) {
      setUsernameError(t("usernameTaken"));
      return;
    }

    // Username rides along in user metadata; a DB trigger creates the profile
    // row from it (atomically, so a race just rolls the signup back).
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: trimmedUsername } },
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
            <label style={authFormStyles.label} htmlFor="signup-username">
              {t("authUsernameLabel")}
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              style={authFormStyles.input}
              className="auth-input"
              maxLength={20}
              autoComplete="username"
              required
            />
            {usernameError ? <p style={authFormStyles.error}>{usernameError}</p> : null}
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
