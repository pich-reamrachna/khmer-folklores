// Keeps the home page's stories in memory for as long as the tab is open.
// Next.js throws the home page (and everything it loaded) away when you
// navigate to another page, so without this, coming back meant "Loading the
// archive…" and a fresh database round trip every time. Module-level
// variables live for the whole visit instead: the first load fills this, and
// later visits render from it instantly while app/page.js refreshes it
// quietly in the background. A full reload or a new tab starts empty again.

let cachedStories = null;

// null until the archive has been loaded once in this tab.
export function getCachedStories() {
  return cachedStories;
}

export function setCachedStories(stories) {
  cachedStories = stories;
}
