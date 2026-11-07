/**
 * Placeholder playback.
 * Howler stays in this file: tools/neulbom-lasttrain-check.mts rejects the word howler in Flow.tsx.
 * Clue voices use HTML5. No Web Audio noise node.
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
  howl.volume(volume);
  if (!howl.playing()) howl.play();
}

/** After the P6 turn, the same beds sit one step lower. */
export function syncBed(on: { fluorescent: boolean; rail: boolean; hush: boolean }): void {
  if (!isAudioUnlocked()) return;
  const hum = on.hush ? 0.05 : 0.12;
  const rail = on.hush ? 0.04 : 0.1;
  setBed('fluorescent', on.fluorescent, hum);
  setBed('rail', on.rail, rail);
}

export function stopBeds(): void {
  for (const howl of beds.values()) howl.stop();
}
