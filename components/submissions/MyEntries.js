"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import SubmissionsList from "./SubmissionsList.js";
import TellingsList from "./TellingsList.js";
import SubmittedDialog from "./SubmittedDialog.js";
import { useTranslation } from "../shared/uiText.js";

// /my-entries: everything the user has shared, in two sections — the new
// stories they started, and their tellings — each with its review status.
// Also shows the thank-you box after a submission (?submitted=…).

const khmerSans = "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif";
const styles = {
  // Same top/side padding as /share and /review — clears the fixed NavBar.
  section: { backgroundColor: "#0D0812", minHeight: "100vh", padding: "130px 2rem 4rem", boxSizing: "border-box", fontFamily: "var(--font-jakarta), system-ui, sans-serif", color: "#F5EFE6" },
  container: { maxWidth: 760, margin: "0 auto" },
  // Deliberately not translated — decorative label, like the site's other eyebrows.
  eyebrow: { fontSize: "0.75rem", fontWeight: 600, color: "#E6C575", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 1rem" },
  title: { fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'", fontSize: "2.5rem", fontWeight: 600, lineHeight: 1.15, margin: "0 0 2.5rem" },
  heading: { fontFamily: khmerSans, fontSize: "1.1rem", fontWeight: 700, color: "#E6C575", margin: "0 0 1rem" },
  part: { marginBottom: "3rem" },
  error: { fontFamily: khmerSans, fontSize: "1rem", color: "#BBAEBF", margin: 0 },
};

export default function MyEntries({ submissions, tellings, loadFailed, submitted }) {
  const t = useTranslation();
  const router = useRouter();
  // The thank-you box after a submission. Closing it also drops ?submitted
  // from the address, so a refresh or the back button doesn't show it again.
  const [dialog, setDialog] = useState(submitted);
  const closeDialog = useCallback(() => {
    setDialog(null);
    router.replace("/my-entries", { scroll: false });
  }, [router]);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>My Entries</p>
        <h1 style={styles.title}>{t("myEntriesTitle")}</h1>

        {loadFailed ? (
          <p style={styles.error}>{t("submissionsLoadError")}</p>
        ) : (
          <>
            <div style={styles.part}>
              <h2 style={styles.heading}>{t("myEntriesStoriesHeading")}</h2>
              <SubmissionsList submissions={submissions} />
            </div>
            <div style={styles.part}>
              <h2 style={styles.heading}>{t("myEntriesTellingsHeading")}</h2>
              <TellingsList tellings={tellings} />
            </div>
          </>
        )}
      </div>

      {dialog ? <SubmittedDialog kind={dialog} onClose={closeDialog} /> : null}
    </section>
  );
}
