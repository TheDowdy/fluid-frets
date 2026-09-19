import { memo } from 'react';
import type { FretCell } from '../../theory/fretboard';
import { markerRadius, mirrorX, stringY } from './geometry';
import { skin } from './skin';

interface Props {
  board: readonly (readonly FretCell[])[];
  centres: readonly number[];
  spaces: readonly number[];
  leftHanded: boolean;
  /** Called on press with the string (0 = lowest) and fret (0 = open). */
  onPlay?: (string: number, fret: number) => void;
}

/** Font size that keeps 1–3 character labels (F, F♯, F𝄪) inside a marker of radius r. */
function labelSize(r: number, label: string): number {
  const chars = [...label].length;
  return r * (chars === 1 ? 1.15 : chars === 2 ? 0.95 : 0.8);
}

/** A circle + label in every fret space, and one per string behind the nut for the open note. */
export const NoteMarkers = memo(function NoteMarkers({
  board,
  centres,
  spaces,
  leftHanded,
  onPlay,
}: Props) {
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
      {board.flatMap((row) =>
        row.map((cell) => {
          const r = markerRadius(spaces[cell.fret] as number);
          const cx = mirrorX(centres[cell.fret] as number, leftHanded);
          const cy = stringY(cell.string);
          return (
            <g
              key={`${cell.string}-${cell.fret}`}
              data-string={cell.string}
              data-fret={cell.fret}
              aria-label={cell.fullName}
            >
              <circle cx={cx} cy={cy} r={r} fill={skin.markerFill} stroke="rgba(0,0,0,0.5)" />
              <text
                x={cx}
                y={cy}
                fontSize={labelSize(r, cell.label)}
                fontWeight={600}
                fill={skin.markerText}
              >
                {cell.label}
              </text>
            </g>
          );
        }),
      )}
    </g>
  );
});
