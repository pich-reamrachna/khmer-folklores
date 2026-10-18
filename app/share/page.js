import { createClient } from "../../utils/supabase/server.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import ShareSearch from "../../components/share/ShareSearch.js";

// "Share a Memory": before anyone writes a new story, they search for it —
// most "new" stories are really another telling of one already here, and
// that telling belongs on the existing story, not in a duplicate.
export default async function SharePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("id, title, khmer_title, summary, summary_khmer")
    .eq("status", "published");

  // camelCase, same as every other page hands its components. An errored
  // query just means no suggestions, not a broken page.
  const stories = (data ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    khmerTitle: s.khmer_title,
    summary: s.summary,
    summaryKhmer: s.summary_khmer,
  }));

  return (
    <StoryPageShell>
      <NavBar />
      <ShareSearch stories={stories} />
    </StoryPageShell>
  );
}
