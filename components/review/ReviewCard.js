"use client";

import ReviewSubmission from "./ReviewSubmission.js";
import ReviewForm from "./ReviewForm.js";
import reviewStyles from "./reviewStyles.js";

// One pending story on /review: what was submitted (read-only) on the left,
// the curator's form for it on the right (stacked on a narrow screen — the
// columns are app/globals.css's .review-card rule).

export default function ReviewCard({ submission }) {
  return (
    <article style={reviewStyles.card} className="review-card">
      <div style={reviewStyles.read}>
        <ReviewSubmission submission={submission} />
      </div>
      <div style={reviewStyles.decide}>
        <ReviewForm submission={submission} />
      </div>
    </article>
  );
}
