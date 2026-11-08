/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/haemu-radio';

export const ROOM_SRC: Record<string, string> = {
  control: `${root}/rooms/control.svg`,
  booth: `${root}/rooms/booth.svg`,
  desk: `${root}/rooms/desk.svg`,
  archive: `${root}/rooms/archive.svg`,
  roof: `${root}/rooms/roof.svg`,
};

export const DJ_SRC = `${root}/props/dj.svg`;

export const BED_SRC: Record<string, string> = {
  opening: `${root}/audio/opening.wav`,
  'fog-stop': `${root}/audio/fog-stop.wav`,
  '3am-coffee': `${root}/audio/3am-coffee.wav`,
  'far-sea': `${root}/audio/far-sea.wav`,
  wind: `${root}/audio/wind.wav`,
  breakwater: `${root}/audio/breakwater.wav`,
};

export const CLUE_SRC: Record<string, string> = {
  tease: `${root}/audio/tease.wav`,
  d100: `${root}/audio/d100.wav`,
  d50: `${root}/audio/d50.wav`,
  d30: `${root}/audio/d30.wav`,
  d7: `${root}/audio/d7.wav`,
};

export const SFX_SRC = {
  beep: `${root}/audio/sfx-beep.wav`,
  cart: `${root}/audio/sfx-cart.wav`,
  lock: `${root}/audio/sfx-lock.wav`,
  tape: `${root}/audio/sfx-tape.wav`,
} as const;
