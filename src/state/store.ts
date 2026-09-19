import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccidentalPref } from '../theory/notes';
import { STANDARD_TUNING, type Tuning } from '../theory/tunings';

/** Phase 0 store: just enough state to prove wiring and persistence. Grows with later phases. */
interface AppState {
  tuning: Tuning;
  fretCount: number;
  accidentalPref: AccidentalPref;
  setTuning: (tuning: Tuning) => void;
  setFretCount: (fretCount: number) => void;
  setAccidentalPref: (pref: AccidentalPref) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tuning: STANDARD_TUNING,
      fretCount: 22,
      accidentalPref: 'sharp',
      setTuning: (tuning) => set({ tuning }),
      setFretCount: (fretCount) => set({ fretCount: Math.min(24, Math.max(18, fretCount)) }),
      setAccidentalPref: (accidentalPref) => set({ accidentalPref }),
    }),
    { name: 'fretscape-settings' },
  ),
);
