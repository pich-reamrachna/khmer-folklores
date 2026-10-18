// The flickering candle beside the login form. The candle itself is
// public/candle.webp: the original giphy.gif with its red background made
// transparent, saved as an animated WebP (20 frames, about a quarter of the
// GIF's size). The light around it is two layered glows behind the image,
// flickering on slightly different rhythms so the light never pulses in an
// obvious loop.
//
// Plain <style>, not <style jsx>: its CSS is in the server-rendered HTML, so
// the glow and the phone breakpoint are right from the first paint instead
// of only after hydration (same reason as StoryHero.js). Everything lives in
// CSS classes — the glows' opacity/transform animate and display changes on
// phone, which inline styles would block.

export default function CandleGlow() {
  return (
    <div className="candle" aria-hidden="true">
      <div className="candle-glow candle-glow-wide" />
      <div className="candle-glow candle-glow-core" />
      <img src="/candle.webp" alt="" className="candle-img" />

      <style>{`
        .candle {
          position: relative;
          flex: 0 0 auto;
          width: 200px;
          height: 427px;
        }
        .candle-img {
          position: relative;
          width: 100%;
          height: 100%;
          display: block;
        }
        /* Both glows are centred on the flame, which sits ~27% down the
           image. mix-blend-mode: screen only ever brightens, so the light
           reads as light on the dark page rather than a coloured disc.
           Sizes are whole multiples of the source images (3x), so every
           enlarged pixel is the same size. */
        /* The glows are small images (160px and 84px) with stepped colour
           bands and a dot "dither" pattern, like a GIF's limited palette,
           enlarged with image-rendering: pixelated so the pixels stay crisp
           squares instead of being smoothed — matching the candle GIF. */
        .candle-glow {
          position: absolute;
          left: 50%;
          top: 27%;
          pointer-events: none;
          mix-blend-mode: screen;
          transform: translate(-50%, -50%);
          background-size: 100% 100%;
          image-rendering: pixelated;
        }
        .candle-glow-wide {
          width: 480px;
          height: 480px;
          background-image: url(/candle-glow-wide.png);
          animation: candle-flicker-wide 6.2s ease-in-out infinite;
        }
        .candle-glow-core {
          width: 252px;
          height: 252px;
          background-image: url(/candle-glow-core.png);
          animation: candle-flicker-core 3.4s ease-in-out infinite;
        }
        @keyframes candle-flicker-wide {
          0%, 100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1); }
          18% { opacity: 1; transform: translate(-50%, -50%) scale(1.04); }
          37% { opacity: 0.78; transform: translate(-50%, -50%) scale(0.98); }
          58% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.02); }
          79% { opacity: 0.82; transform: translate(-50%, -50%) scale(0.99); }
        }
        @keyframes candle-flicker-core {
          0%, 100% { opacity: 0.9; transform: translate(-50%, -52%) scale(1); }
          12% { opacity: 0.65; transform: translate(-49%, -50%) scale(0.94); }
          27% { opacity: 1; transform: translate(-51%, -53%) scale(1.06); }
          45% { opacity: 0.75; transform: translate(-50%, -51%) scale(0.97); }
          63% { opacity: 1; transform: translate(-50%, -52%) scale(1.03); }
          81% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.96); }
        }
        /* Respect the "reduce motion" setting: keep the glow, stop the
           flicker. */
        @media (prefers-reduced-motion: reduce) {
          .candle-glow { animation: none; }
        }
        /* Phone: no room beside the form, so the candle is hidden. */
        @media (max-width: 760px) {
          .candle { display: none; }
        }
      `}</style>
    </div>
  );
}
