import type { ReactNode } from 'react';
import { useScaleView, type ScaleViewModel } from '../../hooks/useScaleView';
import { formatNoteName, noteNamePc } from '../../theory/notes';
import { markerStyle, type MarkerStyle, type ScaleStyleOptions } from '../Fretboard/markerStyle';
import { skin } from '../Fretboard/skin';

/** Wood behind each swatch, so it looks as it does on the neck whatever the page theme. */
function SwatchBacking() {
  return <rect x="-15" y="-15" width="30" height="30" rx="7" fill={skin.boardWood[0]} />;
}

/** A small marker drawn exactly as it appears on the neck. */
function Swatch({ style, children }: { style: MarkerStyle; children?: ReactNode }) {
  return (
    <svg className="swatch" width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
      <SwatchBacking />
      <g opacity={style.opacity === 1 ? 1 : Math.max(style.opacity, 0.55)}>
        <circle
          r={12 * style.scale}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
        />
        {style.dashed && (
          <circle
            r={12 * style.scale * 0.68}
            fill="none"
            stroke={style.text}
            strokeWidth={1.3}
            strokeDasharray="2.4 2"
          />
        )}
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="system-ui, sans-serif"
          fontSize="11"
          fontWeight="600"
          fill={style.text}
        >
          {children}
        </text>
      </g>
    </svg>
  );
}

function RingSwatch() {
  return (
    <svg className="swatch" width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
      <SwatchBacking />
      <circle r="9" fill={skin.markerFill} stroke="rgba(0,0,0,0.5)" />
      <circle r="12" fill="none" stroke={skin.ringHalo} strokeWidth="4.6" />
      <circle r="12" fill="none" stroke={skin.ring} strokeWidth="2.4" />
    </svg>
  );
}

function options(vm: ScaleViewModel): ScaleStyleOptions {
  return {
    colourMode: vm.colourMode,
    palette: vm.palette,
    hideOutOfScale: false,
    chromatic: !!vm.def.chromatic,
  };
}

/** Under the neck: what each marker style means. Shown only in scale mode. */
export function Legend() {
  const vm = useScaleView();
  if (!vm) return null;
  const opts = options(vm);
  const rootPc = noteNamePc(vm.root);

  return (
    <div className="legend" aria-label="Legend">
      {vm.colourMode ? (
        <ul className="legend-list">
          {vm.def.degrees.map((d) => {
            const pc = (rootPc + d.interval) % 12;
            const style = markerStyle(vm.views[pc], opts);
            return (
              <li key={d.interval} data-degree={d.label}>
                <Swatch style={style}>{d.label}</Swatch>
                <span className="legend-note">{formatNoteName(vm.spelling[pc]!)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="legend-list">
          <li>
            <Swatch
              style={markerStyle(
                { role: 'tonic', interval: 0, variant: false, overlay: false },
                opts,
              )}
            />
            <span>Tonic</span>
          </li>
          <li>
            <Swatch
              style={markerStyle(
                { role: 'scale', interval: 7, variant: false, overlay: false },
                opts,
              )}
            />
            <span>In scale</span>
          </li>
          <li>
            <Swatch
              style={markerStyle(
                { role: 'out', interval: 1, variant: false, overlay: false },
                opts,
              )}
            />
            <span>{vm.hideOutOfScale ? 'Out of scale (hidden)' : 'Out of scale'}</span>
          </li>
        </ul>
      )}
      {vm.overlayLabel && (
        <p className="legend-overlay">
          <RingSwatch />
          <span>Ring: {vm.overlayLabel}</span>
        </p>
      )}
    </div>
  );
}
