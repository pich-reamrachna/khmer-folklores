"use client";

import { useState } from "react";
import { useTranslation } from "../shared/uiText.js";
import { useLanguage } from "../shared/LanguageContext.js";
import SignInForm from "./SignInForm.js";
import SignUpForm from "./SignUpForm.js";
import styles from "./authStyles.js";

// The sign-in / sign-up box, shared by /login and /signup (initialMode says
// which side it opens on). Both forms sit side by side in it; an ink-splash
// overlay (public/splash.jpg) — one of the archive's pictures, a heading, a line and a gold
// button — covers one of them: Daun Penh's Curse beside the sign-in form,
// Ahpt beside the sign-up form. The forms stay put (sign-in left, sign-up
// right); pressing that button slides the overlay across to cover one and
// reveal the other, and the address follows (/login ⇄ /signup)
// without reloading, so a refresh or a shared link lands on the same form.
//
// Phone: no room for the slide — the box shows one form at a time with
// small Sign In / Sign Up tabs above it, and the overlay steps aside.
//
// The sliding layout is a plain <style> below: it changes with the switch
// (.is-signup) and on phone, which inline styles can't.

export default function AuthCard({ initialMode }) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const signup = mode === "signup";
  const tracking = language === "km" ? styles.trackingNone : null;

  function switchTo(next) {
    setMode(next);
    // Keeps any ?next= (where to go after logging in) on the address.
    window.history.replaceState(null, "", (next === "signup" ? "/signup" : "/login") + window.location.search);
  }

  // The phone-only tabs, shown above whichever form is showing.
  const tabs = (
    <div style={styles.tabs} className="auth-tabs">
      <button
        type="button"
        style={{ ...styles.tab, ...(signup ? null : styles.tabActive), ...tracking }}
        className={signup ? "auth-tab" : undefined}
        aria-pressed={!signup}
        onClick={() => switchTo("signin")}
      >
        {t("authLoginButton")}
      </button>
      <button
        type="button"
        style={{ ...styles.tab, ...(signup ? styles.tabActive : null), ...tracking }}
        className={signup ? undefined : "auth-tab"}
        aria-pressed={signup}
        onClick={() => switchTo("signup")}
      >
        {t("authSignupTitle")}
      </button>
    </div>
  );

  // One side of the overlay: its picture behind (artClass places it — a
  // single figure and a wide scene need different framing), then heading,
  // line (when textKey is given) and button.
  const overlayPanel = (side, picture, artClass, titleKey, textKey, buttonKey, target, hidden) => (
    <div className={`auth-overlay-panel auth-overlay-${side}`} inert={hidden}>
      <img src={picture} alt="" className={`auth-overlay-art ${artClass}`} aria-hidden="true" />
      <div className="auth-overlay-copy">
        <h2 className="auth-overlay-title">{t(titleKey)}</h2>
        {textKey && <p className="auth-overlay-text">{t(textKey)}</p>}
        <button type="button" className="auth-overlay-btn" style={tracking ?? undefined} onClick={() => switchTo(target)}>
          {t(buttonKey)}
        </button>
      </div>
    </div>
  );

  return (
    <div className={signup ? "auth-card is-signup" : "auth-card"}>
      {/* The form not showing can't be tabbed to or read out (inert). */}
      <div className="auth-pane auth-pane-signin" inert={signup}>
        <SignInForm tabs={tabs} />
      </div>
      <div className="auth-pane auth-pane-signup" inert={!signup}>
        <SignUpForm tabs={tabs} onGoToLogin={() => switchTo("signin")} />
      </div>

      <div className="auth-overlay-wrap">
        <div className="auth-overlay">
          {overlayPanel(
            "left",
            "/featured_pictures/ahpt.webp",
            "auth-overlay-art-figure",
            "authOverlaySigninTitle",
            null,
            "authLoginButton",
            "signin",
            !signup
          )}
          {overlayPanel(
            "right",
            "/featured_pictures/daun_penhs_curse.webp",
            "auth-overlay-art-scene",
            "authOverlaySignupTitle",
            "authOverlaySignupText",
            "authSignupTitle",
            "signup",
            signup
          )}
        </div>
      </div>

      <style>{`
        .auth-card {
          position: relative;
          width: 100%;
          max-width: 980px;
          height: 680px;
          overflow: hidden;
          background-color: rgba(26, 24, 23, 0.94);
          border: 1px solid rgba(245, 239, 230, 0.08);
          border-radius: 4px;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
        }
        /* Faint ink drips across the top of the card, behind the forms — an
           echo of the overlay's splash (public/splash.jpg), so both halves
           read as one inked page. On the dark card, the splash's pale wash
           shows as ink running down; it fades out partway. Under the forms
           (they sit above it); the overlay covers its own half. */
        .auth-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 55%;
          background-image: url(/splash.jpg);
          background-size: cover;
          background-position: center top;
          filter: sepia(0.35) brightness(0.9);
          opacity: 0.1;
          -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%);
          pointer-events: none;
        }

        /* The two forms stay put — sign-in in the left half, sign-up in the
           right. Only the overlay moves: it covers sign-up while signing
           in, and slides left over sign-in to reveal sign-up. */
        .auth-pane {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 3rem;
          box-sizing: border-box;
          overflow-y: auto;
        }
        .auth-pane-signin {
          left: 0;
        }
        .auth-pane-signup {
          left: 50%;
        }

        /* The overlay works as a mask: a half-width window (the wrap)
           over a full-width layer holding both faces — sign-in's (Ahpt)
           over the left half of the card, sign-up's (Daun Penh's Curse)
           over the right. The window slides across while the layer inside
           counter-slides, so the layer stays fixed to the card: the window
           wipes off one face and uncovers the other, which was sitting
           there all along. */
        .auth-overlay-wrap {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          z-index: 100;
          transition: transform 0.6s ease-in-out;
        }
        .auth-card.is-signup .auth-overlay-wrap {
          transform: translateX(-100%);
        }
        .auth-overlay {
          position: relative;
          left: -100%;
          width: 200%;
          height: 100%;
          background-color: #0f0e0d;
          transition: transform 0.6s ease-in-out;
        }
        .auth-card.is-signup .auth-overlay {
          transform: translateX(50%);
        }
        .auth-overlay-panel {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 3rem 3.5rem;
          box-sizing: border-box;
          text-align: center;
        }
        /* Each side's background: the ink splash (public/splash.jpg) — a
           pale wash at the top bleeding down into black drips, so the
           picture stands against the wash and the words sit on the black.
           Its own layer, so it can be warmed (sepia) and dimmed toward old
           paper without touching the picture or the words in front. */
        .auth-overlay-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          /* A darkening under the splash's lower part (the first layer),
             so its long silver drip fades out behind the words and button
             instead of running through them. */
          background-image: linear-gradient(to bottom, transparent 52%, rgba(10, 9, 8, 0.88) 72%, rgba(10, 9, 8, 0.95) 100%),
            url(/splash.jpg);
          background-size: cover;
          background-position: center top;
          filter: sepia(0.35) brightness(0.82);
          pointer-events: none;
        }
        .auth-overlay-left {
          left: 0;
        }
        .auth-overlay-right {
          right: 0;
        }

        /* The panel's picture, behind the words: faded at the top and
           darkened below so the words read over it. */
        .auth-overlay-art {
          position: absolute;
          left: 50%;
          max-width: none;
          opacity: 0.85;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 62%, transparent 92%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 62%, transparent 92%);
          pointer-events: none;
        }
        /* Ahpt: a single figure in the file's right half, so it's sized by
           height and shifted to centre the figure itself. */
        .auth-overlay-art-figure {
          top: 2%;
          height: 82%;
          width: auto;
          transform: translateX(-74%);
        }
        /* Daun Penh's Curse: a wide scene (the stupa behind the flower clock)
           spanning the file, so it's sized to a little over the panel's
           width and simply centred. */
        .auth-overlay-art-scene {
          top: 4%;
          width: 115%;
          height: auto;
          transform: translateX(-50%);
        }
        .auth-overlay-copy {
          position: relative;
          max-width: 300px;
        }
        .auth-overlay-title {
          font-family: var(--font-fell), var(--font-khmer), serif;
          font-size: 2.3rem;
          font-weight: 400;
          line-height: 1.1;
          color: #f5efe6;
          margin: 0 0 0.75rem;
        }
        .auth-overlay-text {
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #d9d2c5;
          margin: 0 0 1.6rem;
        }
        .auth-overlay-btn {
          background: transparent;
          border: 1px solid #c9a961;
          border-radius: 2px;
          padding: 0.85rem 2.4rem;
          color: #e6c575;
          font-family: var(--font-khmer), var(--font-jakarta), system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        /* No line between heading and button: keep the same gap the line's
           bottom margin would have given. */
        .auth-overlay-title + .auth-overlay-btn {
          margin-top: 0.85rem;
        }
        .auth-overlay-btn:hover {
          background-color: #c9a961;
          color: #1a1817;
        }

        /* The forms' fields and buttons (SignInForm.js, SignUpForm.js). */
        .auth-input:focus {
          box-shadow: 0 1px 0 0 rgba(197, 160, 89, 0.85);
        }
        .auth-button:hover {
          opacity: 0.85;
        }
        .auth-button:disabled {
          opacity: 0.55;
          cursor: default;
        }

        /* Tabs are for phone only. */
        .auth-tabs {
          display: none;
        }

        /* Phone: one form at a time, tabs to switch, no overlay. */
        @media (max-width: 760px) {
          .auth-card {
            height: auto;
          }
          .auth-overlay-wrap {
            display: none;
          }
          .auth-pane {
            position: relative;
            left: 0;
            width: 100%;
            padding: 2rem 1.5rem;
          }
          .auth-pane-signup,
          .auth-card.is-signup .auth-pane-signin {
            display: none;
          }
          .auth-card.is-signup .auth-pane-signup {
            display: flex;
          }
          .auth-tabs {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-overlay-wrap,
          .auth-overlay {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
