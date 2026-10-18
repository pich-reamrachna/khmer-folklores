"use client";

import ReviewSubmission from "./ReviewSubmission.js";
import ReviewForm from "./ReviewForm.js";
import reviewStyles from "./reviewStyles.js";

// One pending story on /review: what was submitted (read-only) above the
// curator's form for it.

export default function ReviewCard({ submission }) {
  return (
    <article style={reviewStyles.card}>
      <ReviewSubmission submission={submission} />
      <hr style={reviewStyles.divider} />
      <ReviewForm submission={submission} />
    </article>
  );
}
