import { Cinzel, IM_Fell_English, Kantumruy_Pro, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import collection from "../collection.config.js";
import { LanguageProvider } from "../components/shared/LanguageContext.js";

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

// khmerTitle styles (StoryHero.js, StoryDetails.js, ArchiveBrowser.js)
// referenced 'Kantumruy Pro' as a bare CSS fallback before this — relying
// on it being installed system-wide, which most visitors won't have.
// Loading it here actually serves the font. subsets: ["khmer"] only —
// Latin text already uses the fonts above.
const kantumruyPro = Kantumruy_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["khmer"],
  display: "swap",
  variable: "--font-khmer",
});

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${plusJakartaSans.variable} ${kantumruyPro.variable} ${imFell.variable}`}
    >
      <body
        style={{
          margin: 0,
          // Same near-black as the pages, so nothing of a different colour
          // flashes between one page leaving and the next fading in.
          backgroundColor: "#08040A",
          color: "#E8EDF2",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          minHeight: "100vh",
        }}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
