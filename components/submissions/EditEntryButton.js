"use client";

import { useContributeModal } from "../contribute/contributeModalContext.js";
import { useTranslation } from "../shared/uiText.js";
import { formEntry } from "../../utils/editableEntry.js";

// "Edit" on a /my-entries card: for a telling that's waiting for review or
// was returned (those aren't on the story page, so this is where the owner
// fixes them), or a published one whose changes are waiting. Opens the same
// edit form as the story page (StoryPageShell owns the modal), pre-filled
// with the waiting changes if there are any; saving sends them to review.

export default function EditEntryButton({ storyId, storyTitle, storyTitleKhmer, telling }) {
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
            entry: formEntry(telling),
          })
        }
      >
        {t("menuEdit")}
      </button>

      {/* Native <button>, so styled-jsx scoping works; base + hover together. */}
      <style jsx>{`
        .edit-entry-btn {
          margin-top: 0.8rem;
          padding: 0.4rem 1.1rem;
          border: 1px solid #c5a059;
          border-radius: 999px;
          background: transparent;
          color: #e6c575;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .edit-entry-btn:hover {
          background-color: #c5a059;
          color: #0c0a12;
        }
      `}</style>
    </>
  );
}
