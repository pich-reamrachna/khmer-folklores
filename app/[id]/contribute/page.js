import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../utils/supabase/server.js";
import NavBar from "../../../components/shared/NavBar.js";
import ContributeForm from "../../../components/contribute/ContributeForm.js";

export default async function ContributePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Confirm the story exists before offering to add a telling to it.
  const { data: story } = await supabase
    .from("stories")
    .select("id, title")
    .eq("id", id)
    .single();
  if (!story) notFound();

  // Only logged-in users get the form; everyone else gets a link to log in.
  const { data: auth } = await supabase.auth.getUser();

  return (
    <main style={{ backgroundColor: "#0C0A12", minHeight: "100vh" }}>
      <NavBar />
      {auth?.user ? (
        <ContributeForm storyId={story.id} storyTitle={story.title} />
      ) : (
        <div style={styles.prompt}>
          <p style={styles.promptText}>Please log in to add your telling of “{story.title}.”</p>
          <Link href="/login" style={styles.loginLink}>
            Log in
          </Link>
        </div>
      )}
    </main>
  );
}

const styles = {
  prompt: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.25rem",
    padding: "130px 2rem 3rem",
    boxSizing: "border-box",
    textAlign: "center",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
  },
  promptText: {
    color: "#BBAEBF",
    fontSize: "1.05rem",
    fontWeight: 300,
    margin: 0,
  },
  loginLink: {
    display: "inline-block",
    padding: "0.7rem 1.6rem",
    borderRadius: 10,
    backgroundColor: "#C5A059",
    color: "#0C0A12",
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.05em",
  },
};
