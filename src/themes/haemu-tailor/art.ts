/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/haemu-tailor';

export const ROOM_SRC: Record<string, string> = {
  shop: `${root}/rooms/shop.svg`,
  door: `${root}/rooms/door.svg`,
  ledger: `${root}/rooms/ledger.svg`,
  warehouse: `${root}/rooms/warehouse.svg`,
  shelf: `${root}/rooms/shelf.svg`,
  bench: `${root}/rooms/bench.svg`,
  'sewing-straight': `${root}/rooms/sew-straight.svg`,
  'sewing-curve': `${root}/rooms/sew-curve.svg`,
};

/** Shop cassette and ending music-box. Howler loops. Not a RadioBed. */
export const BED_SRC = {
  shop: `${root}/audio/shop.wav`,
  musicbox: `${root}/audio/musicbox.wav`,
} as const;

/** Spoken stand-ins. HTML5 only. */
export const CLUE_SRC = {
  pa: `${root}/audio/pa.wav`,
  mom: `${root}/audio/mom.wav`,
} as const;

export const SFX_SRC = {
  dial: `${root}/audio/sfx-dial.wav`,
  lock: `${root}/audio/sfx-lock.wav`,
  page: `${root}/audio/sfx-page.wav`,
  cloth: `${root}/audio/sfx-cloth.wav`,
  rip: `${root}/audio/sfx-rip.wav`,
  snip: `${root}/audio/sfx-snip.wav`,
  knot: `${root}/audio/sfx-knot.wav`,
  sew: `${root}/audio/sfx-sew.wav`,
  key: `${root}/audio/sfx-key.wav`,
  snap: `${root}/audio/sfx-snap.wav`,
  horn: `${root}/audio/sfx-horn.wav`,
} as const;
