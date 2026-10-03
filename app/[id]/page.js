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
    .select("*, entries(*)")
    .eq("id", id)
    .single();

  // Missing id, an error, or a story with no tellings all 404 — same as
  // when this page read the data file and found nothing.
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
  };

  return (
    <StoryPageShell>
      <NavBar />
      <StoryDetails entry={entry} />
      <StoryMemories
        versions={versions}
        storyId={story.id}
        storyTitle={story.title}
        storyTitleKhmer={story.khmer_title}
      />
    </StoryPageShell>
  );
}
