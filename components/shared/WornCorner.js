"use client";

import { useId } from "react";

// One aged, gold corner bracket, drawn as an inline SVG (an L with a small
// curl at the end of each arm, like a manuscript corner). "Worn" comes from
// two things: an SVG filter that roughens the stroke's edges like old ink
// (feTurbulence noise displacing the line), and gaps in the line
// (stroke-dasharray) where the ink has rubbed away.
// Drawn as a top-left corner; the caller rotates it for other corners via
// `className`. Decorative only.

export default function WornCorner({ className }) {
  // Unique per instance, so two corners on one page don't share an id.
  const filterId = `worn-${useId().replace(/:/g, "")}`;

  return (
    <svg className={className} width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g
        filter={`url(#${filterId})`}
        fill="none"
        stroke="rgba(230, 197, 117, 0.85)"
        strokeLinecap="round"
      >
        {/* The L: down the left edge and along the top, with worn gaps. */}
        <path d="M6 66 V6 H66" strokeWidth="2.2" strokeDasharray="22 3 9 2 30 4 18 2 40" />
        {/* A fainter inner line, like a second ruled border. */}
        <path d="M13 50 V13 H50" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="14 4 20 3 30" />
        {/* Small curls at the ends of both arms. */}
        <path d="M6 66 q0 4 4 4 q3 0 3 -3" strokeWidth="1.6" />
        <path d="M66 6 q4 0 4 4 q0 3 -3 3" strokeWidth="1.6" />
        {/* A tiny diamond tucked into the corner. */}
        <path d="M20 16 l4 4 l-4 4 l-4 -4 z" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
