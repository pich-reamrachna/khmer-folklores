// Pulls the bucket-relative path out of a public photos URL (everything after
// ".../photos/"), or null if it isn't one of our storage URLs. Used to delete
// the underlying file when a telling is removed or its photo is swapped, so the
// bucket doesn't fill with orphaned images.
const MARKER = "/storage/v1/object/public/photos/";

export function photoStoragePath(url) {
  if (!url) return null;
  const i = url.indexOf(MARKER);
  return i === -1 ? null : url.slice(i + MARKER.length);
}
