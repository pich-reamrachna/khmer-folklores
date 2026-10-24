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
        .review-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .review-btn {
          padding: 0.75rem 1.4rem;
          border-radius: 10px;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .review-btn.approve {
          border: none;
          background-color: #c5a059;
          color: #0c0a12;
        }
        .review-btn.reject {
          border: 1px solid #e0736a;
          background: transparent;
          color: #e0736a;
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
