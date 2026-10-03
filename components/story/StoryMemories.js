"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import { useContributeModal } from "../contribute/contributeModalContext.js";
import { pickText, useLanguage } from "../shared/LanguageContext.js";
import { useTranslation } from "../shared/uiText.js";

// "What people remember" — the tellings on a story's page, shown as a flat
// Reddit-style comment thread (one entry per contributor's telling). Each
// telling shows its title + byline collapsed, expands on click to reveal the
// body/photo, and — for the owner — has a three-dots menu to edit or delete.

// Manual month names, not toLocaleDateString("km-KH", ...) — Khmer locale
// data isn't reliably bundled across browsers (Intl.DateTimeFormat
// .supportedLocalesOf(["km"]) returns empty in some Chrome builds), which
// silently falls back to English. This also sidesteps Date's UTC-midnight
// parsing of "YYYY-MM-DD" shifting the day in timezones behind UTC.
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
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderBottom: "1px solid #2A172F",
    paddingBottom: "0.85rem",
    marginBottom: "0.5rem",
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
  // The thread fills the container width (same as the header above it).
  thread: {
    width: "100%",
  },
  // The clickable summary (title + byline). Clicking/Enter/Space toggles the
  // body open or closed.
  summary: {
    cursor: "pointer",
  },
  // The telling's own title (single field, English or Khmer) — needs the
  // Khmer font stack explicitly.
  tellingTitle: {
    fontFamily: "var(--font-khmer), var(--font-cinzel), serif, 'Times New Roman'",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#F5EFE6",
    lineHeight: 1.3,
    margin: 0,
    // minWidth 0 lets it shrink in the flex header; break long unbroken titles.
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  // contributor · place · date. Khmer font stack since place/date can be Khmer.
  byline: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.8rem",
    color: "#8A7F91",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.4rem",
    margin: "0.3rem 0 0",
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  bylineName: {
    color: "#F5EFE6",
    fontWeight: 700,
  },
  // whiteSpace pre-wrap keeps the line breaks a contributor typed;
  // overflowWrap anywhere breaks a long unbroken run (e.g. "wwww…" or
  // space-less Khmer) instead of letting it overflow the wrapper.
  body: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "#D8CFE0",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: "0.75rem 0 0",
  },
  photo: {
    width: "100%",
    maxWidth: 360,
    maxHeight: 360,
    objectFit: "cover",
    borderRadius: 12,
    display: "block",
    margin: "0.85rem 0 0",
  },
  // Owner-only three-dots menu, pinned to the telling's top-right.
  menuWrap: {
    position: "absolute",
    top: "0.9rem",
    right: "0.6rem",
    zIndex: 5,
  },
  menuButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: 6,
  },
  // PNG recolored via mask-image (background-color shows through the opaque
  // parts), the same icon technique used across the app.
  menuIcon: {
    display: "inline-block",
    width: 18,
    height: 18,
    backgroundColor: "#8A7F91",
    WebkitMaskImage: "url(/icons/icons8-three-dots-30.png)",
    maskImage: "url(/icons/icons8-three-dots-30.png)",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  },
  menuDropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    zIndex: 10,
    minWidth: 150,
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 10,
    padding: "0.3rem",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
  },
  // Base only (hover lives in globals.css, since Edit is a next/link Link that
  // styled-jsx can't scope through).
  menuItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "0.5rem 0.7rem",
    borderRadius: 6,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#F5EFE6",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  menuItemDanger: {
    color: "#E0736A",
  },
  // letterSpacing is a Latin tracking convention that pries apart Khmer's
  // stacked glyph clusters — spread this in when the text is Khmer.
  trackingNone: {
    letterSpacing: "normal",
  },
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
  // Delete-confirmation dialog (replaces window.confirm, themed to match).
  confirmOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    boxSizing: "border-box",
    backgroundColor: "rgba(8, 4, 10, 0.6)",
    WebkitBackdropFilter: "blur(6px)",
    backdropFilter: "blur(6px)",
  },
  confirmDialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#120916",
    border: "1px solid #2A172F",
    borderRadius: 16,
    padding: "1.75rem",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
  },
  confirmMessage: {
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "#F5EFE6",
    margin: "0 0 1.5rem",
  },
  confirmButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
  },
  confirmCancel: {
    padding: "0.6rem 1.2rem",
    borderRadius: 10,
    border: "1px solid #2A172F",
    backgroundColor: "transparent",
    color: "#F5EFE6",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmDelete: {
    padding: "0.6rem 1.2rem",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#9B3B33",
    color: "#F5EFE6",
    fontFamily: "var(--font-khmer), var(--font-jakarta), system-ui, sans-serif",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
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

export default function StoryMemories({ versions, storyId, storyTitle, storyTitleKhmer }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = useTranslation();
  const { open } = useContributeModal();
  // The signed-in user's id (null when logged out) — drives both the share
  // button and which tellings show the owner menu. Defaults to logged-out on
  // the first render, the same accepted one-frame flash NavBar documents.
  const [userId, setUserId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  // Which tellings are expanded / which menu is open, keyed by display index.
  const [expanded, setExpanded] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  // The telling awaiting delete confirmation (null = no dialog open).
  const [pendingDelete, setPendingDelete] = useState(null);
  const toastTimer = useRef(null);
  const isLoggedIn = !!userId;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setUserId(session?.user?.id ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // Close the open owner-menu when clicking anywhere outside a menu.
  useEffect(() => {
    if (openMenu === null) return;
    const onDocMouseDown = (e) => {
      if (!e.target.closest(".telling-menu")) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [openMenu]);

  // Escape cancels the delete-confirmation dialog.
  useEffect(() => {
    if (!pendingDelete) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPendingDelete(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pendingDelete]);

  const showToast = (message) => {
    setToastMsg(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 3000);
  };

  // Logged-out visitors get a toast instead of a trip to the gated page.
  const promptLogin = () => showToast(t("memoriesLoginToast"));

  const toggleExpanded = (i) => setExpanded((c) => ({ ...c, [i]: !c[i] }));

  const requestDelete = (version) => {
    setOpenMenu(null);
    setPendingDelete(version);
  };
  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = async () => {
    const version = pendingDelete;
    setPendingDelete(null);
    if (!version) return;
    const supabase = createClient();
    // .select() so we can confirm a row actually came back; RLS lets only the
    // owner delete, so no row means it didn't happen.
    const { data, error } = await supabase
      .from("entries")
      .delete()
      .eq("id", version.id)
      .select();
    if (error || !data || data.length === 0) {
      console.error("Entry delete saved no rows:", version.id, error);
      showToast(t("contributeNotSaved"));
      return;
    }
    router.refresh();
  };

  if (!versions || versions.length === 0) return null;

  // Newest first for the thread. versions arrive oldest-first (with undated
  // ones ahead of all), so reversing puts newest on top and undated at the
  // bottom — without touching StoryDetails, which still reads versions[0].
  const thread = versions.slice().reverse();

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
          <button
            type="button"
            className="share-version-btn"
            style={{ ...styles.shareBtn, ...(language === "km" ? styles.trackingNone : null) }}
            onClick={
              isLoggedIn
                ? () => open({ storyId, storyTitle, storyTitleKhmer })
                : promptLogin
            }
          >
            {t("memoriesShareButton")}
          </button>
        </div>

        <div style={styles.thread}>
          {thread.map((version, index) => {
            // contributor is never translated (it's a name); description,
            // place, and the telling's title swap/display by language.
            const description = pickText(language, version.descriptionKhmer, version.description);
            const place = pickText(language, version.placeKhmer, version.place);
            const isExpanded = !!expanded[index];
            const bodyId = `telling-body-${index}`;
            const isOwner = !!userId && version.owner === userId;
            return (
              <div key={version.id ?? index} className="thread-item">
                {isOwner ? (
                  <div
                    className="telling-menu"
                    style={
                      openMenu === index
                        ? { ...styles.menuWrap, zIndex: 20 }
                        : styles.menuWrap
                    }
                  >
                    <button
                      type="button"
                      style={styles.menuButton}
                      aria-label={t("menuMore")}
                      aria-haspopup="true"
                      aria-expanded={openMenu === index}
                      onClick={() => setOpenMenu(openMenu === index ? null : index)}
                    >
                      <span style={styles.menuIcon} aria-hidden="true" />
                    </button>
                    {openMenu === index ? (
                      <div style={styles.menuDropdown} role="menu">
                        <button
                          type="button"
                          className="telling-menu-item"
                          style={styles.menuItem}
                          role="menuitem"
                          onClick={() => {
                            setOpenMenu(null);
                            open({
                              storyId,
                              storyTitle,
                              storyTitleKhmer,
                              entry: {
                                id: version.id,
                                title: version.title,
                                place: version.place,
                                placeKhmer: version.placeKhmer,
                                description: version.description,
                                photoUrl: version.photoUrl,
                              },
                            });
                          }}
                        >
                          {t("menuEdit")}
                        </button>
                        <button
                          type="button"
                          className="telling-menu-item"
                          style={{ ...styles.menuItem, ...styles.menuItemDanger }}
                          role="menuitem"
                          onClick={() => requestDelete(version)}
                        >
                          {t("menuDelete")}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* The summary is a keyboard-accessible toggle (role=button); it
                    holds block content, so it can't be a real <button>. */}
                <div
                  style={styles.summary}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={bodyId}
                  onClick={() => toggleExpanded(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpanded(index);
                    }
                  }}
                >
                  {version.title ? <h3 style={styles.tellingTitle}>{version.title}</h3> : null}
                  <p style={{ ...styles.byline, ...(language === "km" ? styles.trackingNone : null) }}>
                    <span style={styles.bylineName}>{version.contributor}</span>
                    {place ? <span>· {place}</span> : null}
                    {version.date ? <span>· {formatDate(version.date, language)}</span> : null}
                  </p>
                </div>

                {isExpanded ? (
                  <div id={bodyId}>
                    <p style={styles.body}>{description}</p>
                    {version.photoUrl ? (
                      <img
                        src={version.photoUrl}
                        alt={place ? `Photo shared from ${place}` : "Photo shared with this telling"}
                        style={styles.photo}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{ ...styles.toast, ...(toastMsg ? styles.toastVisible : styles.toastHidden) }}
        role="status"
        aria-live="polite"
        aria-hidden={!toastMsg}
      >
        {toastMsg}
      </div>

      {pendingDelete ? (
        <div
          style={styles.confirmOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cancelDelete();
          }}
        >
          <div style={styles.confirmDialog}>
            <p style={styles.confirmMessage}>{t("deleteConfirm")}</p>
            <div style={styles.confirmButtons}>
              <button type="button" className="confirm-btn" style={styles.confirmCancel} onClick={cancelDelete}>
                {t("cancel")}
              </button>
              <button type="button" className="confirm-btn" style={styles.confirmDelete} onClick={confirmDelete}>
                {t("menuDelete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Thread rail + hover live here, not inline — a stylesheet rule can't
          override an inline border, and hover needs a rule. Native <div>, so
          styled-jsx scoping applies. position:relative anchors the owner menu;
          the right padding keeps the title clear of it. The confirm buttons'
          hover uses opacity (a different property from their inline bg, so no
          inline-vs-stylesheet clash). */}
      <style jsx>{`
        .thread-item {
          position: relative;
          border-left: 2px solid #2a172f;
          padding: 1.1rem 2.75rem 1.1rem 1.25rem;
          transition: border-color 0.15s ease;
        }
        .thread-item:hover {
          border-color: #c5a059;
        }
        .confirm-btn {
          transition: opacity 0.15s ease;
        }
        .confirm-btn:hover {
          opacity: 0.85;
        }
      `}</style>
    </section>
  );
}
