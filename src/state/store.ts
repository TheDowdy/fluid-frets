import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SoundPresetId } from '../audio/instrument';
import type { AccidentalPref } from '../theory/notes';
import { sanitizeSaved, sanitizeTuning } from '../theory/savedTunings';
import { STANDARD_TUNING, type Tuning } from '../theory/tunings';

export const MIN_FRETS = 18;
export const MAX_FRETS = 24;

/** 'auto' = realistic spacing on wide screens, even spacing below 900 px (§4). */
export type FretSpacing = 'auto' | 'realistic' | 'even';

export interface AppState {
  /** The committed tuning (whole semitones). */
  tuning: Tuning;
  /**
   * What is drawn: equals `tuning.strings` at rest, but holds fractional MIDI values while a peg
   * is dragged or a tuning change is animating. Not persisted.
   */
  liveTuning: number[];
  savedTunings: Tuning[];
  fretCount: number;
  accidentalPref: AccidentalPref;
  leftHanded: boolean;
  fretSpacing: FretSpacing;
  /** Lifts the −7/+5 semitone limit per string (§0). */
  unlimitedRange: boolean;
  /** Soft strum of the new open strings after choosing a tuning from the list (§6). */
  strumOnTuningChange: boolean;
  soundPreset: SoundPresetId;
  /** 0–1 slider position (perceptual curve is applied by the audio engine). */
  volume: number;
  muted: boolean;
  /**
   * Frets per string (null = muted) that a strum sounds instead of the open strings. Set by the
   * chord voicing (Phase 7) and open-selection (Phase 8) features; null = strum the open strings.
   * Not persisted.
   */
  strumShape: (number | null)[] | null;

  /** Sets the committed tuning without touching `liveTuning` (callers animate it). */
  setTuning: (tuning: Tuning) => void;
  /** Sets both the committed and drawn tuning at once, with no animation. */
  jumpToTuning: (tuning: Tuning) => void;
  setLive: (stringIndex: number, midi: number) => void;
  setSavedTunings: (saved: Tuning[]) => void;
  setFretCount: (fretCount: number) => void;
  setAccidentalPref: (pref: AccidentalPref) => void;
  setLeftHanded: (leftHanded: boolean) => void;
  setFretSpacing: (spacing: FretSpacing) => void;
  setUnlimitedRange: (unlimited: boolean) => void;
  setStrumOnTuningChange: (strum: boolean) => void;
  setSoundPreset: (id: SoundPresetId) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setStrumShape: (shape: (number | null)[] | null) => void;
}

/** The subset written to localStorage. Transient drawing state is deliberately left out. */
type Persisted = Pick<
  AppState,
  | 'tuning'
  | 'savedTunings'
  | 'fretCount'
  | 'accidentalPref'
  | 'leftHanded'
  | 'fretSpacing'
  | 'unlimitedRange'
  | 'strumOnTuningChange'
  | 'soundPreset'
  | 'volume'
  | 'muted'
>;

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tuning: STANDARD_TUNING,
      liveTuning: [...STANDARD_TUNING.strings],
      savedTunings: [],
      fretCount: 22,
      accidentalPref: 'sharp',
      leftHanded: false,
      fretSpacing: 'auto',
      unlimitedRange: false,
      strumOnTuningChange: true,
      soundPreset: 'acoustic',
      volume: 0.8,
      muted: false,
      strumShape: null,

      setTuning: (tuning) => set({ tuning }),
      jumpToTuning: (tuning) => set({ tuning, liveTuning: [...tuning.strings] }),
      setLive: (stringIndex, midi) =>
        set((s) => {
          const liveTuning = s.liveTuning.slice();
          liveTuning[stringIndex] = midi;
          return { liveTuning };
        }),
      setSavedTunings: (savedTunings) => set({ savedTunings }),
      setFretCount: (fretCount) =>
        set({ fretCount: Math.min(MAX_FRETS, Math.max(MIN_FRETS, Math.round(fretCount))) }),
      setAccidentalPref: (accidentalPref) => set({ accidentalPref }),
      setLeftHanded: (leftHanded) => set({ leftHanded }),
      setFretSpacing: (fretSpacing) => set({ fretSpacing }),
      setUnlimitedRange: (unlimitedRange) => set({ unlimitedRange }),
      setStrumOnTuningChange: (strumOnTuningChange) => set({ strumOnTuningChange }),
      setSoundPreset: (soundPreset) => set({ soundPreset }),
      setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
      setMuted: (muted) => set({ muted }),
      setStrumShape: (strumShape) => set({ strumShape }),
    }),
    {
      name: 'fretscape-settings',
      version: 1,
      partialize: (s): Persisted => ({
        tuning: s.tuning,
        savedTunings: s.savedTunings,
        fretCount: s.fretCount,
        accidentalPref: s.accidentalPref,
        leftHanded: s.leftHanded,
        fretSpacing: s.fretSpacing,
        unlimitedRange: s.unlimitedRange,
        strumOnTuningChange: s.strumOnTuningChange,
        soundPreset: s.soundPreset,
        volume: s.volume,
        muted: s.muted,
      }),
      // Never trust storage: validate the tuning data, and rebuild the drawn tuning from it.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Persisted>;
        const tuning = sanitizeTuning(p.tuning);
        return {
          ...current,
          ...p,
          tuning,
          liveTuning: [...tuning.strings],
          savedTunings: sanitizeSaved(p.savedTunings),
          fretCount: Math.min(
            MAX_FRETS,
            Math.max(MIN_FRETS, Math.round(Number(p.fretCount) || current.fretCount)),
          ),
        };
      },
    },
  ),
);
