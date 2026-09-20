import { useEffect } from 'react';
import { selectBestVoicing, stopChordPlayback } from '../state/chordActions';
import { useStore } from '../state/store';

/**
 * Keeps the fingering on the neck in step with the chord: in chord mode it shows the best voicing
 * whenever the chord, the tuning, the fret count or the voicing rules change (which also discards
 * hand edits made for the previous chord), and outside chord mode it releases the strum shape.
 */
export function useChordSelection(): void {
  const mode = useStore((s) => s.mode);
  const spec = useStore((s) => s.chordSpec);
  const rules = useStore((s) => s.voicingRules);
  const strings = useStore((s) => s.tuning.strings);
  const fretCount = useStore((s) => s.fretCount);
  const pref = useStore((s) => s.accidentalPref);

  useEffect(() => {
    if (mode === 'chord') {
      selectBestVoicing();
    } else {
      stopChordPlayback();
      const { chordShape, setChordShape, setEditingShape } = useStore.getState();
      if (chordShape) setChordShape(null, null);
      setEditingShape(false);
    }
  }, [mode, spec, rules, strings, fretCount, pref]);
}
