import NavBar from "../../components/shared/NavBar.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";
import ShareSearch from "../../components/share/ShareSearch.js";

// "Share a Memory": before anyone writes a new story, they search for it —
// most "new" stories are really another telling of one already here, and
// that telling belongs on the existing story, not in a duplicate.
// Nothing here waits on the database (ShareSearch loads the stories in the
// browser), so Next.js serves this as a static page: it appears instantly
// instead of after a server round trip to Supabase.
export default function SharePage() {
  return (
    <StoryPageShell>
      <NavBar />
      <ShareSearch />
    </StoryPageShell>
  );
}
