"use client";

import Link from "next/link";
import { useTranslation } from "../shared/uiText.js";
import styles from "./shareSearchStyles.js";

// What /share shows a signed-out visitor, in place of the search: sharing
// needs an account, so they're told before they search and pick a story,
// not after. Sign In comes back to /share afterwards (?next=, see
// SignInForm.js). The buttons are next/link Links, so their look and hover
// live in app/globals.css (.share-signin-btn) — styled-jsx can't scope
// through Link.

const buttonRow = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginTop: "2rem",
};

export default function SignInPrompt() {
  const t = useTranslation();

  return (
    <>
      <h1 style={styles.title}>{t("shareSignInTitle")}</h1>
      <p style={styles.subtitle}>{t("shareSignInText")}</p>
      <div style={buttonRow}>
        <Link href="/login?next=/share" className="share-signin-btn is-primary">
          {t("authLoginButton")}
        </Link>
        <Link href="/signup" className="share-signin-btn">
          {t("authSignupButton")}
        </Link>
      </div>
    </>
  );
}
