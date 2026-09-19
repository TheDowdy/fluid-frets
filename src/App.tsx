import { useStore } from './state/store';
import { midiToName } from './theory/notes';

export default function App() {
  const tuning = useStore((s) => s.tuning);
  const pref = useStore((s) => s.accidentalPref);
  return (
    <main className="placeholder">
      <h1>Fretscape</h1>
      <p>Alternate tuning explorer — scaffold running.</p>
      <p>
        Current tuning: <strong>{tuning.name}</strong> (
        {tuning.strings.map((m) => midiToName(m, pref)).join(' ')})
      </p>
    </main>
  );
}
