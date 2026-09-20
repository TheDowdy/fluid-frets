import { midiToFreq } from '../../theory/notes';
import { createEffectChain, type EffectChain } from '../effects';
import type { Instrument, PluckOptions, SoundPresetId, VoiceHandle } from '../instrument';
import { DEFAULT_PRESET_ID, getSoundPreset } from './presets';
import type { PluckParams } from './stringDsp';
import workletUrl from './string-worklet.ts?worker&url';
import { PROCESSOR_NAME, type WorkletMessage } from './protocol';

const STRING_COUNT = 6;
/** Max random detune per pluck, in cents (±). */
const DETUNE_CENTS = 1.5;

/**
 * Physical-model string synth: one polyphonic AudioWorklet (see stringDsp.ts) feeding a
 * per-preset effect chain. Messages sent before the worklet has loaded are queued.
 */
export class SynthInstrument implements Instrument {
  private node: AudioWorkletNode | null = null;
  private queue: WorkletMessage[] = [];
  private chain: EffectChain | null = null;
  private presetId: SoundPresetId = DEFAULT_PRESET_ID;
  private nextId = 1;
  /** Resolves when the worklet is loaded and audio can flow; rejects if it cannot load. */
  readonly ready: Promise<void>;

  constructor(
    private readonly ctx: BaseAudioContext,
    private readonly destination: AudioNode,
  ) {
    this.applyPreset();
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    if (!this.ctx.audioWorklet) {
      throw new Error('AudioWorklet is unavailable (needs a secure context: https or localhost).');
    }
    await this.ctx.audioWorklet.addModule(workletUrl);
    const node = new AudioWorkletNode(this.ctx, PROCESSOR_NAME, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    if (this.chain) node.connect(this.chain.input);
    this.node = node;
    for (const m of this.queue) node.port.postMessage(m);
    this.queue = [];
  }

  private send(message: WorkletMessage): void {
    if (this.node) this.node.port.postMessage(message);
    else this.queue.push(message);
  }

  private applyPreset(): void {
    const old = this.chain;
    const chain = createEffectChain(this.ctx, getSoundPreset(this.presetId));
    chain.output.connect(this.destination);
    this.node?.disconnect();
    this.node?.connect(chain.input);
    this.chain = chain;
    if (old) {
      // Let anything still in the old chain's reverb tail finish being disconnected quietly.
      old.output.disconnect();
      old.dispose();
    }
  }

  setPreset(id: SoundPresetId): void {
    if (id === this.presetId) return;
    this.presetId = id;
    this.applyPreset();
  }

  pluck(string: number, midi: number, opts: PluckOptions = {}): VoiceHandle {
    const velocity = Math.min(1, Math.max(0, opts.velocity ?? 0.8));
    const brightness = Math.min(1, Math.max(0, opts.brightness ?? 0));
    const preset = getSoundPreset(this.presetId).string;
    const freq = midiToFreq(midi);
    const id = this.nextId++;
    const params: PluckParams = {
      id,
      string,
      midi,
      ...(opts.when !== undefined ? { when: opts.when } : {}),
      detuneCents: (Math.random() * 2 - 1) * DETUNE_CENTS,
      // Spread strings gently across the stereo field, low strings left.
      pan: ((string / (STRING_COUNT - 1)) * 2 - 1) * 0.3,
      excitation: {
        lowpass:
          Math.min(0.97, preset.pluckLowpass + (1 - velocity) * preset.velocitySoftening * 1.5) *
          (1 - 0.4 * brightness),
        pick: preset.pickPosition,
        level: 0.2 + 0.8 * velocity,
      },
      loop: {
        // Low strings sustain longer than high ones.
        t60: Math.min(
          20,
          Math.max(0.3, preset.sustain * Math.pow(freq / 110, -preset.sustainExponent)),
        ),
        damping: Math.min(0.9, preset.damping * Math.pow(freq / 220, -0.2)),
        gate: preset.gate,
      },
    };
    this.send({ type: 'pluck', params });
    return { id, string };
  }

  setPitch(voice: VoiceHandle, midi: number, rampMs = 30): void {
    this.send({ type: 'pitch', id: voice.id, midi, rampMs });
  }

  damp(voice: VoiceHandle, when?: number): void {
    this.send({ type: 'damp', id: voice.id, ...(when !== undefined ? { when } : {}) });
  }
}
