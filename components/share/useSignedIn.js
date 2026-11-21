"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client.js";

// Whether a visitor is signed in, for /share: undefined while checking,
// then true or false — and it follows a sign-in or sign-out in the NavBar
// without a reload. Same session check as StoryMemories.js. This only
// decides what /share shows; the database still checks who may submit.

export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  return signedIn;
}
