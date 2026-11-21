import { Cinzel, IM_Fell_English, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import collection from "../collection.config.js";
import { LanguageProvider } from "../components/shared/LanguageContext.js";
import PageLoadingBar from "../components/shared/PageLoadingBar.js";

// Self-hosted via next/font instead of a Google Fonts <link>, so there's
// no per-page-load network round trip. Exposed as CSS variables on
// <html>; components reference var(--font-cinzel)/var(--font-jakarta).
// display: "swap" — "optional" would avoid the brief swap entirely, but
// tested inconsistent (sometimes never applying the real font at all),
// so this is the safer, verified-reliable choice.
const cinzel = Cinzel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

// An old-print serif with real lowercase letters (Cinzel is capitals
// only), for the worn, aged signup heading (SignupHeading.js).
const imFell = IM_Fell_English({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fell",
});

// The two Khmer fonts, as local files (app/fonts/, Khmer letters only, from
// Google Fonts under the SIL Open Font License — the OFL-*.txt files there)
// rather than next/font/google, because only a local font can carry
// size-adjust: every Khmer letter is drawn 15% bigger than the font-size
// says, everywhere on the site, without each component needing its own Khmer
// size. Khmer at the same font-size as English reads small; Latin
// letters are untouched since these files have none.
// unicode-range: the browser uses (and downloads) these only for Khmer text.
// adjustFontFallback: false — Next's size-matched fallback is for Latin
// fonts and doesn't apply to Khmer. Next only accepts these options written
// out in full, so each font repeats them.

// The Khmer partner of Jakarta (sans), used for nearly all Khmer text.
const kantumruyPro = localFont({
  src: "./fonts/KantumruyPro-Khmer.woff2",
  weight: "300 700",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "size-adjust", value: "115%" },
    { prop: "unicode-range", value: "U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC" },
  ],
  variable: "--font-khmer",
});

// The same Kantumruy Pro file again, drawn 40% bigger instead of 15%, for the
// small spaced-capital labels (eyebrows, badges, form labels, buttons).
// Their English is capitals at ~0.7rem, which reads fine; Khmer at that size
// needs more than the 15% the rest of the text gets. Same file and the same
// preload setting as kantumruyPro, so both get the same URL and the browser
// downloads it once.
const kantumruyProLabel = localFont({
  src: "./fonts/KantumruyPro-Khmer.woff2",
  weight: "300 700",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "size-adjust", value: "140%" },
    { prop: "unicode-range", value: "U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC" },
  ],
  variable: "--font-khmer-label",
});

// The Khmer partner of Cinzel and IM Fell (serif): the same thick-and-thin
// strokes, where Kantumruy Pro is a plain sans. preload: false — the browser
// fetches it only when serif Khmer is actually on screen, so English-mode
// visitors on mobile data never download it. A variable font: the one file
// holds every weight, 400 up to the bold 700 the story titles use.
const notoSerifKhmer = localFont({
  src: "./fonts/NotoSerifKhmer-Khmer.woff2",
  weight: "400 700",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "size-adjust", value: "115%" },
    { prop: "unicode-range", value: "U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC" },
  ],
  variable: "--font-khmer-serif",
});

// Konkhmer Sleokchher, a decorative Khmer display face, for the big story
// titles in Khmer (StoryHero.js, StoryDetails.js) — the Khmer counterpart to
// their inscription-style Cinzel. One weight only. Same unicode-range/
// size-adjust as the other Khmer fonts; preload false, so only Khmer visitors
// fetch it (it's a large file, ~420KB).
const khmerDisplay = localFont({
  src: "./fonts/KonkhmerSleokchher-Khmer.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "size-adjust", value: "115%" },
    { prop: "unicode-range", value: "U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC" },
  ],
  variable: "--font-khmer-display",
});

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${plusJakartaSans.variable} ${kantumruyPro.variable} ${kantumruyProLabel.variable} ${notoSerifKhmer.variable} ${khmerDisplay.variable} ${imFell.variable}`}
    >
      <body
        style={{
          margin: 0,
          // Same near-black as the pages, so nothing of a different colour
          // flashes between one page leaving and the next fading in.
          backgroundColor: "#1A1817",
          color: "#F5EFE6",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          minHeight: "100vh",
        }}
      >
        {/* The gold bar under the NavBar while the next page loads. Here,
            not in template.js, so it lasts through the page change. */}
        <PageLoadingBar />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
