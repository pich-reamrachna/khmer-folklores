import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import collection from "../collection.config.js";

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

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${plusJakartaSans.variable}`}>
      <body
        style={{
          margin: 0,
          backgroundColor: "#14181F",
          color: "#E8EDF2",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
