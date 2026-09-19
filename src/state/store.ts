import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccidentalPref } from '../theory/notes';
import { STANDARD_TUNING, type Tuning } from '../theory/tunings';

export const MIN_FRETS = 18;
export const MAX_FRETS = 24;

/** 'auto' = realistic spacing on wide screens, even spacing below 900 px (§4). */
export type FretSpacing = 'auto' | 'realistic' | 'even';

interface AppState {
  tuning: Tuning;
  fretCount: number;
  accidentalPref: AccidentalPref;
  leftHanded: boolean;
  fretSpacing: FretSpacing;
  setTuning: (tuning: Tuning) => void;
  setFretCount: (fretCount: number) => void;
  setAccidentalPref: (pref: AccidentalPref) => void;
  setLeftHanded: (leftHanded: boolean) => void;
  setFretSpacing: (spacing: FretSpacing) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tuning: STANDARD_TUNING,
      fretCount: 22,
      accidentalPref: 'sharp',
      leftHanded: false,
      fretSpacing: 'auto',
      setTuning: (tuning) => set({ tuning }),
      setFretCount: (fretCount) =>
        set({ fretCount: Math.min(MAX_FRETS, Math.max(MIN_FRETS, Math.round(fretCount))) }),
      setAccidentalPref: (accidentalPref) => set({ accidentalPref }),
      setLeftHanded: (leftHanded) => set({ leftHanded }),
      setFretSpacing: (fretSpacing) => set({ fretSpacing }),
    }),
    { name: 'fretscape-settings' },
  ),
);
