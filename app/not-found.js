import NavBar from "../components/shared/NavBar.js";
import StoryPageShell from "../components/story/StoryPageShell.js";
import NotFound from "../components/shared/NotFound.js";

// Next.js shows this for any address with no page, and wherever a page calls
// notFound() — a story id that doesn't exist, or /review for a non-curator.
// Same frame as the story pages: NavBar on top, Footer underneath.
export default function NotFoundPage() {
  return (
    <StoryPageShell>
      <NavBar />
      <NotFound />
    </StoryPageShell>
  );
}
