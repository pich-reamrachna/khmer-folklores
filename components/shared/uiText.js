"use client";

import { useLanguage } from "./LanguageContext.js";

// Static interface copy — nav links, button labels, section headings,
// placeholder text — as opposed to per-entry data (title/description/
// etc.), which uses pickText() in LanguageContext.js instead. Grouped by
// the component that renders each string.
//
// The Khmer was reviewed by the curator in November 2026 and written for
// natural, everyday phrasing in context rather than word-for-word from the
// English, so the two don't always say exactly the same thing.

const uiText = {
  // NavBar.js / Footer.js (shared). The two page links are translated;
  // navShareMemory is also My Entries' empty-state button (SubmissionsList.js).
  navBrowseArchive: { en: "Browse the Archive", km: "បណ្ណសាររឿង" },
  navShareMemory: { en: "Share a Memory", km: "ចែករំលែករឿង" },
  navOpenMenu: { en: "Open menu", km: "បើកម៉ឺនុយ" },
  navCloseMenu: { en: "Close menu", km: "បិទម៉ឺនុយ" },
  navChangeLanguage: { en: "Change language", km: "ប្ដូរភាសា" },
  navAccount: { en: "Account", km: "គណនី" },
  // Translated, unlike the top bar's links: editReturnedShort sends people
  // here by name, so a Khmer reader has to be able to find it in the menu.
  navMyEntries: { en: "My Entries", km: "កំណត់ត្រារបស់ខ្ញុំ" },
  // The rest of the account menu, translated for the same reason.
  navReviewSubmissions: { en: "Review Submissions", km: "ពិនិត្យរឿងដែលបានផ្ញើមក" },
  navLogOut: { en: "Log Out", km: "ចាកចេញ" },
  // The sign-in pill in the top bar and phone menu — the same words as the
  // sign-in and sign-up buttons themselves.
  navSignIn: { en: "Sign In / Sign Up", km: "ចូលគណនី/បង្កើតគណនី" },

  // StoryHero.js.
  heroPrevStory: { en: "Previous story", km: "រឿងមុន" },
  heroNextStory: { en: "Next story", km: "រឿងបន្ទាប់" },
  heroReadStory: { en: "Read Story", km: "អានរឿងនេះ" },

  // ArchiveBrowser.js / ArchiveSearch.js. archiveEyebrow isn't word for
  // word: it sits above the list of every story, so "all stories".
  archiveEyebrow: { en: "Open the Ledger", km: "រឿងទាំងអស់" },
  archiveTitle: { en: "Find a story to follow.", km: "ស្វែងរករឿង" },
  archiveSubtitle: {
    en: "A living archive of Khmer legends, spirits, and the community memories that keep them alive.",
    km: "បណ្ណសារប្រមូលផ្ដុំរឿងព្រេងខ្មែរ ដែលយើងនៅតែចងចាំ និងនិទានប្រាប់គ្នារហូតមកដល់សព្វថ្ងៃ។",
  },
  // Templates: {n} is the story count, {query} the search as typed — Khmer
  // puts them mid-sentence, so they can't simply be glued on in front.
  archiveStoriesInView: { en: "{n} Stories in View", km: "មាន {n} រឿង" },
  archiveNoResults: {
    en: "\"{query}\" does not match any stories.",
    km: "សូមអភ័យទោស យើងរកមិនឃើញរឿង «{query}» ទេ។",
  },
  searchPlaceholder: {
    en: "Search by name, place, or story",
    km: "ស្វែងរកតាមពាក្យគន្លឹះ ទីកន្លែង ឬចំណងជើងរឿង",
  },
  searchAriaLabel: { en: "Search stories", km: "ស្វែងរករឿង" },
  clearSearchAriaLabel: { en: "Clear search", km: "លុបចេញ" },

  // BackButton.js
  goBack: { en: "Go Back", km: "ត្រឡប់ក្រោយ" },

  // StoryMemories.js.
  memoriesEyebrow: { en: "Voices from the Community", km: "ការនិទានរបស់អ្នកដទៃ" },
  memoriesTitle: { en: "What people remember.", km: "អ្នកទាំងអស់គ្នាចាំរឿងនេះបែបណា?" },
  memoriesSubtitle: {
    en: "Each memory is a small lantern showing how folklore lives in daily Cambodian conversation.",
    km: "ការនិទានតាមការចងចាំរបស់មនុស្សម្នាក់ៗ បង្ហាញថារឿងព្រេងខ្មែរនៅតែជាផ្នែកមួយនៃជីវិតប្រចាំថ្ងៃ។",
  },
  memoriesTellingsCount: { en: "Tellings", km: "ការនិទាន" },
  memoriesShareButton: { en: "Share Your Version", km: "ចែករំលែកការនិទាន" },
  memoriesLoginToast: { en: "Log in to contribute", km: "ចូលគណនីដើម្បីចែករំលែករឿង" },

  // Footer.js
  footerTagline: { en: "A Khmer Folklore Archive", km: "បណ្ណសាររឿងព្រេងខ្មែរ" },
  footerBackToTop: { en: "Back to top", km: "ត្រឡប់ទៅលើ" },
  footerCreditLine: { en: "Curated by", km: "ចងក្រងដោយ" },
  footerSourceLine: { en: "Source:", km: "ប្រភព៖" },
  footerBuiltIn: {
    en: "Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026.",
    km: "សាងសង់ក្នុងមុខវិជ្ជា ICT 340 — Vibe Coding សាកលវិទ្យាល័យអាមេរិកកាំងភ្នំពេញ រដូវស្លឹកឈើជ្រុះ ២០២៦។",
  },

  // app/login/page.js, app/signup/page.js.
  authEmailLabel: { en: "Email", km: "អ៊ីមែល" },
  authPasswordLabel: { en: "Password", km: "ពាក្យសម្ងាត់" },
  authConfirmPasswordLabel: { en: "Confirm password", km: "បញ្ជាក់ពាក្យសម្ងាត់" },
  authLoginTitle: { en: "Welcome Back!", km: "សូមស្វាគមន៍!" },
  authLoginButton: { en: "Sign In", km: "ចូលគណនី" },
  // The sign-in / sign-up buttons while the request is on its way.
  authSigningIn: { en: "Signing in…", km: "កំពុងចូលគណនី…" },
  authSigningUp: { en: "Creating account…", km: "កំពុងបង្កើតគណនី…" },
  // The sign-in / sign-up box's sliding overlay (auth/AuthCard.js).
  authOverlaySignupTitle: { en: "New to the archive?", km: "ទើបមកដល់បណ្ណសារលើកដំបូងមែនទេ?" },
  authOverlaySignupText: {
    en: "Make an account to share the stories you remember.",
    km: "បង្កើតគណនី ដើម្បីចែករំលែករឿង",
  },
  authOverlaySigninTitle: { en: "Already Have An Account?", km: "មានគណនីរួចហើយមែនទេ?" },
  authLoginError: { en: "Invalid email or password", km: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ" },
  authSignupTitle: { en: "Sign Up", km: "បង្កើតគណនី" },
  signupHeading: { en: "Share What You Remember", km: "តើអ្នកមានរឿងអ្វីចង់ចែករំលែក?" },
  authSignupButton: { en: "Sign Up", km: "បង្កើតគណនី" },
  authSignupError: { en: "Something went wrong. Try again.", km: "មិនអាចបង្កើតគណនីបានទេ។ សូមសាកល្បងម្ដងទៀត។" },
  authConfirmEmail: { en: "A confirmation email has been sent to your account. Please confirm to log in.", km: "យើងបានផ្ញើសារបញ្ជាក់ទៅអ៊ីមែលរបស់អ្នករួចហើយ។ សូមចុចលើតំណក្នុងអ៊ីមែល ដើម្បីបញ្ជាក់គណនី។" },
  authCheckEmailTitle: { en: "Check your email", km: "សូមពិនិត្យប្រអប់អ៊ីមែលរបស់អ្នក" },
  authGoToLogin: { en: "Go to login", km: "ចូលគណនី" },
  authUsernameLabel: { en: "Username", km: "ឈ្មោះ" },
  usernameTaken: { en: "That username is taken. Try another.", km: "ឈ្មោះនេះមានអ្នកប្រើរួចហើយ។ សូមជ្រើសឈ្មោះផ្សេងទៀត។" },
  usernameLength: { en: "Username must be 3–20 characters.", km: "ឈ្មោះត្រូវមានពី 3 ទៅ 20 តួអក្សរ។" },
  usernameChars: { en: "Username can use only letters, numbers, Khmer, and underscores.", km: "ឈ្មោះអាចមានតែអក្សរអង់គ្លេស អក្សរខ្មែរ លេខ និងសញ្ញាបន្ទាត់ក្រោម (_) ប៉ុណ្ណោះ។" },
  usernameEdges: { en: "Username can't start or end with an underscore.", km: "ឈ្មោះមិនអាចចាប់ផ្ដើម ឬបញ្ចប់ដោយសញ្ញាបន្ទាត់ក្រោម (_) បានទេ។" },
  usernameDouble: { en: "Username can't have two underscores in a row.", km: "ឈ្មោះមិនអាចមានសញ្ញាបន្ទាត់ក្រោម (_) ពីរជាប់គ្នាបានទេ។" },
  usernameChecking: { en: "Checking availability…", km: "កំពុងពិនិត្យឈ្មោះ…" },
  usernameFree: { en: "Username is available.", km: "ឈ្មោះនេះអាចប្រើបាន។" },
  emailInvalid: { en: "Enter a valid email address.", km: "សូមពិនិត្យមើលទម្រង់អ៊ីមែលម្ដងទៀត។" },
  passwordShort: { en: "Password must be at least 6 characters.", km: "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួអក្សរ។" },
  passwordMismatch: { en: "Passwords don't match.", km: "ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ។ សូមពិនិត្យម្ដងទៀត។" },
  fieldRequired: { en: "This field is required.", km: "សូមបំពេញចន្លោះនេះ។" },

  // ContributeForm.js / ContributeModal.js / LocationSelect.js. Templates use
  // {min}/{max}/{n}, filled in at render.
  contributeEyebrow: { en: "Add your telling", km: "សរសេររឿងនេះតាមដែលអ្នកចាំ" },
  contributeTitleLabel: { en: "Title", km: "ចំណងជើង" },
  contributeLocationLabel: { en: "Location", km: "ទីតាំង" },
  contributeStoryLabel: { en: "Your telling", km: "ការនិទានរបស់អ្នក" },
  contributePhotoLabel: { en: "Photo (optional)", km: "រូបថត (បើមាន)" },
  contributePhotoHint: { en: "JPG, PNG, or WEBP · 5 MB max", km: "JPG, PNG, ឬ WEBP · យ៉ាងច្រើន 5 MB" },
  contributeSubmit: { en: "Share your telling", km: "ចែករំលែកការនិទានរបស់អ្នក" },
  contributeSubmitting: { en: "Saving…", km: "កំពុងបញ្ជូនរឿង…" },
  contributeClose: { en: "Close", km: "បិទ" },
  contributeMinHint: { en: "(min {n})", km: "(យ៉ាងតិច {n})" },
  contributeTitleLenError: { en: "Title must be {min}–{max} characters.", km: "ចំណងជើងត្រូវមានពី {min} ទៅ {max} តួអក្សរ។" },
  contributeTitleCharError: { en: "Title contains characters that aren't allowed.", km: "ចំណងជើងមានតួអក្សរខ្លះដែលមិនអាចប្រើបាន។ សូមកែចំណងជើង ហើយសាកម្ដងទៀត។" },
  contributeLocationError: { en: "Please choose a location.", km: "សូមជ្រើសរើសទីតាំង។" },
  contributeLocationInvalid: { en: "Please choose a location from the list.", km: "សូមជ្រើសរើសទីតាំងពីបញ្ជី។" },
  contributeStoryLenError: { en: "Story must be {min}–{max} characters.", km: "រឿងត្រូវមានពី {min} ទៅ {max} តួអក្សរ។" },
  // utils/khmerOrder.js — Khmer typed in an order phones can't show.
  khmerOrderError: {
    en: "Some Khmer letters are typed in an order phones can't show: {words}. Please retype them.",
    km: "អក្សរខ្មែរខ្លះត្រូវបានវាយតាមលំដាប់ដែលទូរស័ព្ទមិនអាចបង្ហាញបាន៖ {words}។ សូមវាយឡើងវិញ។",
  },
  khmerOrderDbError: {
    en: "Some Khmer letters are typed in an order phones can't show. Please check the spelling and try again.",
    km: "អក្សរខ្មែរខ្លះត្រូវបានវាយតាមលំដាប់ដែលទូរស័ព្ទមិនអាចបង្ហាញបាន។ សូមពិនិត្យអក្ខរាវិរុទ្ធ ហើយព្យាយាមម្ដងទៀត។",
  },
  contributeStoryCharError: { en: "Story contains characters that aren't allowed.", km: "រឿងមានតួអក្សរដែលមិនអនុញ្ញាត។" },
  contributePhotoSizeError: { en: "Photo must be 5 MB or smaller.", km: "រូបថតត្រូវមានទំហំ 5 MB ឬតិចជាង។" },
  contributePhotoTypeError: { en: "Photo must be a real JPG, PNG, or WEBP image.", km: "រូបថតត្រូវជា JPG, PNG, ឬ WEBP ពិតប្រាកដ។" },
  contributeSessionError: { en: "Your session has expired. Please log in again.", km: "សូមចូលគណនីម្ដងទៀត ដើម្បីបន្ត។" },
  contributeSubmitError: { en: "Something went wrong saving your telling. Please try again.", km: "មិនអាចរក្សាទុករឿងរបស់អ្នកបានទេ។ សូមសាកល្បងម្ដងទៀត។" },
  contributeNoUsername: { en: "Set up a username before contributing.", km: "សូមកំណត់ឈ្មោះជាមុនសិន មុននឹងចូលរួម។" },
  contributeEditEyebrow: { en: "Edit your telling", km: "កែការនិទានរបស់អ្នក" },
  contributeSaveChanges: { en: "Save changes", km: "រក្សាទុកកំណែ" },
  contributeNotSaved: { en: "That change wasn't saved.", km: "កំណែនោះមិនបានរក្សាទុកទេ។" },
  contributeNoChanges: {
    en: "Nothing has changed, so there's nothing to send for review.",
    km: "អ្នកមិនទាន់បានកែអ្វីទេ ដូច្នេះមិនមានអ្វីត្រូវផ្ញើទៅពិនិត្យទេ។",
  },
  contributePhotoKeep: { en: "Leave empty to keep the current photo.", km: "បើចង់ទុករូបថតដដែល អ្នកអាចរំលងចន្លោះនេះបាន។" },
  contributeCurrentPhoto: { en: "Current photo", km: "រូបថតបច្ចុប្បន្ន" },
  // Shown after "Share Your Version" (SubmittedDialog.js).
  tellingSubmittedTitle: { en: "Thank you!", km: "សូមអរគុណ!" },
  tellingSubmittedBody: {
    en: "Your telling is waiting for review and will appear once the curator approves it.",
    km: "ការនិទានរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ ហើយនឹងបង្ហាញនៅលើគេហទំព័រ ពេលអ្នកចងក្រងពិនិត្យហើយ។",
  },
  // SubmittedDialog.js (My Entries, after either kind of submission).
  submittedShareNew: { en: "Share a new story", km: "ចែករំលែករឿងថ្មី" },
  menuMore: { en: "More options", km: "ជម្រើសបន្ថែម" },
  menuEdit: { en: "Edit", km: "កែ" },
  menuDelete: { en: "Delete", km: "លុប" },
  deleteConfirm: { en: "Delete this telling? This can't be undone.", km: "លុបរឿងដែលអ្នកបានចែករំលែកនេះមែនទេ? បើលុបហើយ មិនអាចយកមកវិញបានទេ។" },
  cancel: { en: "Cancel", km: "បោះបង់" },
  locationPlaceholder: { en: "Search a province (English or Khmer)…", km: "ស្វែងរកតាមខេត្ត (អង់គ្លេស ឬខ្មែរ)…" },
  locationNoMatch: { en: "No matching province", km: "សូមអភ័យទោស មិនអាចរកឃើញខេត្តដែលអ្នកកំពុងស្វែងរកបានទេ។" },

  // ShareSearch.js / StoryMatchCard.js (/share).
  shareTitle: { en: "Is your story already here?", km: "តើរឿងរបស់អ្នកមាននៅទីនេះហើយឬនៅ?" },
  shareSubtitle: {
    en: "Type the story's name in English or Khmer, or a few words about it. If it's already in the archive, add your version to it — every telling keeps the story richer.",
    km: "សាកវាយចំណងជើងរឿងជាភាសាខ្មែរ ឬអង់គ្លេស ឬវាយពាក្យពីរបីដែលទាក់ទងនឹងរឿងនោះ។ បើរឿងនោះមានក្នុងបណ្ណសាររួចហើយ អ្នកអាចចែករំលែករឿងនោះតាមដែលអ្នកចាំ។ អ្វីដែលអ្នកចាំ អាចមានចំណុចខ្លះដែលអ្នកដទៃមិនធ្លាប់ឮ។",
  },
  sharePlaceholder: { en: "Story name or a few words about it", km: "ចំណងជើងរឿង ឬពាក្យគន្លឹះ" },
  shareMatchesHeading: { en: "Could it be one of these?", km: "តើវាជារឿងមួយក្នុងចំណោមរឿងទាំងនេះឬទេ?" },
  shareNoMatches: { en: "No similar stories found.", km: "រកមិនឃើញរឿងស្រដៀងគ្នាទេ។" },
  shareLoadingStories: { en: "Loading stories…", km: "សូមរង់ចាំបន្តិច…" },
  shareDidYouMean: { en: "Did you mean", km: "តើអ្នកសំដៅលើ" },
  shareAddVersion: { en: "This is it — add my version", km: "រឿងនេះហើយ — ចែករំលែកបន្ថែម" },
  shareStartNew: { en: "My story isn't here — start a new one", km: "រឿងរបស់ខ្ញុំមិនមាននៅទីនេះទេ — ចាប់ផ្ដើមរឿងថ្មី" },
  // SignInPrompt.js: what a signed-out visitor sees on /share instead of
  // the search. Its buttons reuse authLoginButton / authSignupButton.
  shareSignInTitle: { en: "Sign in to share a memory", km: "ចូលគណនីដើម្បីចែករំលែករឿង" },
  shareSignInText: {
    en: "Anyone can read the archive. To add a story, or your own telling of one, sign in first, or create an account if you don't have one yet.",
    km: "អ្នកណាក៏អាចអានរឿងក្នុងបណ្ណសារបាន។ ដើម្បីចែករំលែករឿងថ្មី ឬរឿងដែលអ្នកចាំ សូមចូលគណនីជាមុនសិន ឬបង្កើតគណនីថ្មី បើអ្នកមិនទាន់មាន។",
  },
  shareBackToSearch: { en: "Back to search", km: "ត្រឡប់ទៅការស្វែងរក" },

  // NewStoryPanel.js / NewStoryFields.js / ContributeForm.js's newStory mode.
  newStoryEyebrow: { en: "Start a new story", km: "ចែករំលែករឿងថ្មី" },
  newStoryHeading: { en: "A story the archive doesn't have yet", km: "រឿងដែលមិនទាន់មាននៅក្នុងបណ្ណសារ" },
  newStoryReviewNote: {
    en: "The curator reads every new story and writes its summary before it appears in the archive.",
    km: "អ្នកចងក្រងនឹងអានរឿងថ្មីនីមួយៗ ហើយសរសេរសេចក្ដីសង្ខេបខ្លីមួយ មុននឹងដាក់បង្ហាញក្នុងបណ្ណសារ។",
  },
  newStoryTitleLabel: { en: "Story name (English)", km: "ចំណងជើងរឿង (ជាភាសាអង់គ្លេស)" },
  newStoryKhmerTitleLabel: { en: "Story name in Khmer (optional)", km: "ចំណងជើងរឿងជាភាសាខ្មែរ (បើមាន)" },
  newStoryKhmerTitleLenError: { en: "Khmer name must be {max} characters or fewer.", km: "ចំណងជើងខ្មែរមិនអាចវែងជាង {max} តួអក្សរទេ។" },
  newStoryCategoryLabel: { en: "Category", km: "ប្រភេទរឿង" },
  newStoryCategoryPlaceholder: { en: "Choose a category", km: "ជ្រើសរើសប្រភេទរឿង" },
  newStoryCategoryError: { en: "Please choose a category.", km: "សូមជ្រើសរើសប្រភេទរឿង។" },
  newStoryExists: {
    en: "A story with this name is already in the archive. Go back to search to add your version to it.",
    km: "រឿងនេះមានក្នុងបណ្ណសាររួចហើយ។ សូមត្រឡប់ទៅស្វែងរករឿងនោះ ហើយចែករំលែកតាមដែលអ្នកចាំ។",
  },
  newStorySubmit: { en: "Submit for review", km: "ផ្ញើរឿងទៅពិនិត្យ" },
  newStoryDoneTitle: { en: "Thank you — your story is waiting for review.", km: "សូមអរគុណ! រឿងរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ។" },
  newStoryDoneBody: {
    en: "The curator will read it and write its summary. Once it's published, it will appear in the archive with you credited as the first to share it.",
    km: "អ្នកចងក្រងនឹងអានរឿងរបស់អ្នក ហើយសរសេរសេចក្ដីសង្ខេបខ្លីមួយ។ ពេលរឿងនេះដាក់បង្ហាញហើយ ឈ្មោះរបស់អ្នកនឹងបង្ហាញជាអ្នកចែករំលែករឿងនេះមុនគេ។",
  },

  // app/review/page.js + components/review/* (curator only). The form's story
  // name/Khmer name/category labels reuse the newStory* keys above.
  // The eyebrow above reviewTitle: "for the curator".
  reviewEyebrow: { en: "Curator Review", km: "សម្រាប់អ្នកចងក្រង" },
  reviewTitle: { en: "Waiting for review", km: "រឿងដែលរង់ចាំការពិនិត្យ" },
  // ReviewQueue.js sections, and the new-telling / waiting-change cards
  // (TellingReviewCard.js, EditReviewCard.js, TellingDecision.js).
  reviewStoriesHeading: { en: "New stories", km: "រឿងថ្មី" },
  reviewTellingsHeading: { en: "New tellings", km: "ការនិទានថ្មី" },
  reviewEditsHeading: { en: "Changes to published tellings", km: "ការកែថ្មីលើការនិទានដែលបានបង្ហោះ" },
  reviewReturnNoteLabel: { en: "Note to the owner (needed to return)", km: "សារទៅម្ចាស់ការនិទាន (ត្រូវសរសេរ ដើម្បីឲ្យកែវិញ)" },
  reviewReturnNoteError: { en: "Write a note saying what to change before returning.", km: "សូមសរសេរសារប្រាប់ថាត្រូវកែអ្វីខ្លះ មុននឹងឲ្យកែវិញ។" },
  reviewBefore: { en: "Now on the story", km: "អ្វីដែលកំពុងបង្ហាញ" },
  reviewAfter: { en: "After approval", km: "ក្រោយពេលអនុម័ត" },
  reviewPhotoLabel: { en: "Photo", km: "រូបថត" },
  reviewPendingCount: { en: "waiting", km: "កំពុងរង់ចាំ" },
  reviewEmpty: { en: "Nothing to review — every submission has been handled.", km: "គ្មានអ្វីត្រូវពិនិត្យទេ — អ្នកបានពិនិត្យរឿងទាំងអស់រួចហើយ។" },
  reviewLoadError: { en: "The review queue couldn't be loaded. Refresh to try again.", km: "មិនអាចបង្ហាញបញ្ជីរឿងដែលរង់ចាំការពិនិត្យបានទេ។ សូមបើកទំព័រនេះម្ដងទៀត។" },
  reviewSubmittedBy: { en: "shared by", km: "ចែករំលែកដោយ" },
  reviewTellingTitle: { en: "Their telling", km: "ការនិទានរបស់គាត់" },
  reviewNoTelling: { en: "This story has no telling attached.", km: "រឿងនេះមិនមានការនិទានភ្ជាប់មកទេ។" },
  reviewSummaryLabel: { en: "Summary (needed to approve)", km: "សេចក្ដីសង្ខេប (ត្រូវសរសេរ ដើម្បីអនុម័ត)" },
  reviewSummaryKhmerLabel: { en: "Summary in Khmer (optional)", km: "សេចក្ដីសង្ខេបជាភាសាខ្មែរ (បើមាន)" },
  reviewNoteLabel: { en: "Note to the submitter (needed to reject)", km: "សារទៅអ្នកចែករំលែក (ត្រូវសរសេរ ដើម្បីបដិសេធ)" },
  reviewApprove: { en: "Approve & publish", km: "អនុម័ត និងដាក់បង្ហាញ" },
  // The decision buttons at the top of each /review form (DecisionPicker.js).
  reviewChooseApprove: { en: "Approve", km: "អនុម័ត" },
  reviewChooseReject: { en: "Reject", km: "បដិសេធ" },
  reviewChooseReturn: { en: "Return", km: "ឲ្យកែវិញ" },
  // The confirm button once Reject / Return is chosen (ReviewActions.js).
  // One button for both, so the Khmer says "confirm and send the note"
  // rather than naming either decision.
  reviewRejectReturn: { en: "Reject & Return", km: "បញ្ជាក់ និងផ្ញើសារ" },
  reviewTitleError: { en: "Story name must be at least 3 characters.", km: "ចំណងជើងរឿងត្រូវមានយ៉ាងតិច 3 តួអក្សរ។" },
  reviewSummaryError: { en: "Write a summary before approving.", km: "សូមសរសេរសេចក្ដីសង្ខេប មុននឹងអនុម័ត។" },
  reviewNoteError: { en: "Write a note explaining why before rejecting.", km: "សូមសរសេរសារពន្យល់ពីមូលហេតុ មុននឹងបដិសេធ។" },
  reviewSaveError: { en: "That wasn't saved. Please try again.", km: "មិនអាចរក្សាទុកបានទេ។ សូមសាកល្បងម្ដងទៀត។" },
  // ReviewActions.js's button while a decision saves. Its own key, not
  // contributeSubmitting, whose Khmer ("sending your story…") fits the
  // telling form but not approving or rejecting.
  reviewSaving: { en: "Saving…", km: "កំពុងរក្សាទុក…" },

  // app/my-entries/page.js + components/submissions/*.
  submissionsEmpty: { en: "You haven't started a new story yet.", km: "អ្នកមិនទាន់បានចែករំលែករឿងថ្មីណាមួយនៅឡើយទេ។" },
  // Shown under either My Entries heading when that one list fails to load.
  myEntriesListLoadError: {
    en: "This list couldn't be loaded. Refresh to try again.",
    km: "មិនអាចបង្ហាញបញ្ជីនេះបានទេ។ សូមបើកទំព័រនេះម្ដងទៀត។",
  },
  submissionsStatusPending: { en: "Waiting for review", km: "កំពុងរង់ចាំការពិនិត្យ" },
  submissionsStatusPublished: { en: "Published", km: "បានបង្ហោះ" },
  submissionsStatusRejected: { en: "Not accepted", km: "មិនបានទទួលយក" },
  submissionsPendingHint: { en: "The curator will read it and write its summary before it's published.", km: "អ្នកចងក្រងនឹងអានរឿងនេះ ហើយសរសេរសេចក្ដីសង្ខេបខ្លីមួយ មុននឹងដាក់បង្ហាញ។" },
  submissionsNoteLabel: { en: "Note from the curator", km: "សារពីអ្នកចងក្រង" },
  submissionsViewStory: { en: "View story", km: "មើលរឿង" },
  myEntriesTitle: { en: "Your stories and tellings", km: "រឿង និងការនិទានរបស់អ្នក" },
  myEntriesStoriesHeading: { en: "Stories you started", km: "រឿងថ្មីដែលអ្នកបានចែករំលែក" },
  myEntriesTellingsHeading: { en: "Your tellings", km: "ការនិទានរបស់អ្នក" },
  tellingsEmpty: { en: "You haven't shared a telling on a published story yet.", km: "អ្នកមិនទាន់បានចែករំលែកការនិទានលើរឿងណាមួយនៅឡើយទេ។" },
  tellingStatusPending: { en: "Waiting for review", km: "កំពុងរង់ចាំការពិនិត្យ" },
  tellingStatusPublished: { en: "Published", km: "បានបង្ហោះ" },
  tellingStatusReturned: { en: "Returned — needs changes", km: "រង់ចាំការកែសម្រួលពីអ្នក" },
  tellingPendingHint: { en: "The curator will read it before it appears on the story.", km: "អ្នកចងក្រងនឹងអានការនិទាននេះ មុននឹងដាក់បង្ហាញលើរឿង។" },
  // EditStatus.js (/my-entries) and the owner's note on the story page — a
  // published telling's changes waiting for review (utils/editableEntry.js).
  editPendingHint: {
    en: "Your changes are waiting for review. The story shows the earlier version until the curator approves them.",
    km: "កំណែរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ។ រឿងនេះនឹងនៅតែបង្ហាញការនិទានមុនពេលកែ រហូតដល់អ្នកចងក្រងពិនិត្យហើយ។",
  },
  editReturnedHint: {
    en: "Use Edit to make the changes the note asks for, then save to send them again.",
    km: "ចុចប៊ូតុង «កែ» ដើម្បីកែតាមសាររបស់អ្នកចងក្រង រួចរក្សាទុក ដើម្បីផ្ញើទៅពិនិត្យម្ដងទៀត។",
  },
  editPanelTitle: { en: "Your changes", km: "កំណែរបស់អ្នក" },
  editFieldPhoto: { en: "New photo", km: "រូបថតថ្មី" },
  editNothingChanged: { en: "Nothing differs from the published version.", km: "គ្មានអ្វីខុសពីការនិទានដែលបានបង្ហោះទេ។" },
  editPendingShort: { en: "Your changes are waiting for review", km: "កំណែរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ" },
  editReturnedShort: { en: "Your changes were returned — see My Entries", km: "ការកែប្រែរបស់អ្នកបានផ្ញើត្រឡប់មកអ្នកវិញ — សូមមើលក្នុង «កំណត់ត្រារបស់ខ្ញុំ»" },
  // SubmittedDialog.js after an edit (?submitted=edit).
  editSubmittedTitle: { en: "Thank you — your changes are saved.", km: "សូមអរគុណ! កំណែរបស់អ្នកត្រូវបានរក្សាទុកហើយ។" },
  editSubmittedBody: {
    en: "They're waiting for review. The story keeps showing the earlier version until the curator approves them.",
    km: "កំណែនេះកំពុងរង់ចាំការពិនិត្យ។ រឿងនឹងនៅតែបង្ហាញការនិទានមុនពេលកែ រហូតដល់អ្នកចងក្រងពិនិត្យហើយ។",
  },

  // FirstTelling.js / StoryMemories.js — the story's first telling and the
  // tellings under it.
  firstTellingHeading: { en: "The First Telling", km: "រឿងនិទានដំបូង" },
  memoriesNoneYet: {
    en: "No one else has shared their version yet — be the first.",
    km: "មិនទាន់មានអ្នកណាចែករំលែករឿងនេះតាមដែលខ្លួនចាំនៅឡើយទេ — អ្នកអាចជាអ្នកដំបូង។",
  },
  detailsFirstSharedBy: { en: "First shared by", km: "ចែករំលែកដំបូងដោយ" },
  // StoryDetails.js's details table (with detailsFirstSharedBy above).
  detailsKind: { en: "Kind", km: "ប្រភេទ" },
  detailsToldIn: { en: "Told in", km: "ទីកន្លែង" },
  memoriesEdited: { en: "Edited", km: "បានកែ" },
  menuDeleteLocked: {
    en: "The first telling of a published story can't be deleted — you can still edit it.",
    km: "មិនអាចលុបរឿងនិទានដំបូងរបស់រឿងដែលបានបង្ហោះបានទេ — ប៉ុន្តែអ្នកនៅតែអាចកែវាបាន។",
  },
};

// Falls back to English if a key or its Khmer translation is missing —
// same fallback spirit as pickText(), applied to static copy instead of
// per-entry data fields.
export function useTranslation() {
  const { language } = useLanguage();
  return (key) => uiText[key]?.[language] ?? uiText[key]?.en ?? key;
}
