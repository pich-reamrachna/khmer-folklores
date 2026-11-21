"use client";

import { useContributeModal } from "../contribute/contributeModalContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formEntry } from "../../utils/editableEntry.js";

// "Edit" on a /my-entries card: for any of the owner's tellings — one that's
// waiting for review or was returned (not on the story page, so this is the
// only place to fix it), or a published one (its changes go to review, the
// same as editing from the story page's ⋯ menu). Opens the same
// edit form as the story page (StoryPageShell owns the modal), pre-filled
// with the waiting changes if there are any; saving sends them to review.

// firstTelling: the story's own first telling (My Entries' story card), whose
// title is the story's — the form then hides its Title field.
export default function EditEntryButton({ storyId, storyTitle, storyTitleKhmer, telling, firstTelling = false }) {
  const t = useTranslation();
  const { open } = useContributeModal();

  return (
    <>
      <button
        type="button"
        className="edit-entry-btn"
        onClick={() =>
          open({
            storyId,
            storyTitle,
            storyTitleKhmer,
            entry: formEntry(telling, { firstTelling }),
          })
        }
      >
        {t("menuEdit")}
      </button>

      {/* Native <button>, so styled-jsx scoping works; base + hover together. */}
      <style jsx>{`
        .edit-entry-btn {
          margin-top: 1.1rem;
          padding: 0.45rem 1.2rem;
          border: 1px solid #c5a059;
          border-radius: 2px;
          background: transparent;
          color: #e6c575;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .edit-entry-btn:hover {
          background-color: #c5a059;
          color: #1a1817;
        }
      `}</style>
    </>
  );
}
