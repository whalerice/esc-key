/**
 * Clue voices are HTML5. The shortwave hiss is a Web Audio noise bed.
 * Howler stays out of this theme: the bed is not a sample file.
 */
import { playHtml5Clip } from '@/engine/audio/html5Clip';
import { isAudioUnlocked } from '@/engine/audio/SoundManager';

const clips = new Map<string, string>();

/** Tiny placeholder tone. Gray box has no production takes. */
function toneUrl(freq: number, ms: number): string {
  const sr = 8000;
  const n = Math.max(1, Math.floor((sr * ms) / 1000));
  const bytes = new Uint8Array(44 + n);
  const view = new DataView(bytes.buffer);
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) bytes[offset + i] = text.charCodeAt(i);
  };
  ascii(0, 'RIFF');
  view.setUint32(4, 36 + n, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  ascii(36, 'data');
  view.setUint32(40, n, true);
  for (let i = 0; i < n; i += 1) {
    const env = Math.min(1, i / 80, (n - i) / 80);
    const sample = Math.sin((2 * Math.PI * freq * i) / sr) * env;
    bytes[44 + i] = 128 + Math.round(sample * 40);
  }
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]!);
  return `data:audio/wav;base64,${btoa(bin)}`;
}

const TONE: Record<string, [number, number]> = {
  station: [520, 700],
  hum: [330, 500],
  danke: [440, 600],
  thump: [90, 280],
  click: [680, 120],
};

export function playClue(id: keyof typeof TONE): void {
  let url = clips.get(id);
  if (!url) {
    const [freq, ms] = TONE[id]!;
    url = toneUrl(freq, ms);
    clips.set(id, url);
  }
  playHtml5Clip(url);
}

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let src: AudioBufferSourceNode | null = null;
let bed = 0;
let duck = 1;

function applyGain(): void {
  if (gain) gain.gain.value = Math.max(0, Math.min(0.12, bed)) * duck;
}

/** Static bed. Level is 0–1 from the tuning widget, not a saved frequency. */
export function syncNoise(level: number): void {
  if (typeof window === 'undefined' || !isAudioUnlocked()) return;
  bed = Math.max(0, Math.min(1, level)) * 0.12;
  if (!ctx) {
    ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }
  void ctx.resume();
  applyGain();
}

/** Phone voice ducks the bed by 40%. */
export function duckBed(on: boolean): void {
  duck = on ? 0.6 : 1;
  applyGain();
}

export function stopNoise(): void {
  try {
    src?.stop();
  } catch {
    /* already stopped */
  }
  void ctx?.close();
  src = null;
  gain = null;
  ctx = null;
  duck = 1;
}
