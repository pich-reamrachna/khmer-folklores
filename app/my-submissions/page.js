import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import SubmissionsList from "../../components/submissions/SubmissionsList.js";

// "My Submissions": every new story the logged-in user started from /share —
// waiting for review, rejected (with the curator's note), or published.
// Logged-out visitors go to the login page and come back here afterwards.
// ?submitted=story or ?submitted=telling: sent here right after a submission,
// so the list shows the "waiting for review" thank-you box.
export default async function MySubmissionsPage({ searchParams }) {
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/login?next=/my-submissions");

  // Filtered to the user's own stories explicitly — the database would also
  // let the curator read everyone's, but this page is only ever "mine".
  // Newest first.
  const { data, error } = await supabase
    .from("stories")
    .select("id, title, khmer_title, category, category_khmer, status, rejection_note, submitted_at")
    .eq("first_shared_by", user.id)
    .order("submitted_at", { ascending: false });

  if (error) console.error("My submissions failed to load:", error);

  // camelCase, the shape every other page hands its components.
  const submissions = (data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    khmerTitle: s.khmer_title,
    category: s.category,
    categoryKhmer: s.category_khmer,
    status: s.status,
    rejectionNote: s.rejection_note,
    submittedAt: s.submitted_at,
  }));

  return (
    <StoryPageShell>
      <NavBar />
      <SubmissionsList
        submissions={submissions}
        loadFailed={!!error}
        submitted={submitted === "story" || submitted === "telling" ? submitted : null}
      />
    </StoryPageShell>
  );
}
