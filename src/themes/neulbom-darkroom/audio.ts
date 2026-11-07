/**
 * Placeholder playback.
 * Howler stays in this file: tools/neulbom-darkroom-check.mts rejects the word howler in Flow.tsx.
 * Clue voices use HTML5. Face-down steps are a bed, not a voice.
 */
import { Howl } from 'howler';
import { playHtml5Clip } from '@/engine/audio/html5Clip';
import { isAudioUnlocked } from '@/engine/audio/SoundManager';
import { BED_SRC, CLUE_SRC, SFX_SRC } from './art';

const sfxHowls = new Map<string, Howl>();
const beds = new Map<keyof typeof BED_SRC, Howl>();

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

function setBed(key: keyof typeof BED_SRC, want: boolean, volume: number): void {
  let howl = beds.get(key);
  if (!want) {
    howl?.stop();
    return;
  }
  if (!howl) {
    howl = new Howl({ src: [BED_SRC[key]], loop: true, volume });
    beds.set(key, howl);
  }
  if (!howl.playing()) howl.play();
}

export function syncBed(on: { tick: boolean; wind: boolean }): void {
  if (!isAudioUnlocked()) return;
  setBed('tick', on.tick, 0.12);
  setBed('wind', on.wind, 0.1);
}

/** Face-down footsteps. Background bed, no ducking. */
export function syncSteps(on: boolean): void {
  if (!isAudioUnlocked()) return;
  setBed('steps', on, 0.16);
}

export function stopBeds(): void {
  for (const howl of beds.values()) howl.stop();
}
