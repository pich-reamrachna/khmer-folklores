import { notFound } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import ReviewQueue from "../../components/review/ReviewQueue.js";

// The curator's review queue, in three parts, each oldest first so the
// longest-waiting is at the top:
//   - pending new stories with their first telling — the curator writes the
//     summary and approves or rejects;
//   - new tellings added to published stories (review_entry);
//   - waiting changes to published tellings (review_entry_edit), shown as
//     before → after.
// Anyone who isn't the curator gets a plain 404 — the page doesn't reveal it
// exists. That's only the front door: the database's own rules (RLS, and the
// review functions' own reviewer check) are what actually stop a
// non-curator from reading pending items or deciding on one.

// A telling row in camelCase (the shape every other page hands its components).
function toTelling(e) {
  return {
    id: e.id,
    title: e.title,
    contributor: e.contributor,
    place: e.place,
    placeKhmer: e.place_khmer,
    description: e.description,
    photoUrl: e.photo_url,
    createdAt: e.created_at,
  };
}
// The story a telling belongs to, for the card's heading.
function toStory(s) {
  return s ? { id: s.id, title: s.title, khmerTitle: s.khmer_title } : null;
}

export default async function ReviewPage() {
  const supabase = await createClient();

  const { data: isCurator } = await supabase.rpc("is_curator");
  if (!isCurator) notFound();

  // The three lists don't depend on each other, so they load at the same time.
  // origin:entries!stories_origin_entry_id_fkey is a story's first telling,
  // and stories!entries_story_id_fkey a telling's story (stories and entries
  // are joined two ways, so the link has to be named).
  const [storiesRes, tellingsRes, editsRes] = await Promise.all([
    supabase
      .from("stories")
      .select("*, origin:entries!stories_origin_entry_id_fkey(*)")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true }),
    // New tellings only appear on published stories (a pending story's first
    // telling is reviewed with the story itself, above).
    supabase
      .from("entries")
      .select("*, stories!entries_story_id_fkey!inner(id, title, khmer_title, status)")
      .eq("status", "pending")
      .eq("stories.status", "published")
      .order("created_at", { ascending: true }),
    supabase
      .from("entry_edits")
      .select("*, entries(*, stories!entries_story_id_fkey(id, title, khmer_title))")
      .eq("status", "pending")
      .order("updated_at", { ascending: true }),
  ]);

  const error = storiesRes.error || tellingsRes.error || editsRes.error;
  if (error) console.error("Review queue failed to load:", error);

  const submissions = (storiesRes.data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    khmerTitle: s.khmer_title,
    category: s.category,
    submittedAt: s.submitted_at,
    origin: s.origin ? toTelling(s.origin) : null,
  }));
  const tellings = (tellingsRes.data ?? []).map((e) => ({
    ...toTelling(e),
    story: toStory(e.stories),
  }));
  // Each waiting edit next to the published telling it would change.
  const edits = (editsRes.data ?? [])
    .filter((d) => d.entries)
    .map((d) => ({
      id: d.id,
      updatedAt: d.updated_at,
      title: d.title,
      place: d.place,
      placeKhmer: d.place_khmer,
      description: d.description,
      photoUrl: d.photo_url,
      published: toTelling(d.entries),
      story: toStory(d.entries.stories),
    }));

  return (
    <StoryPageShell>
      <NavBar />
      <ReviewQueue submissions={submissions} tellings={tellings} edits={edits} loadFailed={!!error} />
    </StoryPageShell>
  );
}
