/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/haemu-lighthouse';

export const ROOM_SRC: Record<string, string> = {
  f1: `${root}/rooms/f1.svg`,
  panel: `${root}/rooms/panel.svg`,
  f2: `${root}/rooms/f2.svg`,
  f3: `${root}/rooms/f3.svg`,
  f4: `${root}/rooms/f4.svg`,
  f5: `${root}/rooms/f5.svg`,
  f6: `${root}/rooms/f6.svg`,
  f6main: `${root}/rooms/f6-main.svg`,
  rail: `${root}/rooms/rail.svg`,
};

export const BED_SRC: Record<string, string> = {
  opening: `${root}/audio/opening.wav`,
  'fog-stop': `${root}/audio/fog-stop.wav`,
  '3am-coffee': `${root}/audio/3am-coffee.wav`,
  'far-sea': `${root}/audio/far-sea.wav`,
  wind: `${root}/audio/wind.wav`,
  breakwater: `${root}/audio/breakwater.wav`,
  'last-corner': `${root}/audio/last-corner.wav`,
  signal: `${root}/audio/signal.wav`,
};

/** Spoken stand-ins. HTML5 only — not the radio bed. */
export const CLUE_SRC = {
  captain: `${root}/audio/captain.wav`,
  tube: `${root}/audio/tube.wav`,
  doyun: `${root}/audio/doyun.wav`,
} as const;

export const SFX_SRC = {
  door: `${root}/audio/sfx-door.wav`,
  lever: `${root}/audio/sfx-lever.wav`,
  lamp: `${root}/audio/sfx-lamp.wav`,
  page: `${root}/audio/sfx-page.wav`,
  wedge: `${root}/audio/sfx-wedge.wav`,
  machine: `${root}/audio/sfx-machine.wav`,
  horn: `${root}/audio/sfx-horn.wav`,
} as const;
