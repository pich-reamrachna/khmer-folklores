"use client";

import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";

// The first step of a /review decision: a pill with two halves, Approve and
// Reject (or Return, for a telling or a change). A highlight slides under
// the chosen half and turns green for Approve or red for Reject; before
// anything is chosen there's no highlight. Choosing one shows the fields that
// decision needs and its confirm button (ReviewForm.js, TellingDecision.js);
// choosing the other swaps them. `choice` is null, "approve" or "reject".
// The buttons' look (and hover / chosen state) lives in app/globals.css's
// .decision-option rules: styled-jsx doesn't reach JSX built in the option
// helper below.

export default function DecisionPicker({ choice, onChoose, rejectKey = "reviewChooseReject" }) {
  const t = useTranslation();
  const { language } = useLanguage();
  const km = language === "km";

  const option = (value, key) => (
    <button
      type="button"
      className={`decision-option ${value}${choice === value ? " is-chosen" : ""}${km ? " km" : ""}`}
      aria-pressed={choice === value}
      onClick={() => onChoose(value)}
    >
      {t(key)}
    </button>
  );

  return (
    <div className="decision-picker" role="group">
      <span
        aria-hidden="true"
        className={`decision-thumb${choice ? " is-" + choice : ""}`}
      />
      {option("approve", "reviewChooseApprove")}
      {option("reject", rejectKey)}
    </div>
  );
}
