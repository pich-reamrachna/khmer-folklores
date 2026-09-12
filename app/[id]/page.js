import { notFound } from "next/navigation";
import stories from "../../data/entries.js";
import NavBar from "../../components/shared/NavBar.js";
import StoryDetails from "../../components/story/StoryDetails.js";
import StoryMemories from "../../components/story/StoryMemories.js";
import StoryPageShell from "../../components/story/StoryPageShell.js";

export default async function StoryPage({ params }) {
  const { id } = await params;
  const story = stories.find((s) => s.id === id);

  if (!story) {
    notFound();
  }

  const entry = { ...story, ...story.versions[0] };

  return (
    <StoryPageShell>
      <NavBar />
      <StoryDetails entry={entry} />
      <StoryMemories versions={story.versions} />
    </StoryPageShell>
  );
}
