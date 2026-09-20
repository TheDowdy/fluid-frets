import { useMemo } from 'react';
import { useStore } from '../state/store';
import type { NoteName, Spelling } from '../theory/notes';
import { describeOverlay, overlayPitchClasses } from '../theory/overlays';
import type { PaletteId } from '../theory/scaleColors';
import { bestRootSpelling, getScale, scaleSpelling, type ScaleDef } from '../theory/scales';
import { buildPitchViews, type PitchView } from '../theory/scaleView';

/** Everything the fretboard, legend and panel need to know about the active key and scale. */
export interface ScaleViewModel {
  root: NoteName;
  def: ScaleDef;
  /** Spelling of all 12 pitch classes: the key's own names in the scale, ♯/♭ preference elsewhere. */
  spelling: Spelling;
  /** Indexed by pitch class. */
  views: PitchView[];
  colourMode: boolean;
  palette: PaletteId;
  hideOutOfScale: boolean;
  /** e.g. "vi — Am"; null when no overlay is active. */
  overlayLabel: string | null;
}

/** The view model in scale mode, or null in explore mode (chromatic, all notes equal). */
export function useScaleView(): ScaleViewModel | null {
  const mode = useStore((s) => s.mode);
  const settings = useStore((s) => s.scaleSettings);
  const palette = useStore((s) => s.palette);
  const pref = useStore((s) => s.accidentalPref);

  return useMemo(() => {
    if (mode !== 'scale') return null;
    const def = getScale(settings.scaleId);
    const root = bestRootSpelling(settings.rootPc, def, pref);
    const overlay = overlayPitchClasses(root, def, settings.overlay, pref);
    return {
      root,
      def,
      spelling: scaleSpelling(root, def, pref),
      views: buildPitchViews(root, def, overlay),
      colourMode: settings.colourMode,
      palette,
      hideOutOfScale: settings.hideOutOfScale,
      overlayLabel: overlay ? describeOverlay(root, def, settings.overlay, pref) : null,
    };
  }, [mode, settings, palette, pref]);
}
