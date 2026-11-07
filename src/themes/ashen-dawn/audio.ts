/**
 * Placeholder playback.
 * Howler stays in this file: tools/ashen-dawn-check.mts rejects the word howler in Flow.tsx.
 * Clues, broadcasts, and dialogue use HTML5. Loops and SFX use Howler.
 * The shortwave hiss is a Web Audio noise bed, not a sample.
 */
import { Howl } from 'howler';
import { playHtml5Clip } from '@/engine/audio/html5Clip';
import { isAudioUnlocked } from '@/engine/audio/SoundManager';
import { BED_SRC, CLUE_SRC, SFX_SRC } from './art';

const sfxHowls = new Map<string, Howl>();
let bedHowl: Howl | null = null;
let duck = 1;

export function playSeat(id: keyof typeof SFX_SRC): void {
  if (!isAudioUnlocked()) return;
  const url = SFX_SRC[id];
  let howl = sfxHowls.get(url);
  if (!howl) {
    howl = new Howl({ src: [url], volume: 0.35 });
    sfxHowls.set(url, howl);
  }
  howl.play();
}

export function playClue(id: keyof typeof CLUE_SRC): void {
  playHtml5Clip(CLUE_SRC[id]);
}

/** Room hum under the bunker. Phone calls duck it by 40%. */
export function syncBed(): void {
  if (!isAudioUnlocked()) return;
  if (!bedHowl) {
    bedHowl = new Howl({ src: [BED_SRC.room], loop: true, volume: 0.12 * duck });
  }
  bedHowl.volume(0.12 * duck);
  if (!bedHowl.playing()) bedHowl.play();
}

export function stopBeds(): void {
  bedHowl?.stop();
}

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let src: AudioBufferSourceNode | null = null;
let bed = 0;

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

/** Phone voice ducks the hum and the hiss by 40%. */
export function duckBed(on: boolean): void {
  duck = on ? 0.6 : 1;
  if (bedHowl) bedHowl.volume(0.12 * duck);
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
