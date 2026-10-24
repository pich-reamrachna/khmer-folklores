import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import MyEntries from "../../components/submissions/MyEntries.js";
import { toEdit } from "../../utils/editableEntry.js";

// The ?submitted= values that open the thank-you box (SubmittedDialog.js).
const SUBMITTED_KINDS = ["story", "telling", "edit"];

// Telling columns, mapped to the camelCase shape the edit form reads (the
// same fields the story page hands it), plus the review status and note,
// and its waiting edit if it has one (entry_edits — see utils/editableEntry.js).
const TELLING_COLUMNS = "id, title, place, place_khmer, description, photo_url, status, return_note, created_at, entry_edits(*)";
function toTelling(e) {
  return {
    id: e.id,
    title: e.title,
    place: e.place,
    placeKhmer: e.place_khmer,
    description: e.description,
    photoUrl: e.photo_url,
    status: e.status,
    returnNote: e.return_note,
    createdAt: e.created_at,
    edit: toEdit(e.entry_edits),
  };
}

// "My Entries": everything the logged-in user has shared, with its review
// status — the new stories they started (waiting for review, rejected with a
// note, or published) and their tellings (waiting for review, returned with
// a note, or published). Logged-out visitors go to the login page and come
// back here afterwards. ?submitted=story|telling|edit shows the thank-you box.
export default async function MyEntriesPage({ searchParams }) {
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) redirect("/login?next=/my-entries");

  // Both filtered to the user's own rows explicitly — the database would also
  // let the curator read everyone's, but this page is only ever "mine".
  // Newest first. The two queries don't depend on each other, so they run
  // at the same time. Each story also brings its first telling (the
  // origin_entry_id link), whose edits are reviewed like any other telling.
  const [storiesRes, tellingsRes] = await Promise.all([
    supabase
      .from("stories")
      .select(`id, title, khmer_title, category, category_khmer, status, rejection_note, submitted_at, origin:entries!stories_origin_entry_id_fkey(${TELLING_COLUMNS})`)
      .eq("first_shared_by", user.id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("entries")
      .select(`${TELLING_COLUMNS}, stories!entries_story_id_fkey(id, title, khmer_title, status, origin_entry_id)`)
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
    firstTelling: s.origin ? toTelling(s.origin) : null,
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
      ...toTelling(e),
      storyId: e.stories.id,
      storyTitle: e.stories.title,
      storyKhmerTitle: e.stories.khmer_title,
    }));

  const kind = SUBMITTED_KINDS.includes(submitted) ? submitted : null;

  return (
    <StoryPageShell>
      <NavBar />
      {/* key: an edit made from this page comes back here with a new
          ?submitted while the page stays mounted — the key starts MyEntries
          afresh, so its thank-you box opens in the same render as the new
          list instead of a moment later. */}
      <MyEntries
        key={kind ?? "none"}
        submissions={submissions}
        tellings={tellings}
        loadFailed={!!error}
        submitted={kind}
      />
    </StoryPageShell>
  );
}
