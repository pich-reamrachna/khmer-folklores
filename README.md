# ChangKeang

ChangKeang is an archive of Khmer legends, folktales and customs, showing how the same story is told differently from one teller to the next.
ICT 340 (Vibe Coding) capstone, American University of Phnom Penh, Fall 2026. Curated by Pich Ream Rachna.

## 1. What this is

ChangKeang is a community archive of Khmer legends, ghost stories, superstitions and customs, such as Pous Keng Kang, Neang Neath, Ahpt and Daun Penh's Curse. It is collected from me, my friends, my family and the people around me. The same story is often told differently from one province or family to the next, so every story keeps more than one telling: the first telling, credited to the person who shared it, and other people's versions under it. Anyone can browse and search the archive in English or Khmer. Someone with an account can share their own version of a story, or a story the archive doesn't have yet. Nothing goes public until I, the curator, have reviewed it.

## 2. Who it's for

The archive is for Cambodians who grew up hearing these stories and want to keep them, and for anyone who wants to read them. Most of them will read on a phone, often on mobile data, and many read Khmer more easily than English. What I did for them:

- **Khmer first.** The whole interface switches between English and Khmer. Story titles are shown in Khmer as well as English. Khmer text is never transliterated or replaced. The form catches Khmer typed in a letter order that phones can't draw (it shows a dotted circle ◌), in `utils/khmerOrder.js`. The database refuses the same text, in `supabase/khmer-order.sql`.
- **One language is enough to share.** Some contributors only know Khmer and some only know English, so a new story needs just one name, in either language, and a telling can be written in either. When I approve a story I add the missing name and write the summary in both languages, so every published story has both. The approve form and the database both enforce this (`supabase/story-names-either.sql`). A story shared with only a Khmer name gets a web address like `/story-3fa9c1`, because addresses are made from the English name.
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
| `stories` | One row per story: title, Khmer title (a waiting story may have only one of the two), category, the curator's summary, `status` (`pending` / `published` / `rejected`), `rejection_note`, `first_shared_by`, `origin_entry_id` (its first telling), `submitted_at` |
| `entries` | One row per telling: `story_id`, `owner`, `contributor` (username), title, place and `place_khmer`, description, `photo_url`, `status` (`pending` / `published` / `returned`), `return_note`, `edited_at` |
| `entry_edits` | A waiting change to a published telling, one per telling, with its own `status` (`pending` / `returned`) and `return_note`. The published telling stays on the story page until the change is approved. |
| `curators` | The reviewer list. RLS is on with no policies, so only the SQL Editor can read it or add someone. |
| `profiles` | Usernames. Created in the Supabase dashboard early in the semester, before I started saving SQL as files, so its definition isn't in `supabase/`. |

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
| New story | No | Only through `submit_story()`, which re-checks the lengths, needs at least one name, and refuses an exact duplicate name in either language | Same |
| Publish or return | No | No | Only through `review_entry()` and `review_entry_edit()`, or by updating `stories` |

Other database rules:
- **Check constraints** on text lengths, invisible characters, place names and photo links. The photo link must be in this project's photos bucket, inside the owner's own folder.
- **A trigger that stops a telling being moved** to another story.
- **A trigger that sets the "Edited" date** on a telling.
- **A rule that refuses an edit that changes nothing.**
- **A published story must have both names,** the Khmer one in Khmer script.
- **Each language stays in its own field:** no Khmer letters in a story's English name or summary, and no English letters in its Khmer ones (`supabase/languages-in-own-fields.sql`).

The original `CREATE TABLE` statements for `stories`, `entries` and `profiles`, the week 7 check constraints, and the photo upload and read rules on the `photos` bucket were run in the dashboard early in the semester and aren't saved as files. Everything from Sprint 2 on is in `supabase/`, including the photo delete rules (`photo-storage-delete.sql`).

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
- **Whether reviewers can take down published entries:** yes, but only in the Supabase dashboard, on purpose. The database lets me, as curator, delete any telling or story, or set a story back from published to hide it. The site has no take-down button: the ⋯ Edit/Delete menu on a telling only appears for its owner. **Why:** a proper take-down inside the app needs more than a button. The contributor should be told why their telling was removed, and My Entries would need a new state to show it, like the note on a returned telling. I haven't designed that whole process yet, and there wasn't time to build it well before the final. I'd like to add it next.
- **What search shows a contributor about their own pending entries:** nothing. The database would let a contributor read their own pending tellings, but the home page, search and story pages ask only for `published`. Pending and returned entries appear only on My Entries. **Why:** otherwise my own pending tellings would sit on the public home page and look published.
- **Edits to published tellings go to review too:** at first an edit set the telling back to `pending`. When I tested it, that hid the whole Pous Keng Kang story until I approved the edit. Now the change waits in `entry_edits`, and the published version stays up.
- **The first telling of a published story can't be deleted by its owner,** because the story is built on it. They can still edit it, and the edit is reviewed.
- **Usernames, not emails,** are what's shown publicly. This is enforced in the database.
- **The login redirect only goes to a page on this site,** so a crafted `?next=` link can't send someone to another website.
- **Photos stay in a public bucket.** Anyone who has a photo's exact link can open it, even while its telling is pending or returned. **Why:** the link is a long random name (`<owner id>/<random id>.jpg`), and a logged-out visitor can't find it, because the database never gives them unpublished tellings. A private bucket would need short-lived signed links on every page that shows a photo, plus a change to how photos are stored and checked, which was too risky to change right before the final. **Deleting does remove the file:** owners can delete photos in their own folder and the curator can delete any (`supabase/photo-storage-delete.sql`, added 2026-11-21). Before that, deleting a telling or replacing its photo left the old file online.

## 5. AI use

I used Claude Code, the VS Code extension, with Claude Opus (Opus 4.8 earlier in the semester and Opus 5.5 from week 11) and Claude Sonnet. I didn't use Cline. Commits written with AI are marked "(AI-assisted)" in their message. My prompts are recorded in my Prompt Journals for Sprints 2 and 3.

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

**How sources are credited:** each entry (each telling) comes from the person who shared it, and it is credited on the site by their username. Each story page also names its first sharer. Everyone listed below agreed to be named by their username. The tellings I wrote myself are credited to me.

| Story | Shared by | Where the telling is from |
|---|---|---|
| Ahpt | Piseth_Tyvirakpoung | Prey Veng |
| Boeung Yeak Lorm | Lorn_Nida | Ratanakiri |
| Bramat Promong | Sreng_Vongwathiny | Phnom Penh |
| Bramat Promong | me, Pich Ream Rachna (as Pich_Ream_Rachna) | Kampong Cham |
| Crocodile Reincarnation | Heng_leangmeng | All over Cambodia |
| Daun Penh's Curse | Ngov_Kimyou | Phnom Penh |
| Neang Neath | Sreng_Vongwathiny | Phnom Penh |
| Neang Neath | my grandfather, Pich Ream (as Pich_Ream) | Kandal |
| Phnom Neang Kangrei | me, Pich Ream Rachna (as achma) | Kampong Chhnang |
| Pous Keng Kang | me, Pich Ream Rachna (as achma) | Banteay Meanchey |

- Where a sharer first heard a story (a grandparent, a village, a friend) isn't recorded separately. A sharer can mention it in the telling itself.
- Story pictures in `public/featured_pictures/` (Ahpt, Bramat Promong, Crocodile Reincarnation, Daun Penh's Curse, Pous Keng Kang): generated with an AI image tool.
- Background images in `public/` (the brush strokes, the charcoal texture, the ink splash, the bamboo and the pattern): generated with an AI image tool from reference pictures I chose of each element.
- Icons in `public/icons/` (for example `icons8-back-button-48.png`): free icons found online. Three of them (back button, search, three dots) come from Icons8, judging by their file names.
- Fonts: Cinzel, IM Fell English and Plus Jakarta Sans, from Google Fonts through `next/font`. The three Khmer fonts, Kantumruy Pro, Noto Serif Khmer and Konkhmer Sleokchher, are local files in `app/fonts/` (Khmer letters only, so they can be drawn bigger than Latin text). All six are under the SIL Open Font License, and the licence files for the local ones are next to them.
- Logo (`public/logo.png`): generated with an AI image tool, then cut out with its dark background made transparent.
- Title texture (`public/textures/title-grain.jpg`): generated for this project with a script. It isn't from any outside source.

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

To rebuild the database, first create the base tables and early rules (see section 3, they were made in the dashboard and aren't saved as files). Then run the files in `supabase/` in the SQL Editor, in the order I wrote them: `share-a-memory.sql`, `edited-label.sql`, `story-name-constraints.sql`, `story-text-constraints.sql`, `entry-review.sql`, `entry-edits.sql`, `edit-no-changes.sql`, `khmer-order.sql`, `realtime.sql`, `photo-storage-delete.sql`. (`khmer-text-fixes.sql` only corrects existing text, so a fresh database doesn't need it.) The folder is kept out of git, so it lives on my machine only.

## 8. Submission checklist

- Live URL loads logged out and shows published entries only: yes, https://khmer-folklores.vercel.app/
- A stranger cannot publish their own entry through the page or the console: yes, tested 2026-10-24 (eight console attacks with my second account, all refused) and again on 2026-11-21 with the contributor account (eight attempts, all refused)
- Logged out, the API returns nothing pending or returned: yes, tested 2026-10-24, and again on 2026-11-21 with a fresh pending telling, which a logged-out visitor couldn't see
- Contributors can edit and delete only their own entries: yes (RLS on `entries` and `entry_edits`; editing and deleting someone else's telling returned nothing changed, tested 2026-11-21)
- No secrets anywhere in the repo history: yes, checked 2026-11-21 by searching every commit (`git log -p --all`) for `sb_secret`, `service_role`, JWTs, private keys and passwords. The only matches are this README's own warnings, and no `.env` file has ever been committed.
- At least eight real entries, each with a credited source: yes, 9 published tellings across 7 stories, each credited to the person who shared it (section 6)
- Khmer renders on every screen a user meets, including the queue: yes, the language switch covers every page, including /review, the status words and the error messages
- Works at phone width: yes, tested at 390 × 844 (iPhone size) in Chrome
- No test entries, lorem ipsum or TODO comments in shipped pages: yes, checked 2026-11-21. Every test story, telling and photo was deleted from the database the same day.
- No console errors on the main pages: yes, checked 2026-11-21 on the home page, /share, /login, /signup, a story page, /my-entries and /review
- jesseorndorff is a collaborator on this repo: yes
- Supabase project restored and awake on 2026-11-21
- Demo video link opens in a private window: yes, (link)
- Reflection pasted in the Canvas submission: yes
- Posted in the Show Your Archive discussion: yes
- Q&A slot booked for 2026-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     12-04 9:50 AM
