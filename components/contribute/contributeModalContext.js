"use client";

import { createContext, useContext } from "react";

// Lets the "Share Your Version" button (deep inside StoryPageShell's opaque
// children) open the contribute modal, whose state + scroll lock live up in
// StoryPageShell. open(storyId, storyTitle) is the only thing exposed.
export const ContributeModalContext = createContext({ open: () => {} });

export function useContributeModal() {
  return useContext(ContributeModalContext);
}
