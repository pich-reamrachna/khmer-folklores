// Tells the gold loading bar (components/shared/PageLoadingBar.js) that a
// page change is starting. The bar notices link clicks and Back / Forward by
// itself; call this just before a router.push() from code (a list row, a
// form that sends you on), which it can't see. `href` is where it's going:
// if that's the page already on screen, nothing starts, since the bar only
// finishes when the page actually changes.

export const PAGE_LOADING_EVENT = "page-loading:start";

export function startPageLoading(href) {
  if (typeof window === "undefined") return;
  const url = new URL(href, window.location.href);
  if (url.pathname === window.location.pathname) return;
  window.dispatchEvent(new Event(PAGE_LOADING_EVENT));
}
