/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/haemu-radio';

export const ROOM_SRC: Record<string, string> = {
  control: `${root}/rooms/control.svg`,
  booth: `${root}/rooms/booth.svg`,
  desk: `${root}/rooms/desk.svg`,
  archive: `${root}/rooms/archive.svg`,
  roof: `${root}/rooms/roof.svg`,
};

export const PROP_SRC = {
  board: `${root}/props/board.svg`,
  cart: `${root}/props/cart.svg`,
  coffee: `${root}/props/coffee.svg`,
  cuesheet: `${root}/props/cuesheet.svg`,
  dj: `${root}/props/dj.svg`,
  door: `${root}/props/door.svg`,
  envelope: `${root}/props/envelope.svg`,
  fader: `${root}/props/fader.svg`,
  'key-big': `${root}/props/key-big.svg`,
  'key-boat': `${root}/props/key-boat.svg`,
  'key-buoy': `${root}/props/key-buoy.svg`,
  'key-gull': `${root}/props/key-gull.svg`,
  'key-red': `${root}/props/key-red.svg`,
  keypad: `${root}/props/keypad.svg`,
  letter: `${root}/props/letter.svg`,
  radio: `${root}/props/radio.svg`,
  tape: `${root}/props/tape.svg`,
  tower: `${root}/props/tower.svg`,
  walkie: `${root}/props/walkie.svg`,
} as const;

export function propArt(id: string): string {
  const src = PROP_SRC[id as keyof typeof PROP_SRC];
  if (!src) throw new Error(`unknown prop: ${id}`);
  return src;
}

export const DJ_SRC = PROP_SRC.dj;

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
