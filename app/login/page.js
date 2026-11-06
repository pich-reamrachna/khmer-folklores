import NavBar from "../../components/shared/NavBar.js";
import AuthCard from "../../components/auth/AuthCard.js";
import styles from "../../components/auth/authStyles.js";

// Sign in: the sign-in / sign-up box (AuthCard.js), opening on its sign-in
// side. Its overlay slides over to the sign-up form without leaving the page.
export default function LoginPage() {
  return (
    <>
      <NavBar />
      <section style={styles.section}>
        <AuthCard initialMode="signin" />
      </section>
    </>
  );
}
