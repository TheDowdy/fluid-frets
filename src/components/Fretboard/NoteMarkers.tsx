import { memo } from 'react';
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
            <circle cx={cx} cy={cy} r={r} fill={skin.markerFill} stroke="rgba(0,0,0,0.5)" />
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
  /** Called on press with the string (0 = lowest) and fret (0 = open). */
  onPlay?: (string: number, fret: number) => void;
}

/** A circle + label in every fret space, and one per string behind the nut for the open note. */
export function NoteMarkers({ onPlay, ...rest }: Props) {
  return (
    <g
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="system-ui, sans-serif"
      className="markers"
      onPointerDown={(e) => {
        const target = (e.target as Element).closest<SVGGElement>('[data-string]');
        if (!target || !onPlay) return;
        onPlay(Number(target.dataset.string), Number(target.dataset.fret));
      }}
    >
      {Array.from({ length: STRING_COUNT }, (_, string) => (
        <StringMarkers key={string} string={string} {...rest} />
      ))}
    </g>
  );
}
