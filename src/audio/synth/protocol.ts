import type { PluckParams } from './stringDsp';

/** Messages from the main thread to the string worklet. Times are AudioContext seconds. */
export type WorkletMessage =
  | { type: 'pluck'; params: PluckParams }
  | { type: 'pitch'; when?: number; id: number; midi: number; rampMs: number }
  | { type: 'damp'; when?: number; id: number };

export const PROCESSOR_NAME = 'fretscape-strings';
