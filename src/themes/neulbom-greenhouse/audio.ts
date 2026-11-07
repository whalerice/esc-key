/**
 * Placeholder playback.
 * Howler stays in this file: tools/neulbom-greenhouse-check.mts rejects the word howler in Flow.tsx.
 * Clue voices use HTML5. Breath noise stays on BreathDetector.
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

export function syncBed(on: { wind: boolean; boiler: boolean; heater: boolean }): void {
  if (!isAudioUnlocked()) return;
  (Object.keys(BED_SRC) as (keyof typeof BED_SRC)[]).forEach((key) => {
    const want = on[key];
    let howl = beds.get(key);
    if (!want) {
      howl?.stop();
      return;
    }
    if (!howl) {
      howl = new Howl({
        src: [BED_SRC[key]],
        loop: true,
        volume: key === 'wind' ? 0.14 : 0.12,
      });
      beds.set(key, howl);
    }
    if (!howl.playing()) howl.play();
  });
}

export function stopBeds(): void {
  for (const howl of beds.values()) howl.stop();
}
