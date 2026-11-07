/** Scene art and placeholder audio. Paths are public URLs. */

const root = '/themes/neulbom-lasttrain';

export const ROOM_SRC: Record<string, string> = {
  counter: `${root}/rooms/counter.svg`,
  'counter-2009': `${root}/rooms/counter-2009.svg`,
  warehouse: `${root}/rooms/warehouse.svg`,
  'warehouse-2009': `${root}/rooms/warehouse-2009.svg`,
  'ending-a': `${root}/rooms/ending-a.svg`,
};

export function roomArt(scene: string, endingA: boolean): string {
  if (endingA) return ROOM_SRC['ending-a'];
  if (scene === 'warehouse') return ROOM_SRC.warehouse;
  return ROOM_SRC.counter;
}

/** Tape shape plus a crushed corner. Color is not the only difference. */
export function boxArt(box: { tape: string; dent: boolean }): string {
  if (box.tape === 'X' && box.dent) return `${root}/props/box-x-dent.svg`;
  if (box.tape === 'plus') return `${root}/props/box-plus.svg`;
  if (box.tape === 'line') return `${root}/props/box-line.svg`;
  if (box.tape === 'brown' && box.dent) return `${root}/props/box-brown-dent.svg`;
  if (box.tape === 'brown') return `${root}/props/box-brown.svg`;
  if (box.dent) return `${root}/props/box-dent.svg`;
  return `${root}/props/box-plain.svg`;
}

/** Fluorescent hum and distant rail. Howler loops live in audio.ts. */
export const BED_SRC = {
  fluorescent: `${root}/audio/fluorescent.wav`,
  rail: `${root}/audio/rail.wav`,
} as const;

/** Spoken stand-ins. HTML5 only. Subtitles stay in the script. */
export const CLUE_SRC = {
  out: `${root}/audio/out.wav`,
  kwak: `${root}/audio/kwak.wav`,
  ending: `${root}/audio/ending.wav`,
} as const;

export const SFX_SRC = {
  boot: `${root}/audio/boot.wav`,
  shutter: `${root}/audio/shutter.wav`,
  sms: `${root}/audio/sms.wav`,
  hangup: `${root}/audio/hangup.wav`,
  poweroff: `${root}/audio/poweroff.wav`,
  station: `${root}/audio/station.wav`,
  announce: `${root}/audio/announce.wav`,
} as const;
