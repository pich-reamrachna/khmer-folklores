"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";

// Keeps a server-rendered page up to date without a reload: re-fetches it
// (router.refresh) when one of the listed tables changes, and when the tab
// comes back into view — the second also covers a live connection that
// dropped while the tab was in the background. Renders nothing.
//
// `tables` is a list of { table, filter? } — filter is Supabase Realtime's
// "column=eq.value" form, to hear only about the viewer's own rows. Which
// rows a page is told about at all is still decided by row-level security
// (supabase/realtime.sql turns Realtime on for these tables).
//
// A refresh keeps what's on screen, so text half-typed into a form stays.
// Changes that land close together (a new story writes its story and its
// first telling) are gathered into one refresh.

const SETTLE_MS = 300;

export default function LiveRefresh({ channel, tables }) {
  const router = useRouter();
  // Re-subscribe only when the list itself changes, not on every render.
  const key = JSON.stringify(tables);

  useEffect(() => {
    let timer = null;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), SETTLE_MS);
    };

    const supabase = createClient();
    const live = supabase.channel(channel);
    for (const { table, filter } of JSON.parse(key)) {
      live.on("postgres_changes", { event: "*", schema: "public", table, ...(filter ? { filter } : null) }, refresh);
    }
    live.subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(live);
    };
  }, [channel, key, router]);

  return null;
}
