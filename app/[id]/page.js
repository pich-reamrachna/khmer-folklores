import { notFound } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryDetails from "../../components/story/StoryDetails.js";
import StoryMemories from "../../components/story/StoryMemories.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";

export default async function StoryPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: story, error } = await supabase
    .from("stories")
    // !entries_story_id_fkey: a story's tellings, not its origin_entry_id
    // link — two links exist between these tables, so the embed must name one.
    .select("*, entries!entries_story_id_fkey(*)")
    .eq("id", id)
    // Pending/rejected stories have no public page — same reasoning as the
    // home page's filter. They 404 like a missing id.
    .eq("status", "published")
    .single();

  // Missing id, an error, an unpublished story, or a story with no tellings
  // all 404 — same as when this page read the data file and found nothing.
  if (error || !story || !story.entries?.length) {
    notFound();
  }

  // One telling per entry row, mapped to the camelCase shape StoryMemories
  // reads, oldest first by created_at (so versions[0] is the earliest, and the
  // thread's newest-first reverse lines up with the shown dates).
  // No descriptionKhmer — entries store a single description; StoryMemories'
  // pickText falls back to it regardless of the language toggle.
  const versions = story.entries
    .slice()
    .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""))
    .map((e) => ({
      id: e.id,
      owner: e.owner,
      title: e.title,
      contributor: e.contributor,
      // Shown date comes from created_at (the submission time), sliced to the
      // YYYY-MM-DD the byline's formatDate expects. UTC date as stored.
      date: e.created_at ? e.created_at.slice(0, 10) : null,
      place: e.place,
      placeKhmer: e.place_khmer,
      description: e.description,
      photoUrl: e.photo_url,
    }));

  // Story-level fields in camelCase + the first telling, flattened into the
  // single object StoryDetails reads (title/summary from the story, place
  // from its earliest telling).
  // The story's first telling (set when it was submitted, or backfilled to
  // the oldest one for stories that predate /share). Its contributor is
  // credited as "First shared by", and StoryMemories badges it and hides its
  // Delete — the database refuses that delete on a published story anyway.
  const originId = story.origin_entry_id;
  const firstSharedBy = versions.find((v) => v.id === originId)?.contributor ?? null;

  const entry = {
    id: story.id,
    khmerTitle: story.khmer_title,
    category: story.category,
    categoryKhmer: story.category_khmer,
    summary: story.summary,
    summaryKhmer: story.summary_khmer,
    ...versions[0],
    // Re-assert the story's title last: versions[0] now carries the telling's
    // own title, which must not override the summary header's story title.
    title: story.title,
    firstSharedBy,
  };

  return (
    <StoryPageShell>
      <NavBar />
      <StoryDetails entry={entry} />
      <StoryMemories
        versions={versions}
        storyId={story.id}
        originId={originId}
        storyTitle={story.title}
        storyTitleKhmer={story.khmer_title}
      />
    </StoryPageShell>
  );
}
