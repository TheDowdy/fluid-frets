# Fretscape — Alternate Tuning Explorer

A web app for finding and hearing chords and scales in alternate guitar tunings. See
[PLAN.md](./PLAN.md) for the full build plan and phase list.

**Status:** Phase 0 (scaffold) and Phase 1 (theory core) complete.

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

Coverage of the theory engine: `npx vitest run --coverage`.

## Layout

- `src/theory/` — pure TypeScript music theory (no React, no audio). Unit tested.
- `src/audio/`, `src/components/`, `src/hooks/` — placeholders for later phases.
- `src/state/store.ts` — Zustand store (persisted to `localStorage`).
- `tests/` — Vitest tests.
