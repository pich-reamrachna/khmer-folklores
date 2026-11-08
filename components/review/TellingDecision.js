"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import { useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import ReviewActions from "./ReviewActions.js";
import DecisionPicker from "./DecisionPicker.js";
import s from "./reviewStyles.js";

// The curator's half of a /review card for a new telling or a waiting edit.
// First choose Approve or Return (DecisionPicker.js): approving needs nothing
// more, returning shows the note — which it needs, so the owner knows what to
// fix (it shows on their My Entries card).
// rpc is the database function that decides — review_entry for a new telling,
// review_entry_edit for an edit — and idKey its id argument's name. Both
// check the caller is a reviewer themselves and return false if nothing was
// decided (e.g. someone else already did), which shows as "not saved".

const MAX = 1000;

export default function TellingDecision({ id, rpc, idKey }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  // null, or which decision is being saved ("approve" / "reject") — the
  // note and buttons lock, and that button shows it's working.
  const [busy, setBusy] = useState(null);
  // null until a decision is chosen, then "approve" or "reject" (return).
  const [choice, setChoice] = useState(null);
  const choose = (next) => {
    setChoice(next);
    setError("");
  };

  // On success the page re-fetches, and this card drops out of the queue.
  async function decide(decision) {
    if (decision === "returned" && !note.trim()) {
      setError(t("reviewReturnNoteError"));
      return;
    }
    setError("");
    setBusy(decision === "published" ? "approve" : "reject");
    const { data, error: rpcError } = await createClient().rpc(rpc, {
      [idKey]: id,
      decision,
      note: decision === "returned" ? note.trim() : null,
    });
    if (rpcError || data !== true) {
      console.error("Review decision failed:", rpc, id, rpcError);
      setError(t("reviewSaveError"));
      setBusy(null);
      return;
    }
    router.refresh();
  }

  const fieldId = `${id}-note`;
  return (
    <fieldset style={s.lock} disabled={!!busy} aria-busy={!!busy}>
      <DecisionPicker choice={choice} onChoose={choose} rejectKey="reviewChooseReturn" />

      {choice === "reject" ? (
        <div style={s.field}>
          <label style={{ ...s.label, ...(language === "km" ? s.trackingNone : null) }} htmlFor={fieldId}>
            {t("reviewReturnNoteLabel")}
          </label>
          <textarea
            id={fieldId}
            style={{ ...s.input, ...s.textarea }}
            value={note}
            maxLength={MAX}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      ) : null}
      {/* Reserved, so a message doesn't push the button down. */}
      {choice ? <p style={{ ...s.errorSlot, ...s.errorSlotTwoLines }} aria-live="polite">{error}</p> : null}
      {choice ? (
        <ReviewActions
          choice={choice}
          busy={busy}
          onConfirm={() => decide(choice === "approve" ? "published" : "returned")}
        />
      ) : null}
    </fieldset>
  );
}
