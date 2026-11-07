"use client";

import { useTranslation } from "../shared/uiText.js";

// Approve / Reject buttons under a /review form. Both are disabled while a
// save is in flight so a double-click can't send it twice. The labels are
// uiText keys — a telling is "returned", not rejected (TellingDecision.js).

export default function ReviewActions({
  busy,
  onApprove,
  onReject,
  approveLabel = "reviewApprove",
  rejectLabel = "reviewReject",
}) {
  const t = useTranslation();

  return (
    <div className="review-actions">
      <button type="button" className="review-btn approve" disabled={busy} onClick={onApprove}>
        {t(approveLabel)}
      </button>
      <button type="button" className="review-btn reject" disabled={busy} onClick={onReject}>
        {t(rejectLabel)}
      </button>

      {/* Native <button>s, so styled-jsx scoping works; base + hover +
          disabled all live together, none set inline. */}
      <style jsx>{`
        /* Square buttons in small spaced capitals: Approve fills the row
           in gold, Reject / Return sits beside it, outlined. */
        .review-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 0.6rem;
        }
        .review-btn {
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
          flex: 1;
          border: none;
          background-color: #c5a059;
          color: #1a1817;
        }
        .review-btn.reject {
          border: 1px solid rgba(245, 239, 230, 0.18);
          background: transparent;
          color: #e58b8b;
        }
        .review-btn.approve:hover {
          opacity: 0.85;
        }
        .review-btn.reject:hover {
          border-color: #e58b8b;
          background-color: rgba(229, 139, 139, 0.08);
        }
        .review-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
