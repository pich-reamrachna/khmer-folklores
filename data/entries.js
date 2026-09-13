// data/entries.js
//
// Each story is a shared topic. Different contributors can each add their
// own telling of the same story, so each story holds an array of versions.
// If a story only has one telling, its version array holds exactly one item.
// A story always has at least one version — never zero versions.
//
// Fields
// ──────────────────────────────────
// Story-level (shared by every version):
//   id             – unique slug derived from the English title
//   title          – the story's English name
//   category       – e.g. Legend, Superstition, Practices/Customary
//   khmerTitle     – optional Khmer-script title (absent until contributed)
//   categoryKhmer  – optional Khmer translation of category (absent until contributed)
//   summary        – short one-line summary of the story overall (not a
//                    specific telling's description)
//   summaryKhmer   – optional Khmer translation of summary (absent until contributed)
//   versions[] – array of tellings, each with:
//     contributor      – the person who told this version (not translated)
//     date             – when this telling was added (YYYY-MM-DD). Backfilled
//                        from git history (first commit introducing each
//                        entry's text) — not literally the date it was told.
//     place            – where this telling comes from
//     placeKhmer       – optional Khmer translation of place (absent until contributed)
//     description      – what happens in this version
//     descriptionKhmer – optional Khmer translation of description (absent until contributed)
//
// The data below is migrated from the old flat draftEntries array.
// Each former entry becomes a separate story with exactly one version,
// because every entry had a unique title/contributor/place. No two
// entries shared a story topic, so no grouping was possible.

const stories = [
  {
    id: "bramat-promong",
    title: "Bramat Promong",
    khmerTitle: "ប្រមាត់ព្រមង",
    category: "Legend",
    categoryKhmer: "រឿងព្រេង",
    summary:
      "A cautionary legend used to encourage children to take their afternoon naps, warning of a spirit who preys on those who don't.",
    summaryKhmer:
      "រឿងព្រេងព្រមានមួយ ដែលប្រើសម្រាប់លើកទឹកចិត្តកូនក្មេងឲ្យគេងថ្ងៃត្រង់ ដោយព្រមានពីវិញ្ញាណដែលចាប់អ្នកមិនព្រមគេង។",
    versions: [
      {
        contributor: "Pich Ream Rachna",
        date: "2026-08-27",
        place: "Kampong Cham",
        placeKhmer: "កំពង់ចាម",
        description:
          "A story about a woman who comes to eat your inards if you don't take your naptime seriously. It's a story that is usually told to children to make them take their naps on time.",
        descriptionKhmer:
          "នេះជារឿងអំពីស្ត្រីម្នាក់ដែលមកស៊ីពោះវៀនរបស់អ្នក បើអ្នកមិនគេងថ្ងៃត្រង់ដោយយកចិត្តទុកដាក់។ វាជារឿងដែលគេច្រើននិយាយប្រាប់ក្មេងៗ ដើម្បីឲ្យពួកគេគេងថ្ងៃត្រង់ទាន់ពេលវេលា។",
      },
      {
        contributor: "Sreng Vongwathiny",
        date: "2026-09-13",
        place: "Phnom Penh",
        placeKhmer: "ភ្នំពេញ",
        description:
          "I've also heard this story as well when I was young, my father told me if I don't go to sleep then a man in black will come and rip apart my stomach and eat my intestines. A pretty gruesome story to tell a kid but it was very effective.",
        descriptionKhmer:
          "ខ្ញុំក៏ធ្លាប់ឮរឿងនេះដែរនៅពេលដែលខ្ញុំនៅក្មេង។ ឪពុករបស់ខ្ញុំធ្លាប់ប្រាប់ខ្ញុំថា បើខ្ញុំមិនព្រមចូលគេងទេ នោះបុរសពាក់ខ្មៅម្នាក់នឹងមកហែកពោះខ្ញុំ ហើយស៊ីពោះវៀនរបស់ខ្ញុំ។ វាជារឿងដ៏សាហាវមួយសម្រាប់និយាយប្រាប់ក្មេង ប៉ុន្តែវាមានប្រសិទ្ធភាពខ្លាំងណាស់",
      },
    ],
  },
  {
    id: "ahpt",
    title: "Ahpt",
    khmerTitle: "អាប",
    category: "Legend",
    categoryKhmer: "រឿងព្រេង",
    summary:
      "A well-known countryside legend about a floating female head that hunts chickens under cover of night.",
    summaryKhmer:
      "រឿងព្រេងដ៏ល្បីមួយនៅតាមជនបទ អំពីក្បាលអណ្ដែតរបស់ស្ត្រី ដែលចេញរកមាន់នៅពេលយប់។",
    versions: [
      {
        contributor: "Piseth Tyvirakpoung",
        date: "2026-08-27",
        place: "Prey Veng",
        placeKhmer: "ព្រៃវែង",
        description:
          "A story about a floating head of a woman who eat chickens at night. It is usually told mostly in the countryside that if you see a glowing orb at night, you will see a floating head of a woman who will eat your chickens.",
        descriptionKhmer:
          "នេះជារឿងអំពីក្បាលអណ្ដែតរបស់ស្ត្រីម្នាក់ដែលស៊ីមាន់នៅពេលយប់។ គេច្រើននិយាយប្រាប់គ្នានៅតាមជនបទថា បើអ្នកឃើញពន្លឺមូលភ្លឺនៅពេលយប់ អ្នកនឹងឃើញក្បាលអណ្ដែតរបស់ស្ត្រីម្នាក់ដែលមកស៊ីមាន់របស់អ្នក។",
      },
    ],
  },
  {
    id: "daun-penhs-curse",
    title: "Daun Penh's Curse",
    khmerTitle: "បណ្តាសាដូនពេញ",
    category: "Practices/Customary",
    categoryKhmer: "ទំនៀមទម្លាប់",
    summary:
      "A wedding custom rooted in the legend of Daun Penh, founder of Phnom Penh, believed to curse brides who visit her pagoda.",
    summaryKhmer:
      "ទំនៀមទម្លាប់មង្គលការមួយ ដែលមានប្រភពពីរឿងព្រេងដូនពេញ អ្នកបង្កើតទីក្រុងភ្នំពេញ ដែលគេជឿថានឹងដាក់បណ្ដាសាកូនក្រមុំដែលទៅវត្តរបស់នាង។",
    versions: [
      {
        contributor: "Ngov Kimyou",
        date: "2026-08-29",
        place: "Phnom Penh",
        placeKhmer: "ភ្នំពេញ",
        description:
          "There's a saying that in every Khmer wedding tradition, the groom must go to the Phnom Penh Pagod to pay respect to the founder of Phnom Penh, Daun Penh. If the groom does not do this, it is said that the groom will be cursed and will not have a happy marriage. However, the bride MUST not go to the pagoda with him for she will be cursed by Daun Penh. The reason is that Daun Penh was a woman who had her husband cheated on her, and she does not want to see a happy marriage for the groom and bride.",
        descriptionKhmer:
          "មានពាក្យចាស់ថា នៅក្នុងប្រពៃណីមង្គលការខ្មែរគ្រប់ពិធីទាំងអស់ កូនកម្លោះត្រូវទៅវត្តភ្នំ ដើម្បីគោរពដល់ដូនតាដែលបានបង្កើតទីក្រុងភ្នំពេញ គឺដូនពេញ។ បើកូនកម្លោះមិនធ្វើដូច្នេះទេ គេថានឹងត្រូវដូនពេញដាក់បណ្ដាសា ហើយនឹងគ្មានជីវិតគ្រួសារសុខសាន្តទេ។ ប៉ុន្តែកូនក្រមុំមិនត្រូវទៅវត្តជាមួយគាត់ឡើយ ព្រោះនាងនឹងត្រូវដូនពេញដាក់បណ្ដាសាដែរ។ មូលហេតុគឺដូនពេញជាស្ត្រីម្នាក់ដែលប្ដីរបស់នាងក្បត់សេចក្ដីស្នេហ៍ ហើយនាងមិនចង់ឃើញកូនកម្លោះនិងកូនក្រមុំមានជីវិតគ្រួសារសុខសាន្តឡើយ។",
      },
    ],
  },
  {
    id: "crocodile-reincarnation",
    title: "Crocodile Reincarnation",
    khmerTitle: "កំណើតជាក្រពើ",
    category: "Superstition",
    categoryKhmer: "ជំនឿអបិយមន្ត",
    summary:
      "A common Cambodian superstition warning that sleeping immediately after a meal leads to rebirth as a crocodile.",
    summaryKhmer:
      "ជំនឿអបិយមន្តទូទៅមួយរបស់ខ្មែរ ព្រមានថាការគេងភ្លាមៗបន្ទាប់ពីញ៉ាំបាយ នាំឲ្យចាប់កំណើតជាក្រពើនៅជាតិក្រោយ។",
    versions: [
      {
        contributor: "Heng leangmeng",
        date: "2026-08-29",
        place: "Cambodia",
        placeKhmer: "កម្ពុជា",
        description:
          "Many cambodians believe in superstition, and this is one of them. It is said that if you sleep right after you just ate, in the next life, you will be reincarnated as a crocodile.",
        descriptionKhmer:
          "ជនជាតិខ្មែរជាច្រើនជឿលើអបិយមន្ត ហើយនេះជាមួយក្នុងចំណោមនោះ។ គេថាបើអ្នកគេងភ្លាមៗបន្ទាប់ពីញ៉ាំបាយរួច នៅជាតិក្រោយ អ្នកនឹងចាប់កំណើតជាក្រពើ។",
      },
    ],
  },
  {
    id: "neang-neath",
    title: "Neang Neath",
    khmerTitle: "នាងនាថ",
    category: "Legend",
    categoryKhmer: "រឿងព្រេង",
    summary:
      "A ghost story about a spirit who died during childbirth and now haunts those who sleep beneath banana trees.",
    summaryKhmer:
      "រឿងខ្មោចមួយអំពីវិញ្ញាណដែលបានស្លាប់ក្នុងពេលសម្រាលកូន ហើយឥឡូវនេះមករំខានអ្នកដែលគេងក្រោមដើមចេក។",
    versions: [
      {
        contributor: "Pich Ream",
        date: "2026-08-29",
        place: "Kandal",
        placeKhmer: "កណ្ដាល",
        description:
          "It is said that if you sleep under a banana tree, a ghost called Neak Neath will come and haunt you. She appears in a long white dress, holding her pregnant belly. It is said that she died during labor while her husband was away, which led to her to becoming a vengeful spirit. The husband, upon coming back home, found her restless spirit and seek help from a monk. However, at night, her vengeful spirit then exploit a banana tree that is extending to a window of the monk's house into the room where the husband resides in. In the end, she killed the husband.",
        descriptionKhmer:
          "គេថាបើអ្នកគេងក្រោមដើមចេក នឹងមានខ្មោចមួយឈ្មោះអ្នកនាថមកយាយី។ នាងបង្ហាញខ្លួនក្នុងឈុតសម្លៀកបំពាក់ពណ៌សវែង ដៃទាំងពីរលូកលើពោះដែលមានផ្ទៃពោះ។ គេថានាងបានស្លាប់ក្នុងពេលសម្រាលកូន ខណៈពេលដែលប្ដីនាងចាកឆ្ងាយ ដែលនាំឱ្យនាងក្លាយជាខ្មោចដែលមានចិត្តចង់សងសឹក។ ប្ដីរបស់នាង នៅពេលដែលត្រឡប់មកផ្ទះវិញ បានឃើញវិញ្ញាណដែលមិនស្ងប់របស់នាង ហើយបានទៅសុំជំនួយពីលោកសង្ឃមួយអង្គ។ ប៉ុន្តែនៅពេលយប់ វិញ្ញាណដែលចង់សងសឹករបស់នាង បានប្រើប្រាស់ដើមចេកមួយដើមដែលលូតលាស់លាតសន្ធឹងដល់បង្អួចផ្ទះលោកសង្ឃ ជាផ្លូវចូលទៅដល់បន្ទប់ដែលប្ដីនាងកំពុងស្នាក់នៅ។ ជាចុងក្រោយ នាងបានសម្លាប់ប្ដីរបស់នាង។",
      },
      {
        contributor: "Sreng Vongwathiny",
        date: "2026-09-13",
        place: "Phnom Penh",
        placeKhmer: "ភ្នំពេញ",
        description:
          "I heard this story too, but with a twist at the end. Neang Neath really did die during labor while her husband was away working outside the province. The twist is that when he came back home and found out his wife had died, he didn't believe it, because he could still see his wife and their child. In reality, what he saw was just her spirit, but he never realized she wasn't really there anymore. As for why she's associated with banana trees, I honestly don't know either.",
        descriptionKhmer:
          "ខ្ញុំក៏ធ្លាប់ឮរឿងនេះដែរ ប៉ុន្តែមានការបញ្ច្រាសនៅចុងបញ្ចប់។ នាងនាថពិតជាបានស្លាប់ក្នុងពេលសម្រាលកូនមែន ខណៈពេលដែលប្ដីរបស់នាងកំពុងធ្វើការនៅខាងក្រៅខេត្ត។ ការបញ្ច្រាសនោះគឺ នៅពេលដែលគាត់ត្រឡប់មកផ្ទះវិញ ហើយដឹងថាប្រពន្ធរបស់គាត់បានស្លាប់ គាត់មិនជឿទេ ព្រោះគាត់នៅតែឃើញប្រពន្ធនិងកូនរបស់គាត់។ តាមពិតទៅ អ្វីដែលគាត់ឃើញនោះគ្រាន់តែជាវិញ្ញាណរបស់នាងប៉ុណ្ណោះ ប៉ុន្តែគាត់មិនដែលដឹងថានោះមិនមែនជានាងទៀតទេ។ ចំណែកឯមូលហេតុដែលនាងទាក់ទងនឹងដើមចេក ខ្ញុំក៏មិនដឹងដែរ។",
      },
    ],
  },
  {
    id: "boeung-yeak-lorm",
    title: "Boeung Yeak Lorm",
    khmerTitle: "បឹងយក្សឡោម",
    category: "Legend",
    categoryKhmer: "រឿងព្រេង",
    summary:
      "A story about how a Lake in Ratanakiri Provincce was created.",
    summaryKhmer:
      "រឿងអំពីរបៀបដែលបឹងមួយនៅខេត្តរតនគិរីត្រូវបានបង្កើតឡើង។",
    versions: [
      {
        contributor: "Lorn Nida",
        date: "2026-09-13",
        place: "Ratanakiri",
        placeKhmer: "រតនគិរី",
        description:
          "From what I remember, the lake was created when a Giant King ordered his soldiers to dig the land in order to find his daughter, because she ran away from an arranged marriage."
      }
    ]
  }
];

export default stories;