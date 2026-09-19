# Fretscape — Alternate Tuning Explorer

A web app for finding and hearing chords and scales in alternate guitar tunings. See
[PLAN.md](./PLAN.md) for the full build plan and phase list.

**Status:** Phases 0–4 complete (scaffold, theory core, static fretboard, audio engine, tuning pegs).

## Run it

Requires Node 20+.

```bash
npm install
npm run dev        # dev server (http://localhost:5173)
npm run test       # unit tests (Vitest)
npm run lint       # ESLint
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

Browser checks (need Google Chrome; they drive it with `playwright-core`). Start the dev server
on port 5199 first (`npm run dev -- --port 5199`):

```bash
npm run check:audio   # renders every sound preset offline through the real worklet: pitch, level, tone
npm run check:app     # clicks through the real app: unlock, pitch, mute, presets, volume, rapid taps
npm run check:pegs    # real mouse + touch on the tuning pegs: glide, snap, limits, wheel, keys, save/import
```

`check:app` also works on the production build: `npm run build && npm run preview -- --port 5198`
then `URL='http://localhost:5198/?debug' npm run check:app`.

Coverage of the theory engine: `npx vitest run --coverage`.

## Layout

- `src/theory/` — pure TypeScript music theory (no React, no audio). Unit tested.
- `src/audio/` — audio engine. `synth/stringDsp.ts` is the pure Karplus-Strong string model (unit
  tested in Node); `string-worklet.ts` wraps it as an AudioWorklet; `presets.ts` holds the sound
  presets as data; `effects.ts` builds each preset's EQ / drive / cab / reverb chain;
  `instrument.ts` is the interface the UI uses, so a sample-based instrument can replace the synth.
- `src/components/` — UI. `Fretboard/` draws the neck; `TuningPeg/` is the drum-roller peg and its
  drag maths (`pegMath.ts`); `Toolbar/` holds the toolbar and its dialogs.
- `src/state/` — the store, `tuningAnimation.ts` (slides the drawn pitch) and `tuningActions.ts`.
- `src/hooks/` — small React hooks (audio unlock/sync, element width).

**Tuning pegs:** drag a peg up/down (24 px per semitone) and the ringing string glides while every
label on that string slides along the neck; release snaps to the nearest semitone. Mouse wheel and
↑/↓ keys step one semitone. Labels are positioned from pitch (fret = note − string pitch), and the
store's `liveTuning` holds the fractional pitch being drawn while `tuning` holds the committed one.
Saved tunings live in `localStorage` and can be exported/imported as JSON from Settings.

**Sound notes:** browsers only start audio after a tap or click, so a "Tap to enable sound" banner
shows until then. iPhones in silent mode may mute web audio. The synth needs an AudioWorklet, which
requires a secure context (https or localhost); the ScriptProcessor fallback for plain-http hosting
is planned for Phase 10.

- `src/state/store.ts` — Zustand store (persisted to `localStorage`).
- `tests/` — Vitest tests.
