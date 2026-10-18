"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client.js";

// Loads the published stories /share searches, in the browser — the same
// way the home page loads the archive. The page itself no longer waits on
// the database: its heading and search box appear at once (served as a
// static page), and the stories arrive behind them, usually before the
// visitor has finished typing.
// Returns null while loading, then an array (empty if the query failed — an
// error just means no suggestions, not a broken page).
export function usePublishedStories() {
  const [stories, setStories] = useState(null);

  useEffect(() => {
    let active = true;
    createClient()
      .from("stories")
      .select("id, title, khmer_title, summary, summary_khmer")
      .eq("status", "published")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("Share search stories failed to load:", error);
        // camelCase, the shape every other component reads.
        setStories(
          (data ?? []).map((s) => ({
            id: s.id,
            title: s.title,
            khmerTitle: s.khmer_title,
            summary: s.summary,
            summaryKhmer: s.summary_khmer,
          }))
        );
      });
    return () => {
      active = false;
    };
  }, []);

  return stories;
}
