import { memo, useEffect, useRef } from 'react';
import { onPluck } from '../../state/pluckEvents';
import { useStore } from '../../state/store';
import { edgeOpacity, slidingNotes } from '../../theory/fretboard';
import { formatNoteName, pitchClass, type Spelling } from '../../theory/notes';
import {
  interpolateAtFret,
  interpolateClamped,
  markerRadius,
  mirrorX,
  stringY,
  STRING_COUNT,
} from './geometry';
import { skin } from './skin';

interface StringProps {
  /** 0 = lowest string. */
  string: number;
  fretCount: number;
  centres: readonly number[];
  spaces: readonly number[];
  spelling: Spelling;
  leftHanded: boolean;
}

/** Font size that keeps 1–3 character labels (F, F♯, F𝄪) inside a marker of radius r. */
function labelSize(r: number, label: string): number {
  const chars = [...label].length;
  return r * (chars === 1 ? 1.15 : chars === 2 ? 0.95 : 0.8);
}

/**
 * All the note markers of one string. Each is placed from its pitch (fret = midi − string
 * pitch), so when the string's live pitch changes the labels slide along the neck. It selects
 * only its own string's pitch, so a peg drag re-renders one string, not six.
 */
const StringMarkers = memo(function StringMarkers({
  string,
  fretCount,
  centres,
  spaces,
  spelling,
  leftHanded,
}: StringProps) {
  const pitch = useStore((s) => s.liveTuning[string]) ?? 40;
  const cy = stringY(string);

  return (
    <g>
      {slidingNotes(pitch, fretCount).map(({ midi, fret }) => {
        const opacity = edgeOpacity(fret, fretCount);
        if (opacity <= 0) return null;
        const label = formatNoteName(spelling[pitchClass(midi)] as (typeof spelling)[number]);
        const r = markerRadius(interpolateClamped(spaces, fret));
        const cx = mirrorX(interpolateAtFret(centres, fret), leftHanded);
        // Only a marker sitting exactly on a fret is a tap target (always true at rest).
        const onFret = Math.abs(fret - Math.round(fret)) < 1e-6 && fret >= 0 && fret <= fretCount;
        return (
          <g
            key={midi}
            opacity={opacity}
            data-string={onFret ? string : undefined}
            data-fret={onFret ? Math.round(fret) : undefined}
            data-midi={midi}
            pointerEvents={onFret ? undefined : 'none'}
          >
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill={skin.markerFill}
              stroke="rgba(0,0,0,0.5)"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <text
              x={cx}
              y={cy}
              fontSize={labelSize(r, label)}
              fontWeight={600}
              fill={skin.markerText}
            >
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
});

interface Props {
  fretCount: number;
  centres: readonly number[];
  spaces: readonly number[];
  spelling: Spelling;
  leftHanded: boolean;
}

/** A circle + label in every fret space, and one per string behind the nut for the open note. */
export function NoteMarkers(props: Props) {
  const ref = useRef<SVGGElement>(null);

  // Pulse the marker of any note that sounds, whether tapped or strummed.
  useEffect(
    () =>
      onPluck(({ string, fret }) => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        ref.current
          ?.querySelector(`[data-string="${string}"][data-fret="${fret}"] circle`)
          ?.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }],
            { duration: 380, easing: 'ease-out' },
          );
      }),
    [],
  );

  const { fretCount, centres, spaces, spelling, leftHanded } = props;
  return (
    <g
      ref={ref}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="system-ui, sans-serif"
      className="markers"
    >
      {Array.from({ length: STRING_COUNT }, (_, string) => (
        <StringMarkers
          key={string}
          string={string}
          fretCount={fretCount}
          centres={centres}
          spaces={spaces}
          spelling={spelling}
          leftHanded={leftHanded}
        />
      ))}
    </g>
  );
}
