import { MAX_FRETS, MIN_FRETS, useStore, type FretSpacing } from '../../state/store';
import { getPreset, PRESET_GROUPS } from '../../theory/tunings';
import { midiToName } from '../../theory/notes';
import { SoundControls } from './SoundControls';

const CUSTOM = 'custom';
const fretOptions = Array.from({ length: MAX_FRETS - MIN_FRETS + 1 }, (_, i) => MIN_FRETS + i);

export function Toolbar() {
  const tuning = useStore((s) => s.tuning);
  const fretCount = useStore((s) => s.fretCount);
  const pref = useStore((s) => s.accidentalPref);
  const leftHanded = useStore((s) => s.leftHanded);
  const fretSpacing = useStore((s) => s.fretSpacing);
  const { setTuning, setFretCount, setAccidentalPref, setLeftHanded, setFretSpacing } =
    useStore.getState();

  const isPreset = getPreset(tuning.id) !== undefined;

  return (
    <header className="toolbar">
      <h1 className="toolbar-title">Fretscape</h1>

      <label className="field">
        <span>Tuning</span>
        <select
          value={isPreset ? tuning.id : CUSTOM}
          onChange={(e) => {
            const preset = getPreset(e.target.value);
            if (preset) setTuning(preset);
          }}
        >
          {!isPreset && <option value={CUSTOM}>Custom</option>}
          {PRESET_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.tunings.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.strings.map((m) => midiToName(m, pref)).join(' ')}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Frets</span>
        <select value={fretCount} onChange={(e) => setFretCount(Number(e.target.value))}>
          {fretOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Spacing</span>
        <select value={fretSpacing} onChange={(e) => setFretSpacing(e.target.value as FretSpacing)}>
          <option value="auto">Auto</option>
          <option value="realistic">Realistic</option>
          <option value="even">Even</option>
        </select>
      </label>

      <label className="field">
        <span>Accidentals</span>
        <select
          value={pref}
          onChange={(e) => setAccidentalPref(e.target.value as 'sharp' | 'flat')}
        >
          <option value="sharp">♯ Sharps</option>
          <option value="flat">♭ Flats</option>
        </select>
      </label>

      <SoundControls />

      <label className="check">
        <input
          type="checkbox"
          checked={leftHanded}
          onChange={(e) => setLeftHanded(e.target.checked)}
        />
        <span>Left-handed</span>
      </label>
    </header>
  );
}
