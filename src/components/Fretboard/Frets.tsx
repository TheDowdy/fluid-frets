import { boardHeight, nutX } from './geometry';
import { skin } from './skin';

interface Props {
  wires: readonly number[];
}

/** Nut and fret wires (right-handed coordinates). */
export function Frets({ wires }: Props) {
  return (
    <g>
      <rect x={nutX - 5} y={0} width={5} height={boardHeight} fill={skin.nut} />
      {wires.slice(1).map((x, i) => (
        <g key={i}>
          <line x1={x} x2={x} y1={0} y2={boardHeight} stroke={skin.fretWire[1]} strokeWidth={3.2} />
          <line x1={x} x2={x} y1={0} y2={boardHeight} stroke={skin.fretWire[0]} strokeWidth={1.6} />
        </g>
      ))}
    </g>
  );
}
