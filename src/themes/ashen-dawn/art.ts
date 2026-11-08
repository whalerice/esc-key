/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/ashen-dawn';

export const ROOM_SRC = {
  gate: `${root}/rooms/gate.svg`,
  deskDark: `${root}/rooms/desk-dark.svg`,
  desk: `${root}/rooms/desk.svg`,
  radio: `${root}/rooms/radio.svg`,
  archive: `${root}/rooms/archive.svg`,
  office: `${root}/rooms/office.svg`,
  teletype: `${root}/rooms/teletype.svg`,
  ending: `${root}/rooms/ending.svg`,
  endingB: `${root}/rooms/ending-b.svg`,
} as const;

export function roomArt(state: {
  scene: string;
  dark: boolean;
  finaleA: boolean;
  finaleB: boolean;
}): string {
  if (state.finaleA) return ROOM_SRC.ending;
  if (state.finaleB) return ROOM_SRC.endingB;
  if (state.scene === 'radio') return ROOM_SRC.radio;
  if (state.scene === 'archive') return ROOM_SRC.archive;
  if (state.scene === 'office') return ROOM_SRC.office;
  if (state.scene === 'teletype') return ROOM_SRC.teletype;
  if (state.dark) return ROOM_SRC.deskDark;
  return ROOM_SRC.desk;
}

export const PROP_SRC = {
  sticky: `${root}/props/sticky.svg`,
  clock: `${root}/props/clock.svg`,
  wallclock: `${root}/props/wallclock.svg`,
  drawer: `${root}/props/drawer.svg`,
  photo: `${root}/props/photo.svg`,
  phonebook: `${root}/props/phonebook.svg`,
  film: `${root}/props/film.svg`,
  matchbox: `${root}/props/matchbox.svg`,
  cipher: `${root}/props/cipher.svg`,
  rook: `${root}/props/rook.svg`,
  phone: `${root}/props/phone.svg`,
  radio: `${root}/props/radio.svg`,
  scarf: `${root}/props/scarf.svg`,
  mug: `${root}/props/mug.svg`,
  microfilm: `${root}/props/microfilm.svg`,
  key: `${root}/props/key.svg`,
  safe: `${root}/props/safe.svg`,
  musicbox: `${root}/props/musicbox.svg`,
  headphones: `${root}/props/headphones.svg`,
  border: `${root}/props/border.svg`,
  file: `${root}/props/file.svg`,
  teletype: `${root}/props/teletype.svg`,
} as const;

export function propArt(name: keyof typeof PROP_SRC): string {
  return PROP_SRC[name];
}

/** Underground hum. Howler loop lives in audio.ts. */
export const BED_SRC = {
  room: `${root}/audio/room.wav`,
} as const;

/** Clues, broadcasts, dialogue. HTML5 only. */
export const CLUE_SRC = {
  station: `${root}/audio/station.wav`,
  hum: `${root}/audio/hum.wav`,
  box: `${root}/audio/box.wav`,
  danke: `${root}/audio/danke.wav`,
  lenz: `${root}/audio/lenz.wav`,
  greta: `${root}/audio/greta.wav`,
  josef: `${root}/audio/josef.wav`,
  chief: `${root}/audio/chief.wav`,
  hans: `${root}/audio/hans.wav`,
  otto: `${root}/audio/otto.wav`,
  breath: `${root}/audio/breath.wav`,
} as const;

export const SFX_SRC = {
  lock: `${root}/audio/lock.wav`,
  thump: `${root}/audio/thump.wav`,
  dial: `${root}/audio/dial.wav`,
  paper: `${root}/audio/paper.wav`,
  drawer: `${root}/audio/drawer.wav`,
  chess: `${root}/audio/chess.wav`,
  key: `${root}/audio/key.wav`,
  teletype: `${root}/audio/teletype.wav`,
  chime: `${root}/audio/chime.wav`,
  tube: `${root}/audio/tube.wav`,
  train: `${root}/audio/train.wav`,
  busy: `${root}/audio/busy.wav`,
} as const;
