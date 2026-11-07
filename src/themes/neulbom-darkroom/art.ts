/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/neulbom-darkroom';

export const ROOM_SRC: Record<string, string> = {
  darkroom: `${root}/rooms/darkroom.svg`,
  'darkroom-safe': `${root}/rooms/darkroom-safe.svg`,
  shop: `${root}/rooms/shop.svg`,
  'shop-safe': `${root}/rooms/shop-safe.svg`,
  'ending-a': `${root}/rooms/ending-a.svg`,
};

export function roomArt(scene: string, safelight: boolean, endingA: boolean): string {
  if (endingA) return ROOM_SRC['ending-a'];
  if (scene === 'shop') return safelight ? ROOM_SRC['shop-safe'] : ROOM_SRC.shop;
  return safelight ? ROOM_SRC['darkroom-safe'] : ROOM_SRC.darkroom;
}

/** Timer, alley wind, face-down steps. Howler loops live in audio.ts. */
export const BED_SRC = {
  tick: `${root}/audio/tick.wav`,
  wind: `${root}/audio/wind.wav`,
  steps: `${root}/audio/steps.wav`,
} as const;

/** Spoken stand-ins. HTML5 only. */
export const CLUE_SRC = {
  phone: `${root}/audio/phone.wav`,
  ending: `${root}/audio/ending.wav`,
} as const;

export const SFX_SRC = {
  safelight: `${root}/audio/sfx-safelight.wav`,
  crank: `${root}/audio/sfx-crank.wav`,
  burn: `${root}/audio/sfx-burn.wav`,
  tangle: `${root}/audio/sfx-tangle.wav`,
  lock: `${root}/audio/sfx-lock.wav`,
  door: `${root}/audio/sfx-door.wav`,
  shutter: `${root}/audio/sfx-shutter.wav`,
  splash: `${root}/audio/sfx-splash.wav`,
  water: `${root}/audio/water.wav`,
  drag: `${root}/audio/sfx-drag.wav`,
  tick: `${root}/audio/sfx-tick.wav`,
} as const;
