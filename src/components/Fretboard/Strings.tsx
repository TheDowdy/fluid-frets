import { nutX, stringY, totalWidth } from './geometry';
import { skin } from './skin';

/** Six strings from the nut to the end of the board; 4–6 get a wound look. */
export function Strings() {
  return (
    <g>
      {skin.stringWidth.map((width, i) => {
        const y = stringY(i);
        const wound = skin.wound[i];
        return (
          <g key={i}>
            <line
              x1={nutX}
              x2={totalWidth}
              y1={y + 1.2}
              y2={y + 1.2}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={width}
            />
            <line
              x1={nutX}
              x2={totalWidth}
              y1={y}
              y2={y}
              stroke={wound ? skin.stringWound : skin.stringPlain}
              strokeWidth={width}
            />
            {wound && (
              <line
                x1={nutX}
                x2={totalWidth}
                y1={y}
                y2={y}
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={width}
                strokeDasharray="1.1 1.1"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
