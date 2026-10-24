// Edits of a published telling wait on the side (the entry_edits table)
// until the curator approves them — the telling itself keeps showing the
// published version meanwhile. These two helpers are shared by the story page
// and /my-entries.

// The embedded entry_edits row (at most one per telling; PostgREST returns
// it as an object, or null) in camelCase, or null when there's none.
export function toEdit(row) {
  const edit = Array.isArray(row) ? row[0] : row;
  if (!edit) return null;
  return {
    id: edit.id,
    title: edit.title,
    place: edit.place,
    placeKhmer: edit.place_khmer,
    description: edit.description,
    photoUrl: edit.photo_url,
    status: edit.status,
    returnNote: edit.return_note,
  };
}

// What the edit form opens with (ContributeForm's `entry`): the waiting
// edit's text if there is one — so editing again continues from the owner's
// last changes, not the published version — else the telling's own.
// status and publishedPhotoUrl tell the form where to save (an edit for a
// published telling, the telling itself otherwise) and which photo file is
// still on show and mustn't be deleted.
export function formEntry(telling) {
  const source = telling.edit ?? telling;
  return {
    id: telling.id,
    status: telling.status,
    publishedPhotoUrl: telling.photoUrl ?? null,
    title: source.title,
    place: source.place,
    placeKhmer: source.placeKhmer,
    description: source.description,
    photoUrl: source.photoUrl,
  };
}
