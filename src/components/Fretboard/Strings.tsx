import { useEffect, useRef } from 'react';
import { onPluck } from '../../state/pluckEvents';
import { nutX, stringY, totalWidth } from './geometry';
import { skin } from './skin';

/** A plucked string swings at this (visible, not audible) rate and dies away exponentially. */
const WOBBLE_HZ = 13;
const WOBBLE_DECAY_SECONDS = 0.55;
const WOBBLE_MAX_AMPLITUDE = 5;
const WOBBLE_POINTS = 48;

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** The three layers a string is drawn with: shadow, string, and (wound strings) a dashed overlay. */
function StringLayers({ index, d }: { index: number; d?: string }) {
  const y = stringY(index);
  const width = skin.stringWidth[index];
  const wound = skin.wound[index];
  const shape = (dy: number, stroke: string, dash?: string) =>
    d ? (
      <path d={d} transform={`translate(0 ${dy})`} stroke={stroke} strokeDasharray={dash} />
    ) : (
      <line
        x1={nutX}
        x2={totalWidth}
        y1={y + dy}
        y2={y + dy}
        stroke={stroke}
        strokeDasharray={dash}
      />
    );
  return (
    <g strokeWidth={width} fill="none">
      {shape(1.2, 'rgba(0,0,0,0.35)')}
      {shape(0, wound ? skin.stringWound : skin.stringPlain)}
      {wound && shape(0, 'rgba(0,0,0,0.35)', '1.1 1.1')}
    </g>
  );
}

/**
 * One string. At rest it is a straight line; when plucked it is swapped for a path whose sine
 * wobble decays with the sound. The path is driven straight from requestAnimationFrame so a
 * strum doesn't cost six React renders per frame.
 */
function StringLine({ index }: { index: number }) {
  const restRef = useRef<SVGGElement>(null);
  const wobbleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let raf = 0;
    let startedAt = 0;
    let amplitude = 0;
    const y = stringY(index);

    const settle = () => {
      raf = 0;
      if (wobbleRef.current) wobbleRef.current.style.display = 'none';
      if (restRef.current) restRef.current.style.display = '';
    };

    const frame = () => {
      // performance.now() rather than rAF's timestamp, which can precede the pluck's clock.
      const t = Math.max(0, (performance.now() - startedAt) / 1000);
      const a = amplitude * Math.exp(-t / WOBBLE_DECAY_SECONDS);
      const wobble = wobbleRef.current;
      if (a < 0.05 || !wobble) {
        settle();
        return;
      }
      const swing = a * Math.sin(2 * Math.PI * WOBBLE_HZ * t);
      let d = '';
      for (let k = 0; k <= WOBBLE_POINTS; k++) {
        const u = k / WOBBLE_POINTS;
        const x = nutX + u * (totalWidth - nutX);
        d += `${k === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(y + swing * Math.sin(Math.PI * u)).toFixed(2)}`;
      }
      for (const path of wobble.querySelectorAll('path')) path.setAttribute('d', d);
      raf = requestAnimationFrame(frame);
    };

    const off = onPluck((e) => {
      if (e.string !== index || prefersReducedMotion()) return;
      startedAt = performance.now();
      amplitude = WOBBLE_MAX_AMPLITUDE * (0.35 + 0.65 * e.velocity);
      if (restRef.current) restRef.current.style.display = 'none';
      if (wobbleRef.current) wobbleRef.current.style.display = '';
      if (!raf) frame();
    });
    return () => {
      off();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [index]);

  return (
    <g>
      <g ref={restRef}>
        <StringLayers index={index} />
      </g>
      <g ref={wobbleRef} data-wobble={index} style={{ display: 'none' }}>
        <StringLayers index={index} d={`M${nutX} ${stringY(index)}`} />
      </g>
    </g>
  );
}

/** Six strings from the nut to the end of the board; 4–6 get a wound look. */
export function Strings() {
  return (
    <g>
      {skin.stringWidth.map((_, i) => (
        <StringLine key={i} index={i} />
      ))}
    </g>
  );
}
