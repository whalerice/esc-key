/**
 * Placeholder playback.
 * Howler stays in this file: tools/neulbom-112-check.mts rejects the word howler in Flow.tsx.
 * Clue voices use HTML5. Rain is a loop file, not a Web Audio noise node.
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

/** Window lights quiet the same rain. */
export function syncBed(on: { hush: boolean }): void {
  if (!isAudioUnlocked()) return;
  const key = 'rain' as const;
  let howl = beds.get(key);
  if (!howl) {
    howl = new Howl({ src: [BED_SRC.rain], loop: true, volume: 0.12 });
    beds.set(key, howl);
  }
  howl.volume(on.hush ? 0.04 : 0.12);
  if (!howl.playing()) howl.play();
}

export function stopBeds(): void {
  for (const howl of beds.values()) howl.stop();
}
