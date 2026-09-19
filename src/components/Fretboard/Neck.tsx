import { boardHeight, nutX, totalWidth } from './geometry';
import { skin } from './skin';

/** Wood surfaces: headstock sliver and fretboard. Drawn in right-handed coordinates. */
export function Neck() {
  return (
    <g>
      <defs>
        <linearGradient id="fs-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skin.boardWood[0]} />
          <stop offset="1" stopColor={skin.boardWood[1]} />
        </linearGradient>
        <linearGradient id="fs-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skin.headstock[0]} />
          <stop offset="1" stopColor={skin.headstock[1]} />
        </linearGradient>
        {/* Subtle horizontal grain: stretched turbulence, kept faint. */}
        <filter id="fs-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.35" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.12" />
        </filter>
      </defs>
      <rect x={0} y={0} width={nutX} height={boardHeight} rx={14} fill="url(#fs-head)" />
      <rect x={nutX} y={0} width={totalWidth - nutX} height={boardHeight} fill="url(#fs-board)" />
      <rect
        x={nutX}
        y={0}
        width={totalWidth - nutX}
        height={boardHeight}
        filter="url(#fs-grain)"
        opacity={0.55}
        style={{ mixBlendMode: 'multiply' }}
      />
    </g>
  );
}
