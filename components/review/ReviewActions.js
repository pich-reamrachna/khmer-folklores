"use client";

import { useTranslation } from "../shared/uiText.js";

// The confirm button under a /review form, for the decision chosen above it
// (DecisionPicker.js): green "Approve & publish" or red "Reject & Return",
// matching the Approve / Reject pill. The labels are uiText keys. `busy` is null, or the
// decision being saved: the button is disabled then, so a double-click can't
// send it twice, and it shows a spinner and "Saving…".

export default function ReviewActions({
  choice,
  busy,
  onConfirm,
  approveLabel = "reviewApprove",
  rejectLabel = "reviewRejectReturn",
}) {
  const t = useTranslation();
  const approving = choice === "approve";

  return (
    <div className="review-actions">
      <button type="button" className={`review-btn ${approving ? "approve" : "reject"}`} disabled={!!busy} onClick={onConfirm}>
        {busy ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            {t("contributeSubmitting")}
          </>
        ) : (
          t(approving ? approveLabel : rejectLabel)
        )}
      </button>

      {/* Native <button>, so styled-jsx scoping works; base + hover +
          disabled all live together, none set inline. */}
      <style jsx>{`
        /* One full-width square button in small spaced capitals: green to
           approve, red to reject or return — the same colours as the
           Approve / Reject pill above it. */
        .review-actions {
          margin-top: 0.6rem;
        }
        .review-btn {
          width: 100%;
          padding: 0.95rem 1.4rem;
          border-radius: 2px;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        .review-btn.approve {
          border: none;
          background-color: #5cb87a;
          color: #1a1817;
        }
        .review-btn.reject {
          border: none;
          background-color: #e58b8b;
          color: #1a1817;
        }
        .review-btn:hover {
          opacity: 0.85;
        }
        .review-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
