import NavBar from "../../components/shared/NavBar.js";
import AuthCard from "../../components/auth/AuthCard.js";
import styles from "../../components/auth/authStyles.js";

// Sign up: the sign-in / sign-up box (AuthCard.js), opening on its sign-up
// side. Its overlay slides over to the sign-in form without leaving the page.
export default function SignupPage() {
  return (
    <>
      <NavBar />
      <section style={styles.section}>
        <AuthCard initialMode="signup" />
      </section>
    </>
  );
}
