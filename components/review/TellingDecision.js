"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import { useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";
import ReviewActions from "./ReviewActions.js";
import s from "./reviewStyles.js";

// The curator's half of a /review card for a new telling or a waiting edit:
// an optional note, then Approve or Return. Returning needs a note, so the
// owner knows what to fix (it shows on their My Entries card).
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
  const [busy, setBusy] = useState(false);

  // On success the page re-fetches, and this card drops out of the queue.
  async function decide(decision) {
    if (decision === "returned" && !note.trim()) {
      setError(t("reviewReturnNoteError"));
      return;
    }
    setError("");
    setBusy(true);
    const { data, error: rpcError } = await createClient().rpc(rpc, {
      [idKey]: id,
      decision,
      note: decision === "returned" ? note.trim() : null,
    });
    if (rpcError || data !== true) {
      console.error("Review decision failed:", rpc, id, rpcError);
      setError(t("reviewSaveError"));
      setBusy(false);
      return;
    }
    router.refresh();
  }

  const fieldId = `${id}-note`;
  return (
    <div>
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
      {error ? <p style={s.error}>{error}</p> : null}
      <ReviewActions
        busy={busy}
        onApprove={() => decide("published")}
        onReject={() => decide("returned")}
        rejectLabel="reviewReturn"
      />
    </div>
  );
}
