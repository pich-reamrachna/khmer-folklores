import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import MyEntries from "../../components/submissions/MyEntries.js";

// "My Entries": everything the logged-in user has shared, with its review
// status — the new stories they started (waiting for review, rejected with a
// note, or published) and their tellings (waiting for review, returned with
// a note, or published). Logged-out visitors go to the login page and come
// back here afterwards. ?submitted=story|telling shows the thank-you box.
export default async function MyEntriesPage({ searchParams }) {
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/login?next=/my-entries");

  // Both filtered to the user's own rows explicitly — the database would also
  // let the curator read everyone's, but this page is only ever "mine".
  // Newest first. The two queries don't depend on each other, so they run
  // at the same time.
  const [storiesRes, tellingsRes] = await Promise.all([
    supabase
      .from("stories")
      .select("id, title, khmer_title, category, category_khmer, status, rejection_note, submitted_at")
      .eq("first_shared_by", user.id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("entries")
      .select("id, title, status, return_note, created_at, stories!entries_story_id_fkey(id, title, khmer_title, status, origin_entry_id)")
      .eq("owner", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const error = storiesRes.error || tellingsRes.error;
  if (error) console.error("My entries failed to load:", error);

  // camelCase, the shape every other page hands its components.
  const submissions = (storiesRes.data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    khmerTitle: s.khmer_title,
    category: s.category,
    categoryKhmer: s.category_khmer,
    status: s.status,
    rejectionNote: s.rejection_note,
    submittedAt: s.submitted_at,
  }));
  // Tellings on published stories only: a story still in review (or
  // rejected) is already listed above with its own status, and its first
  // telling would otherwise show a misleading "Published" here.
  // A story's first telling is left out too: it's the story itself (shown as
  // "The First Telling" on the story page) and is already listed above under
  // "Stories you started" — "Your tellings" are replies to other stories.
  const tellings = (tellingsRes.data ?? [])
    .filter((e) => e.stories?.status === "published" && e.id !== e.stories.origin_entry_id)
    .map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      returnNote: e.return_note,
      createdAt: e.created_at,
      storyId: e.stories.id,
      storyTitle: e.stories.title,
      storyKhmerTitle: e.stories.khmer_title,
    }));

  return (
    <StoryPageShell>
      <NavBar />
      <MyEntries
        submissions={submissions}
        tellings={tellings}
        loadFailed={!!error}
        submitted={submitted === "story" || submitted === "telling" ? submitted : null}
      />
    </StoryPageShell>
  );
}
