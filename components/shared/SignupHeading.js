"use client";

import WornCorner from "./WornCorner.js";
import { useTranslation } from "./uiText.js";

// "Share What You Remember" — the large heading to the right of the signup
// form, saying what an account is for, framed by two aged gold corners
// (WornCorner.js) at the top-left and bottom-right. Decorative alongside
// the form's own "Sign Up" title, so it's a <p>, not a second <h1>.
// Plain <style>, not <style jsx>: the phone breakpoint (hidden — no room
// beside the form) is right from the first paint (same reason as
// CandleGlow.js). Typography lives there too, since display changes on
// phone and an inline style would block it.

export default function SignupHeading() {
  const t = useTranslation();

  return (
    <div className="signup-heading">
      <WornCorner className="signup-corner signup-corner-tl" />
      <p className="signup-heading-text">{t("signupHeading")}</p>
      <WornCorner className="signup-corner signup-corner-br" />

      <style>{`
        /* Shrinks to fit the text (up to 484px), so the frame hugs the words
           with equal space on every side instead of leaving a gap on the
           right. */
        .signup-heading {
          flex: 0 1 auto;
          max-width: 484px;
          position: relative;
          /* Room inside the corner frame. */
          padding: 2rem 2.25rem;
        }
        .signup-heading-text {
          margin: 0;
          /* IM Fell English: an old-print serif with real lowercase letters
             (Cinzel is capitals only). It has no Khmer letters, so Khmer
             text falls through to Kantumruy Pro. */
          font-family: var(--font-fell), var(--font-khmer), serif, "Times New Roman";
          font-size: clamp(2.6rem, 4.4vw, 3.8rem);
          font-weight: 400;
          line-height: 1.1;
          /* Gold, glowing like lamplight: a tight bright halo plus a wide
             soft one, in the site's gold. */
          color: #E6C575;
          text-shadow:
            0 0 6px rgba(230, 197, 117, 0.55),
            0 0 22px rgba(212, 175, 55, 0.45),
            0 0 48px rgba(197, 140, 50, 0.3);
          /* Each line centred inside the frame, with even line lengths
             instead of a lone word on its own line. */
          text-align: center;
          text-wrap: balance;
        }
        .signup-corner {
          position: absolute;
          pointer-events: none;
          filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.5));
        }
        .signup-corner-tl { top: 0; left: 0; }
        /* Same drawing, turned 180° for the opposite corner. */
        .signup-corner-br { bottom: 0; right: 0; transform: rotate(180deg); }
        @media (max-width: 760px) {
          .signup-heading { display: none; }
        }
      `}</style>
    </div>
  );
}
