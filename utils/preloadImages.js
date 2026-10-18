// Downloads and decodes images before they're shown, so a page can keep its
// loading state up until its pictures are ready instead of revealing them
// half-loaded. Resolves when every image has loaded OR failed (a broken
// image must never hold the page hostage), or after `timeoutMs` at the
// latest, so a very slow connection still gets the page — just with the
// pictures finishing in afterwards, as before.
export function preloadImages(urls, timeoutMs = 8000) {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return Promise.resolve();

  const loads = unique.map(
    (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // decode() finishes the work of turning the file into pixels, so
          // the first paint of the image is instant, not a visible pop-in.
          (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).finally(resolve);
        };
        img.onerror = resolve;
        img.src = url;
      })
  );

  return Promise.race([
    Promise.all(loads),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
