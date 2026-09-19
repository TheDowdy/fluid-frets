/**
 * Visual constants for the fretboard. Phase 9 replaces this with per-guitar-model skins;
 * keeping every colour here means components never hard-code styling.
 */
export const skin = {
  headstock: ['#3a2a20', '#2a1d16'],
  boardWood: ['#4a2f22', '#3b241a'],
  grain: '#1f120c',
  nut: '#e8e0cc',
  fretWire: ['#d9d9d6', '#8f8f8a'],
  inlay: 'rgba(240, 232, 210, 0.55)',
  stringPlain: '#d8d8d4',
  stringWound: '#c9a86a',
  markerFill: '#f2ead3',
  markerText: '#221710',
  fretNumber: 'currentColor',
  /** String thickness by string index (0 = lowest). */
  stringWidth: [2.8, 2.3, 1.9, 1.4, 1.1, 0.9],
  /** Strings 4–6 (indices 0–2) get a wound look. */
  wound: [true, true, true, false, false, false],
} as const;
