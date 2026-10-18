import { notFound } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import ReviewQueue from "../../components/review/ReviewQueue.js";

// The curator's review queue: every pending new story with its first telling,
// where the curator writes the summary and approves or rejects it.
// Anyone who isn't the curator gets a plain 404 — the page doesn't reveal it
// exists. That's only the front door: the database's own rules (RLS) are what
// actually stop a non-curator from reading pending stories or changing one.
export default async function ReviewPage() {
  const supabase = await createClient();

  const { data: isCurator } = await supabase.rpc("is_curator");
  if (!isCurator) notFound();

  // Oldest first, so the longest-waiting submission is at the top.
  // origin:entries!stories_origin_entry_id_fkey is the story's first telling
  // (the link has to be named — stories and entries are joined two ways).
  const { data, error } = await supabase
    .from("stories")
    .select("*, origin:entries!stories_origin_entry_id_fkey(*)")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  if (error) console.error("Review queue failed to load:", error);

  // camelCase, the shape every other page hands its components.
  const submissions = (data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    khmerTitle: s.khmer_title,
    category: s.category,
    submittedAt: s.submitted_at,
    origin: s.origin
      ? {
          title: s.origin.title,
          contributor: s.origin.contributor,
          place: s.origin.place,
          placeKhmer: s.origin.place_khmer,
          description: s.origin.description,
          photoUrl: s.origin.photo_url,
        }
      : null,
  }));

  return (
    <StoryPageShell>
      <NavBar />
      <ReviewQueue submissions={submissions} loadFailed={!!error} />
    </StoryPageShell>
  );
}
