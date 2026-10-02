"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// "What people remember" — the testimonial section on a story's page, one
// card per contributor's telling (story.versions). No icons/quote-mark
// graphics, no profile pictures, and no "Contribute a Memory" CTA — those
// aren't built yet.

// Manual month names, not toLocaleDateString("km-KH", ...) — Khmer
// locale data isn't reliably bundled across browsers (confirmed
// Intl.DateTimeFormat.supportedLocalesOf(["km"]) returns empty in some
// Chrome builds), which silently falls back to English instead of
// erroring. This also sidesteps Date's UTC-midnight parsing of "YYYY-MM-DD"
// shifting the day in timezones behind UTC, since it never touches Date.
const MONTH_NAMES = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  km: ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"],
};

function formatDate(dateString, language) {
  const [year, month, day] = dateString.split("-").map(Number);
  const monthName = MONTH_NAMES[language][month - 1];
  return language === "km" ? `${day} ${monthName} ${year}` : `${monthName} ${day}, ${year}`;
}

const styles = {
  section: {
    width: "100%",
    boxSizing: "border-box",
    padding: "4rem 2rem 6rem",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#08040A",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
    color: "#F5EFE6",
  },
  container: {
    maxWidth: 1560,
    width: "100%",
    margin: "0 auto",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "0 0 1rem",
  },
  eyebrowLine: {
    height: 1,
    width: 32,
    backgroundColor: "rgba(197, 160, 89, 0.65)",
  },
  // eyebrowText: deliberately not translated — a decorative label, kept
  // English like the site's other stylistic branding text.
  eyebrowText: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#E6C575",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
  },
  // title/subtitle: this section's own static heading copy is
  // translated, so each needs var(--font-khmer) explicitly instead of
  // inheriting `section`'s Latin-only stack.
  // fontSize: fluid, capped at the same 2.75rem desktop already used —
  // matches StoryDetails.js's h1 clamp formula instead of a fixed size
  // that doesn't shrink on phone.
  title: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "clamp(2rem, 6vw, 2.75rem)",
    fontWeight: 600,
    color: "#F5EFE6",
    lineHeight: 1.15,
    margin: "0 0 1rem",
  },
  subtitle: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1.05rem",
    color: "#BBAEBF",
    fontWeight: 300,
    lineHeight: 1.6,
    maxWidth: 640,
    margin: "0 0 2.5rem",
  },
  // Matches ArchiveBrowser.js's listHeader/listCount pattern.
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderBottom: "1px solid #2A172F",
    paddingBottom: "0.85rem",
    marginBottom: "1.25rem",
  },
  // Translated ("Tellings" label) — needs var(--font-khmer).
  listCount: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#8A7F91",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    margin: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  card: {
    maxWidth: 800,
    boxSizing: "border-box",
    padding: "1.75rem 2rem",
    borderRadius: 16,
    border: "1px solid #2A172F",
    backgroundColor: "#120916",
  },
  // Optional contributor photo. Full card width, capped height so a tall
  // portrait doesn't dominate the card; object-fit keeps it from stretching.
  photo: {
    width: "100%",
    maxHeight: 360,
    objectFit: "cover",
    borderRadius: 12,
    display: "block",
    margin: "0 0 1.25rem",
  },
  // Can now show descriptionKhmer — needs var(--font-khmer) explicitly,
  // since Georgia has no Khmer glyphs (would fall back to a generic
  // system Khmer font instead of the loaded Kantumruy Pro).
  quote: {
    fontFamily: "var(--font-khmer), Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
    fontSize: "1.1rem",
    lineHeight: 1.7,
    color: "#F5EFE6",
    margin: "0 0 1.25rem",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #2A172F",
  },
  contributorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  contributor: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#F5EFE6",
    margin: 0,
  },
  // Locale-formatted date can include a Khmer month name (km-KH), so
  // needs var(--font-khmer) explicitly like the other swappable text.
  date: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.8rem",
    color: "#8A7F91",
    margin: 0,
  },
  // letterSpacing is a Latin tracking convention that pries apart Khmer's
  // stacked glyph clusters — spread this in when the text is Khmer.
  trackingNone: {
    letterSpacing: "normal",
  },
  // Can now show placeKhmer — same reasoning as quote above.
  place: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#8A7F91",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: 0,
    whiteSpace: "nowrap",
  },
  // The share button. Base is inline (only :hover lives in globals.css) so
  // the Khmer tracking fix can be spread in without clashing with a
  // stylesheet rule on the same property.
  shareBtn: {
    display: "inline-block",
    padding: "0.55rem 1.2rem",
    border: "none",
    borderRadius: 10,
    backgroundColor: "#C5A059",
    color: "#0C0A12",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  // Transient "log in to contribute" notice for logged-out visitors who tap
  // the share button. Kept mounted and toggled via toastHidden/toastVisible
  // so it animates both in and out; the back-ease on transform gives the pop.
  toast: {
    position: "fixed",
    bottom: "2rem",
    left: "50%",
    zIndex: 1000,
    backgroundColor: "#1D1024",
    border: "1px solid #C5A059",
    color: "#F5EFE6",
    padding: "0.8rem 1.4rem",
    borderRadius: 10,
    fontSize: "0.9rem",
    fontWeight: 600,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  toastHidden: {
    opacity: 0,
    transform: "translateX(-50%) translateY(14px) scale(0.9)",
    pointerEvents: "none",
  },
  toastVisible: {
    opacity: 1,
    transform: "translateX(-50%) translateY(0) scale(1)",
    pointerEvents: "auto",
  },
};

export default function StoryMemories({ versions, storyId }) {
  const { language } = useLanguage();
  const t = useTranslation();
  // Defaults to logged-out on first render (localStorage/session isn't read
  // until mount) — same accepted one-frame flash NavBar documents.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setIsLoggedIn(!!session)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // Logged-out visitors get a toast instead of a trip to the gated page.
  const promptLogin = () => {
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 3000);
  };

  if (!versions || versions.length === 0) return null;

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>Voices from the Community</span>
        </p>

        <h2 style={styles.title}>{t("memoriesTitle")}</h2>
        <p style={styles.subtitle}>{t("memoriesSubtitle")}</p>

        <div style={styles.listHeader}>
          <p style={{ ...styles.listCount, ...(language === "km" ? styles.trackingNone : null) }}>
            {versions.length} {t("memoriesTellingsCount")}
          </p>
          {isLoggedIn ? (
            <Link
              href={`/${storyId}/contribute`}
              className="share-version-btn"
              style={{ ...styles.shareBtn, ...(language === "km" ? styles.trackingNone : null) }}
            >
              {t("memoriesShareButton")}
            </Link>
          ) : (
            <button
              type="button"
              className="share-version-btn"
              style={{ ...styles.shareBtn, ...(language === "km" ? styles.trackingNone : null) }}
              onClick={promptLogin}
            >
              {t("memoriesShareButton")}
            </button>
          )}
        </div>

        <div style={styles.list}>
          {versions.map((version, index) => {
            // contributor is never translated (it's a name); description
            // and place swap by language, same rule as everywhere else.
            const description = pickText(language, version.descriptionKhmer, version.description);
            const place = pickText(language, version.placeKhmer, version.place);
            return (
              <div key={`${version.contributor}-${index}`} style={styles.card}>
                {version.photoUrl ? (
                  <img
                    src={version.photoUrl}
                    alt={place ? `Photo shared from ${place}` : "Photo shared with this telling"}
                    style={styles.photo}
                  />
                ) : null}
                <p style={styles.quote}>&ldquo;{description}&rdquo;</p>
                <div style={styles.footer}>
                  <div style={styles.contributorGroup}>
                    <p style={styles.contributor}>{version.contributor}</p>
                    {version.date ? <p style={styles.date}>{formatDate(version.date, language)}</p> : null}
                  </div>
                  {place ? (
                    <p style={{ ...styles.place, ...(language === "km" ? styles.trackingNone : null) }}>
                      {place}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{ ...styles.toast, ...(showToast ? styles.toastVisible : styles.toastHidden) }}
        role="status"
        aria-live="polite"
        aria-hidden={!showToast}
      >
        {t("memoriesLoginToast")}
      </div>
    </section>
  );
}
