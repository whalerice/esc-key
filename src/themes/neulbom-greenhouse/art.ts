/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/neulbom-greenhouse';

export const ROOM_SRC: Record<string, string> = {
  foyer: `${root}/rooms/foyer.svg`,
  'foyer-night': `${root}/rooms/foyer-night.svg`,
  'foyer-bloom': `${root}/rooms/foyer-bloom.svg`,
  boiler: `${root}/rooms/boiler.svg`,
  hall: `${root}/rooms/hall.svg`,
  glass: `${root}/rooms/glass.svg`,
  nursery: `${root}/rooms/nursery.svg`,
  ward: `${root}/rooms/ward.svg`,
};

export function roomArt(
  scene: string,
  solved: { P7?: boolean; P8?: boolean },
  finale: boolean,
): string {
  if (finale) return ROOM_SRC.ward;
  if (scene === 'foyer' && solved.P8) return ROOM_SRC['foyer-bloom'];
  if (scene === 'foyer' && solved.P7) return ROOM_SRC['foyer-night'];
  return ROOM_SRC[scene] ?? ROOM_SRC.foyer;
}

/** Wind, boiler, heater. Howler loops live in audio.ts. */
export const BED_SRC = {
  wind: `${root}/audio/wind.wav`,
  boiler: `${root}/audio/boiler.wav`,
  heater: `${root}/audio/heater.wav`,
} as const;

/** Spoken stand-ins. HTML5 only. */
export const CLUE_SRC = {
  dad: `${root}/audio/dad.wav`,
  guard: `${root}/audio/guard.wav`,
  recall: `${root}/audio/recall.wav`,
  ending: `${root}/audio/ending.wav`,
} as const;

export const SFX_SRC = {
  'valve-fail': `${root}/audio/sfx-valve-fail.wav`,
  'heater-on': `${root}/audio/sfx-heater-on.wav`,
  lock: `${root}/audio/sfx-lock.wav`,
  page: `${root}/audio/sfx-page.wav`,
  bloom: `${root}/audio/sfx-bloom.wav`,
  crayons: `${root}/audio/sfx-crayons.wav`,
} as const;
