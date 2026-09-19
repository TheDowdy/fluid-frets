import { PROCESSOR_NAME, type WorkletMessage } from './protocol';
import { StringBank } from './stringDsp';

class StringProcessor extends AudioWorkletProcessor {
  private readonly bank = new StringBank(sampleRate);

  constructor() {
    super();
    this.port.onmessage = (e: MessageEvent<WorkletMessage>) => {
      const m = e.data;
      // Times arrive in seconds on the AudioContext clock; missing/past times play immediately.
      const frame = (when: number | undefined) =>
        when === undefined ? 0 : Math.round(when * sampleRate);
      if (m.type === 'pluck') this.bank.pluck(frame(m.params.when), m.params);
      else if (m.type === 'pitch') this.bank.setPitch(frame(m.when), m.id, m.midi, m.rampMs);
      else this.bank.damp(frame(m.when), m.id);
    };
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const out = outputs[0];
    if (!out || !out[0]) return true;
    const left = out[0];
    const right = out[1] ?? out[0];
    this.bank.process(left, right, left.length, currentFrame);
    return true;
  }
}

registerProcessor(PROCESSOR_NAME, StringProcessor);
