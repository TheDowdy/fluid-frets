import { useChordView } from './useChordView';
import { useScaleView, type DisplayModel } from './useScaleView';

/** How notes are drawn on the neck: by chord, by scale, or null for plain chromatic exploring. */
export function useDisplay(): DisplayModel | null {
  const chord = useChordView();
  const scale = useScaleView();
  return chord ?? scale;
}
