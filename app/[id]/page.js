import { notFound } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import FirstTelling from "../../components/story/FirstTelling.js";
import StoryDetails from "../../components/story/StoryDetails.js";
import StoryMemories from "../../components/story/StoryMemories.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import { toEdit } from "../../utils/editableEntry.js";

export default async function StoryPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: story, error } = await supabase
    .from("stories")
    // !entries_story_id_fkey: a story's tellings, not its origin_entry_id
    // link — two links exist between these tables, so the embed must name one.
    // entry_edits: a telling's waiting edit, if any. The database only
    // returns the visitor's own (or every one, for the curator) — it's only
    // used to pre-fill the owner's Edit form, never shown on the page.
    .select("*, entries!entries_story_id_fkey(*, entry_edits(*))")
    .eq("id", id)
    // Pending/rejected stories have no public page — same reasoning as the
    // home page's filter. They 404 like a missing id.
    .eq("status", "published")
    // Only its published tellings, same as the home page: an owner's own
    // pending/returned telling shows on /my-entries, not here as if it were
    // published. This filters the embedded list, not the story row.
    .eq("entries.status", "published")
    .single();

  // Missing id, an error, an unpublished story, or a story with no published
  // tellings (e.g. its only telling is waiting for re-review after an edit)
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
      // When the telling's content was last changed (set by a database
      // trigger, null if never edited). Sliced to YYYY-MM-DD like date above.
      editedAt: e.edited_at ? e.edited_at.slice(0, 10) : null,
      // Always "published" here (only published tellings are fetched); the
      // edit form reads it to save changes as a waiting edit.
      status: e.status,
      edit: toEdit(e.entry_edits),
    }));

  // The story's first telling (set when it was submitted, or backfilled to
  // the oldest one for stories that predate /share) is the story itself: it's
  // shown in full under the title as "The First Telling", credited to its
  // sharer. Everyone else's tellings are the replies below it, so it's left
  // out of that list. It can be missing here while an edit of it waits for
  // re-review (only published tellings are fetched) — then the page just
  // shows the summary and the replies.
  const originId = story.origin_entry_id;
  const firstTelling = versions.find((v) => v.id === originId) ?? null;
  const replies = versions.filter((v) => v.id !== originId);

  // Story-level fields in camelCase + the first telling, flattened into the
  // single object StoryDetails reads (title/summary from the story, place
  // from its first telling, else its earliest one).
  const entry = {
    id: story.id,
    khmerTitle: story.khmer_title,
    category: story.category,
    categoryKhmer: story.category_khmer,
    summary: story.summary,
    summaryKhmer: story.summary_khmer,
    ...(firstTelling ?? versions[0]),
    // Re-assert the story's title last: the spread telling carries its own
    // title, which must not override the summary header's story title.
    title: story.title,
  };

  return (
    <StoryPageShell>
      <NavBar />
      <StoryDetails entry={entry}>
        {firstTelling ? (
          <FirstTelling
            telling={firstTelling}
            storyId={story.id}
            storyTitle={story.title}
            storyTitleKhmer={story.khmer_title}
          />
        ) : null}
      </StoryDetails>
      <StoryMemories
        versions={replies}
        storyId={story.id}
        storyTitle={story.title}
        storyTitleKhmer={story.khmer_title}
      />
    </StoryPageShell>
  );
}
