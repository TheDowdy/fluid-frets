import { boardHeight, inlayFrets, markerRadius } from './geometry';
import { skin } from './skin';

interface Props {
  fretCount: number;
  centres: readonly number[];
  spaces: readonly number[];
}

/** Dot inlays at 3 5 7 9 15 17 19 21, double dots at 12 and 24. */
export function Inlays({ fretCount, centres, spaces }: Props) {
  return (
    <g fill={skin.inlay}>
      {inlayFrets(fretCount).flatMap(({ fret, double }) => {
        const x = centres[fret] as number;
        const r = Math.min(7, markerRadius(spaces[fret] as number) * 0.5);
        const ys = double ? [boardHeight * 0.3, boardHeight * 0.7] : [boardHeight / 2];
        return ys.map((y) => <circle key={`${fret}-${y}`} cx={x} cy={y} r={r} />);
      })}
    </g>
  );
}
