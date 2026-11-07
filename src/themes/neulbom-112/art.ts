/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/neulbom-112';

export const ROOM_SRC = {
  workshop: `${root}/rooms/workshop.svg`,
  dollhouse: `${root}/rooms/dollhouse.svg`,
  up: `${root}/rooms/dollhouse-up.svg`,
  attic: `${root}/rooms/dollhouse-attic.svg`,
  ending: `${root}/rooms/ending.svg`,
} as const;

export function roomArt(state: { open: boolean; up: boolean; attic: boolean; lights: boolean }): string {
  if (state.lights) return ROOM_SRC.ending;
  if (state.attic) return ROOM_SRC.attic;
  if (state.up) return ROOM_SRC.up;
  if (state.open) return ROOM_SRC.dollhouse;
  return ROOM_SRC.workshop;
}

/** Brick, clock, stairs, route map. Letter tiles share one blank. Dots are not color. */
export function magnetArt(id: string): string {
  if (id === 'wall') return `${root}/props/magnet-wall.svg`;
  if (id === 'clock') return `${root}/props/magnet-clock.svg`;
  if (id === 'stairs') return `${root}/props/magnet-stairs.svg`;
  if (id === 'line') return `${root}/props/magnet-route.svg`;
  return `${root}/props/magnet-tile.svg`;
}

/** Far coats are one mass. Near: fur collar, buttons, belt. */
export function coatArt(id: string, far: boolean): string {
  if (far) return `${root}/props/coat-mass.svg`;
  if (id === 'fur') return `${root}/props/coat-fur.svg`;
  if (id === 'navy') return `${root}/props/coat-navy.svg`;
  return `${root}/props/coat-beige.svg`;
}

export const MEMO_SRC: Record<string, string> = {
  talk: `${root}/props/memo-talk.svg`,
  walk: `${root}/props/memo-walk.svg`,
  sleep: `${root}/props/memo-sleep.svg`,
  school: `${root}/props/memo-school.svg`,
};

export const PHOTO_SRC: Record<string, string> = {
  '사진·돌': `${root}/props/photo-dol.svg`,
  '사진·입학': `${root}/props/photo-school.svg`,
  '사진·졸업': `${root}/props/photo-grad.svg`,
};

export function pieceArt(id: string): string {
  return `${root}/props/piece-${id}.svg`;
}

/** Rain loop. Howler lives in audio.ts. */
export const BED_SRC = {
  rain: `${root}/audio/rain.wav`,
} as const;

/** Mother's letters and the hidden letter. HTML5 only. */
export const CLUE_SRC = {
  mom: `${root}/audio/mom.wav`,
  ending: `${root}/audio/ending.wav`,
} as const;

export const SFX_SRC = {
  lock: `${root}/audio/lock.wav`,
  dial: `${root}/audio/dial.wav`,
  drawer: `${root}/audio/drawer.wav`,
  tick: `${root}/audio/tick.wav`,
  magnets: `${root}/audio/magnets.wav`,
  paper: `${root}/audio/paper.wav`,
  spark: `${root}/audio/spark.wav`,
  wood: `${root}/audio/wood.wav`,
} as const;
