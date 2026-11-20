# Khmer Folklores

An archive of Khmer folklores, legends and stories showing the variety in Khmer storytelling.
ICT 340 (Vibe Coding) capstone, American University of Phnom Penh, Fall 2026. Curated by Pich Ream Rachna.

## 1. What this is

Khmer Folklores is a community archive of Khmer legends, ghost stories, superstitions and customs, such as Pous Keng Kang, Neang Neath, Ahpt and Daun Penh's Curse. It is collected from me, my friends, my family and the people around me. The same story is often told differently from one province or family to the next, so every story keeps more than one telling: the first telling, credited to the person who shared it, and other people's versions under it. Anyone can browse and search the archive in English or Khmer. Someone with an account can share their own version of a story, or a story the archive doesn't have yet. Nothing goes public until I, the curator, have reviewed it.

## 2. Who it's for

The archive is for Cambodians who grew up hearing these stories and want to keep them, and for anyone who wants to read them. Most of them will read on a phone, often on mobile data, and many read Khmer more easily than English. What I did for them:

- **Khmer first.** The whole interface switches between English and Khmer. Story titles are shown in Khmer as well as English. Khmer text is never transliterated or replaced. The form catches Khmer typed in a letter order that phones can't draw (it shows a dotted circle ◌), in `utils/khmerOrder.js`. The database refuses the same text, in `supabase/khmer-order.sql`.
- **Words chosen by a Khmer reader.** A code review pointed out that the AI-written Khmer for "returned" and "not accepted" sounded like a government office refusing a form. I chose gentler words myself, such as រង់ចាំការកែសម្រួលពីអ្នក ("waiting for your edits") and មិនបានទទួលយក. I also gave the My Entries page a Khmer name in the menu, កំណត់ត្រារបស់ខ្ញុំ. Later I reviewed all of the Khmer interface text and story summaries. I rewrote much of it myself so it reads naturally in context rather than word for word from the English (for example ស្វែងរករឿង for "Find a story to follow."), and had the AI redraft the rest in the same style.
- **Cambodian dates.** Dates show the day in Phnom Penh (UTC+7), not the server's UTC day, with Khmer month names in Khmer mode (`utils/formatDate.js`). Before this fix, a story shared at 6am in Phnom Penh showed the day before.
- **Phones first.** Every page has a phone layout. On the home page the hero is a poster: picture on top, text below, and a swipe moves between stories. The archive list, My Entries and the review page all have their own phone layouts. Forms lock and show a spinner while sending, so a slow connection doesn't lead to a double submit.
- **Slow connections.** Pictures are preloaded with a time limit (`utils/preloadImages.js`), so a slow connection still gets the page. The home page keeps the archive in memory for the visit (`utils/archiveCache.js`), so coming back doesn't load everything again.
- **Credit without exposing people.** Each telling is credited to the sharer's **username**, never their email. The database only allows letters, numbers, underscores and Khmer in a username, so an email can't be stored there. A story's first telling is credited as "First shared by" on its page.

## 3. How it works

- **Site:** Next.js 15 (App Router) and React 19, JavaScript only, deployed on Vercel.
- **Accounts, data and photos:** Supabase (Auth, Postgres, Storage, Realtime). The only packages are `next`, `react`, `react-dom`, `@supabase/supabase-js` and `@supabase/ssr`.

**Tables**

| Table | What it holds |
|---|---|
| `stories` | One row per story: title, Khmer title, category, the curator's summary, `status` (`pending` / `published` / `rejected`), `rejection_note`, `first_shared_by`, `origin_entry_id` (its first telling), `submitted_at` |
| `entries` | One row per telling: `story_id`, `owner`, `contributor` (username), title, place and `place_khmer`, description, `photo_url`, `status` (`pending` / `published` / `returned`), `return_note`, `edited_at` |
| `entry_edits` | A waiting change to a published telling, one per telling, with its own `status` (`pending` / `returned`) and `return_note`. The published telling stays on the story page until the change is approved. |
| `curators` | The reviewer list. RLS is on with no policies, so only the SQL Editor can read it or add someone. |
| `profiles` | Usernames. UNSURE: this table and its policies were set up before the SQL files in `supabase/` were kept, so its exact definition isn't in the repo. |

The course template calls the reviewer list `reviewers`. In my database `is_reviewer()` simply asks `is_curator()`, so there is one list, not two.

**The three entry statuses**

- `pending`: waiting for review. Only its owner and the curator can see it.
- `published`: public.
- `returned`: sent back with a note. Only its owner and the curator can see it, and the owner can fix it and send it again.

A brand-new story's first telling starts `published`, because it is reviewed together with its story, and the story itself starts `pending`. A trigger does this, in `entry-review.sql` step 4.

**Who can read and write what** (from the SQL in `supabase/`)

| | Logged out | Logged-in contributor | Curator |
|---|---|---|---|
| Read stories | Published only | Published, plus their own pending or rejected stories | All |
| Read tellings | Published tellings of visible stories | The same, plus their own pending or returned tellings | All |
| Add a telling | No | Own, status must be `pending`, published stories only | Same |
| Edit a telling | No | Own unpublished tellings directly (they go back to `pending`). Published tellings only through `entry_edits`. | Can keep their own edits published |
| Delete a telling | No | Own, except the first telling of a published story | Any |
| New story | No | Only through `submit_story()`, which re-checks the lengths and refuses an exact duplicate name | Same |
| Publish or return | No | No | Only through `review_entry()` and `review_entry_edit()`, or by updating `stories` |

Other database rules:
- **Check constraints** on text lengths, invisible characters, place names and photo links. The photo link must be in this project's photos bucket, inside the owner's own folder.
- **A trigger that stops a telling being moved** to another story.
- **A trigger that sets the "Edited" date** on a telling.
- **A rule that refuses an edit that changes nothing.**

UNSURE: the original `CREATE TABLE` for `stories`, `entries` and `profiles`, the week 7 check constraints, and the Storage policies on the `photos` bucket were run in the dashboard. They are not in `supabase/`.

```
Visitor ─► Next.js on Vercel ─► Supabase (Postgres with RLS)
                                    │
contributor adds/edits ──► entries / entry_edits (pending)
                                    │
curator on /review ──► review_entry() / review_entry_edit() / stories update
                                    │
                               published ──► home page, search, story pages
```

## 4. Security decisions

**The gate.**
- **`review_entry(entry_id, decision, note)`** is a `security definer` function, so it runs with the database's rights rather than the caller's. It first checks `is_reviewer()` and returns `false` for anyone else. It only accepts `published` or `returned`, and only changes a telling that is still `pending`. It sets the status, and the note when returning. `review_entry_edit()` does the same for waiting changes: approving copies the change onto the telling, and returning keeps it with the note.
- **Who can call them:** both are revoked from `anon` and granted only to logged-in users, and inside they refuse anyone who isn't a reviewer.
- **Why it lives in the database:** the browser is not mine. Anyone can open the console with the public key and call Supabase directly. The policies refuse a contributor who inserts a telling as `published`, sets their own telling to `published`, or adds themselves to `curators`.
- **What the page does and doesn't protect:** `/review` returns a 404 to non-curators, and the menu only shows "Review Submissions" to me. That only hides the button. It doesn't stop anyone. The database is what refuses them.

**Decisions the briefs left to me**

- **What a returned entry says:** the owner sees "Returned — needs changes" (in Khmer, រង់ចាំការកែសម្រួលពីអ្នក) on My Entries, with my note under "Note from the curator", and an Edit button. **Why:** returning needs a note, both in the form and as a rule in the review form, so the owner always knows what to fix. A story I reject says "Not accepted" (មិនបានទទួលយក) with my note.
- **Whether reviewers can take down published entries:** in the database, yes. The curator can delete any telling and any story. In the app, there is no take-down button. The ⋯ Edit/Delete menu on the story page only appears for a telling's owner. UNSURE whether this is the final decision. Right now a take-down means deleting in the dashboard.
- **What search shows a contributor about their own pending entries:** nothing. The database would let a contributor read their own pending tellings, but the home page, search and story pages ask only for `published`. Pending and returned entries appear only on My Entries. **Why:** otherwise my own pending tellings would sit on the public home page and look published.
- **Edits to published tellings go to review too:** at first an edit set the telling back to `pending`. When I tested it, that hid the whole Pous Keng Kang story until I approved the edit. Now the change waits in `entry_edits`, and the published version stays up.
- **The first telling of a published story can't be deleted by its owner,** because the story is built on it. They can still edit it, and the edit is reviewed.
- **Usernames, not emails,** are what's shown publicly. This is enforced in the database.
- **The login redirect only goes to a page on this site,** so a crafted `?next=` link can't send someone to another website.

## 5. AI use

I used Claude Code, the VS Code extension: Claude Opus 4.8 earlier in the semester and Claude Opus 5.5 from week 11. UNSURE: whether Cline was used for any of the code in this repo. Commits written with AI are marked "(AI-assisted)" in their message. My prompts are recorded in my Prompt Journals for Sprints 2 and 3.

| Model | Task | Verdict |
|---|---|---|
| Claude (Claude Code) | Checking the course gate SQL against my database before running it | **Rewrote.** As written it would have leaked pending tellings, because Postgres ORs read policies. It would also have 404'd approved stories, and refused every edit. I ran an adapted version with one combined read rule and my existing `curators` list. |
| Claude | Contributor side: My Entries, published-only filters, edits going to review | **Kept most, rewrote one rule.** Sending edits back to `pending` hid published stories, so edits moved to `entry_edits`. |
| Claude | Locking the Save button until something changes | **Not accepted alone.** I asked whether the console could still send it. It admitted the lock only covered the screen, so the rule went into the database (`edit-no-changes.sql`). |
| Claude | Review page, `review_entry` / `review_entry_edit` calls | **Kept.** The success check is `data !== true`, not just "no error", because the functions return `false` when refused. |
| Claude | Photo link constraint (Sprint 2) | **Rewrote.** The first version only checked that the link looked like a photo, so `evil.com/.../photos/x.png` passed. It now has to be in my bucket, in the owner's folder. |
| Claude | Khmer interface text | **Mostly kept as drafts, flagged in code.** I chose the status and notice words contributors see myself, from options it gave me with literal translations. |
| Claude | Code review findings: dates, failed lists, a wrong comment, the console attack | **Investigated before changing anything.** The security finding was already blocked by RLS. I fixed the dates, the lists and the comment. |
| Claude | Site design: hero, story page, sign-in box, My Entries, review page, phone layouts | **Kept after many rounds** of my own corrections against screenshots. |

**How I checked:**
- **Ran it:** the dev server, and headless-browser screenshots at desktop and phone width.
- **Read it:** the diffs before committing.
- **Attacked it:** from the console on the live site, logged in as my second, non-curator account. I tried to insert a published telling, publish my own pending telling, call `review_entry`, add myself to `curators`, approve my own edit, change my published telling directly, and publish my own story. Then I logged out and asked for anything unpublished. All eight were refused, on 2026-10-24.

## 6. Sources and credits

The archive's source, as set in `collection.config.js`: "Myself, My Friends, Family, and the People Around Me."

Each telling on the site is credited to the username of the person who shared it, and each story page names its first sharer. Contributors seen in the archive include Pich_Ream (me), achma and Sreng_Vongwathiny.

- UNSURE: the full list of the people each story came from, and whether each one gave permission to be named. This isn't recorded in the code. Fill it in by hand, for example "a grandmother in Kandal who asked not to be named."
- UNSURE: where the pictures in `public/featured_pictures/` came from (Ahpt, Bramat Promong, Crocodile Reincarnation, Daun Penh's Curse, Pous Keng Kang), and who made them. Same for the background images in `public/`, such as the brush strokes, the charcoal texture, the ink splash, the bamboo and the pattern. Credit them here.
- Icons in `public/icons/` (for example `icons8-back-button-48.png`): UNSURE, probably from Icons8, from the file names. Check the licence and credit.
- Fonts: Cinzel, IM Fell English, Plus Jakarta Sans and Kantumruy Pro, from Google Fonts, through `next/font`.

## 7. Running it locally

```bash
git clone https://github.com/pich-reamrachna/khmer-folklores.git
cd khmer-folklores
npm install
npm run dev        # http://localhost:3000
```

Create `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`.env*` is in `.gitignore`, so neither value is committed. The publishable key is public by design: the site's JavaScript sends it to every visitor. Row Level Security, not the key, is what protects the data. Never use the secret key (`sb_secret_…`) in this app.

To rebuild the database, run the files in `supabase/` in the SQL Editor. That folder is kept out of git, so it lives on my machine only. UNSURE: the exact order, and the base table setup they depend on (see section 3).

## 8. Submission checklist

☑ Live URL loads logged out and shows published entries only: yes, https://khmer-folklores.vercel.app/<br>
☑ A stranger cannot publish their own entry through the page or the console: yes, tested 2026-10-24 (eight console attacks with my second account, all refused)<br>
☑ Logged out, the API returns nothing pending or returned: yes, tested 2026-10-24 (attack 5 returned `[]` for unpublished tellings, waiting edits and pending stories)<br>
☑ Contributors can edit and delete only their own entries: yes (RLS on `entries` / `entry_edits`. Tested with a friend's account in Sprint 2.)<br>
☐ No secrets anywhere in the repo history: UNSURE, checked with (how). `.env*` is ignored. Run `git log -p | grep -i "sb_secret\|service_role"` to confirm.<br>
☐ At least eight real entries, each with a credited source: UNSURE. There are 8 published stories, but one is a test story named "test", and sources aren't recorded yet (section 6).<br>
☑ Khmer renders on every screen a user meets, including the queue: yes (the language switch covers every page, including /review)<br>
☑ Works at phone width: yes, tested at 390 × 844 (iPhone size) in Chrome<br>
☐ No test entries, lorem ipsum or TODO comments in shipped pages: NO, not yet. The "test" story is published and needs removing.<br>
☐ No console errors on the main pages: UNSURE, not checked for this README<br>
☐ jesseorndorff is a collaborator on this repo: UNSURE, check in GitHub, Settings, Collaborators<br>
☐ Supabase project restored and awake on (date)<br>
☐ Demo video link opens in a private window: (link)<br>
☐ Reflection pasted in the Canvas submission: (yes / no)<br>
☐ Posted in the Show Your Archive discussion: (yes / no)<br>
☐ Q&A slot booked for (date and time)
