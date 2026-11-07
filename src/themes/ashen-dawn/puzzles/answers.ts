/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/단편/잿빛새벽/잿빛새벽_설계_v1.md
 */

import { nearestSnap, type SnapTarget } from '@/engine/widgets/DragSnap';

export const ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'] as const;

export const CIPHER =
  'DRYTKGFNFZWKBLJVZNOVPAWVRZFWISOIJVJYWHYYJPIMPAYVIJMWKURFWYITTSWR';

export const STATION_MHZ = 7.11;
export const STATION_TOL = 0.02;
export const TRAP_MHZ = 11.7;
export const STATION_DIGITS = '4027116947';
export const PAD_DIGITS = '4729165038';
export const RECV_DIGITS = '4027116947';
export const CANCEL_CODE = '52086172';
export const CALLSIGN = 'VOGEL3';
export const OP_NAME = 'GLASHAUS';

const PHONE_GROUPS = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];

const MORSE: Record<string, string> = {
  '·': 'E',
  '—': 'T',
  '··': 'I',
  '·—': 'A',
  '—·': 'N',
  '——': 'M',
  '···': 'S',
  '··—': 'U',
  '·—·': 'R',
  '·——': 'W',
  '—··': 'D',
  '—·—': 'K',
  '——·': 'G',
  '———': 'O',
  '····': 'H',
  '···—': 'V',
  '··—·': 'F',
  '·—··': 'L',
  '·——·': 'P',
  '·———': 'J',
  '—···': 'B',
  '—··—': 'X',
  '—·—·': 'C',
  '—·——': 'Y',
  '——··': 'Z',
  '——·—': 'Q',
  '·————': '1',
  '··———': '2',
  '···——': '3',
  '····—': '4',
  '·····': '5',
  '—····': '6',
  '——···': '7',
  '———··': '8',
  '————·': '9',
  '—————': '0',
};

export const SCARF = 'K K K KKK / KKK KKK KKK / KKK KKK K / K / K KKK K K / K K K KKK KKK';

export const PIN_BASE = [1, 2, 3, 4, 5, 5, 5] as const;
export const PIN_HUM = [6, 2, 1, 4, 7, 5, 2] as const;
export const SOLFEGE = ['도', '레', '미', '파', '솔', '라', '시'] as const;

export const SAFE_STEPS = [
  { dir: 'R', n: 32 },
  { dir: 'L', n: 15 },
  { dir: 'R', n: 27 },
] as const;

/** Screen px. Design snap radius. */
export const FILM_TARGET: SnapTarget = { id: 'cross', x: 160, y: 96, r: 12 };

export function nextPuzzle(solved: Record<string, boolean>): (typeof ORDER)[number] | null {
  return ORDER.find((id) => !solved[id]) ?? null;
}

export function judgeDrawer(digits: readonly number[]): 'ok' | 'swap' | 'no' {
  const code = digits.join('');
  if (code === '926') return 'ok';
  if (code === '629') return 'swap';
  return 'no';
}

export function nameToDial(name: string): string {
  return [...name.toUpperCase()]
    .map((ch) => {
      const group = PHONE_GROUPS.findIndex((letters) => letters.includes(ch));
      return group < 0 ? '' : String(group + 2);
    })
    .join('');
}

export function judgeCall(digits: string): 'hans' | 'otto' | 'josef' | 'no' {
  if (digits === nameToDial('HANS')) return 'hans';
  if (digits === nameToDial('OTTO')) return 'otto';
  if (digits === nameToDial('JOSEF')) return 'josef';
  return 'no';
}

/** Rank 8 first. Eight letters each. */
export function chessRanks(): string[] {
  const rows: string[] = [];
  for (let rank = 0; rank < 8; rank += 1) rows.push(CIPHER.slice(rank * 8, rank * 8 + 8));
  return rows;
}

export function fFileLetters(): string {
  return chessRanks()
    .map((row) => row[5] ?? '')
    .join('');
}

/** Column 6 of each 7-wide row. The leftover 64th glyph is not in this column. */
export function punchedColumn(): string {
  let out = '';
  for (let i = 0; i + 5 < CIPHER.length; i += 7) out += CIPHER[i + 5] ?? '';
  return out;
}

export function judgeFreq(mhz: number): 'hit' | 'trap' | 'no' {
  if (Math.abs(mhz - STATION_MHZ) <= STATION_TOL + 1e-9) return 'hit';
  if (Math.abs(mhz - TRAP_MHZ) <= STATION_TOL + 1e-9) return 'trap';
  return 'no';
}

export function judgeStation(raw: string): boolean {
  return raw.replace(/\D/g, '') === STATION_DIGITS;
}

export function digitSub(recv: string, pad: string): string {
  let out = '';
  for (let i = 0; i < recv.length && i < pad.length; i += 1) {
    let n = Number(recv[i]) - Number(pad[i]);
    if (n < 0) n += 10;
    out += String(n);
  }
  return out;
}

export function pairsToWord(digits: string): { word: string; overflow: boolean } {
  let word = '';
  let overflow = false;
  for (let i = 0; i + 1 < digits.length; i += 2) {
    const n = Number(digits.slice(i, i + 2));
    if (n < 1 || n > 26) overflow = true;
    else word += String.fromCharCode(64 + n);
  }
  return { word, overflow };
}

export function judgePairs(digits: string): 'ok' | 'range' | 'no' {
  if (!/^\d{10}$/.test(digits)) return 'no';
  const { word, overflow } = pairsToWord(digits);
  if (overflow) return 'range';
  return word === 'CHESS' ? 'ok' : 'no';
}

export function judgeWord(word: string): boolean {
  return word.trim().toUpperCase() === 'CHESS';
}

export function judgeFilm(x: number, y: number, notchOk: boolean): 'ok' | 'notch' | 'miss' {
  if (!nearestSnap(x, y, [FILM_TARGET])) return 'miss';
  return notchOk ? 'ok' : 'notch';
}

export function scarfCodes(): string[] {
  return SCARF.split('/').map((group) =>
    group
      .trim()
      .split(/\s+/)
      .map((tok) => (tok.length >= 3 ? '—' : '·'))
      .join(''),
  );
}

export function decodeMorse(codes: readonly string[]): string {
  return codes.map((code) => MORSE[code] ?? '?').join('');
}

export function judgeCallsign(text: string): boolean {
  return text.toUpperCase() === CALLSIGN;
}

export type SafeDir = 'R' | 'L';

export function thump(stage: number, dir: SafeDir, tick: number): boolean {
  return stage === 2 && dir === 'R' && tick === 27;
}

/** Commit when the wheel stops. `open` is the third click. */
export function judgeSafeStop(stage: number, dir: SafeDir, tick: number): 'open' | 'advance' | 'reset' {
  const step = SAFE_STEPS[stage];
  if (!step) return 'reset';
  if (dir === step.dir && tick === step.n) return stage >= 2 ? 'open' : 'advance';
  return 'reset';
}

export function pinsMatch(pins: readonly number[]): boolean {
  return PIN_HUM.every((n, i) => pins[i] === n);
}

/** Numbers under pins that moved. Unmoved columns stay blank. */
export function pinNumbers(pins: readonly number[]): (number | null)[] {
  return pins.map((n, i) => (n === PIN_BASE[i] ? null : n));
}

export function solfege(n: number): string {
  return SOLFEGE[n - 1] ?? '';
}

function normLine(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function judgeSend(
  lines: readonly string[],
  channel: string | null,
): 'A' | 'B' | 'dead' | 'bad' | 'channel' {
  if (!channel) return 'channel';
  const ok =
    normLine(lines[0] ?? '') === 'GLASHAUS ABBRUCH' &&
    normLine(lines[1] ?? '') === CANCEL_CODE &&
    normLine(lines[2] ?? '') === CALLSIGN;
  if (!ok) return 'bad';
  if (channel === 'D') return 'A';
  if (channel === 'B') return 'B';
  if (channel === 'A' || channel === 'C') return 'dead';
  return 'bad';
}

export function stepZoom(zoom: number, dir: 1 | -1, min: number, max: number): number {
  return Math.min(max, Math.max(min, zoom + dir));
}

function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STAMP: Record<string, string> = {
  A: '새벽은 오지 않았다',
  B: '가로챈 새벽',
  C: '04:00',
};

const BLURB: Record<string, string> = {
  A: '숫자를 읽던 목소리가 고맙다고 했다.',
  B: '가장 친절했던 사람이 가장 먼저 받았다.',
  C: '판단은 보류되었다.',
};

export function resultLines(input: {
  endingId: string;
  elapsedMs: number;
  remainingMs: number;
  hints: number;
  epilogue: 'write' | 'blank' | null;
}): string[] {
  const lines = [
    `걸린 시간 ${mmss(input.elapsedMs)}`,
    `남은 시간 ${mmss(input.remainingMs)}`,
    `요제프에게 ${input.hints}번 전화했다`,
    STAMP[input.endingId] ?? input.endingId,
    BLURB[input.endingId] ?? '',
  ];
  if (input.endingId === 'A' && input.epilogue === 'write') {
    lines.push('보고서는 정확했다. 마티아스 렌츠는 다시 서베를린 땅을 밟지 못했다.');
  }
  if (input.endingId === 'A' && input.epilogue === 'blank') {
    lines.push('보고서에는 한 사람이 빠져 있었다.');
  }
  return lines;
}

export function assertAshDawn(): void {
  if (CIPHER.length !== 64) throw new Error('cipher');
  if (fFileLetters() !== OP_NAME) throw new Error('f-file');
  if (punchedColumn() !== 'GBVFVJVRS') throw new Error('punch');
  if (judgeDrawer([9, 2, 6]) !== 'ok' || judgeDrawer([6, 2, 9]) !== 'swap' || judgeDrawer([0, 0, 0]) !== 'no') {
    throw new Error('p1');
  }
  if (nameToDial('HANS') !== '4267' || nameToDial('OTTO') !== '6886' || nameToDial('JOSEF') !== '56733') {
    throw new Error('dial');
  }
  if (judgeCall('56733') !== 'josef' || judgeCall('000') !== 'no') throw new Error('call');
  if (judgeFreq(7.11) !== 'hit' || judgeFreq(7.13) !== 'hit' || judgeFreq(7.14) !== 'no') throw new Error('freq');
  if (judgeFreq(11.7) !== 'trap' || !judgeStation('40271 16947')) throw new Error('station');
  const sub = digitSub(RECV_DIGITS, PAD_DIGITS);
  if (sub !== '0308051919' || judgePairs(sub) !== 'ok' || judgePairs('9999999999') !== 'range') throw new Error('otp');
  if (!judgeWord('chess') || judgeFilm(FILM_TARGET.x, FILM_TARGET.y, true) !== 'ok') throw new Error('film');
  if (judgeFilm(FILM_TARGET.x, FILM_TARGET.y, false) !== 'notch') throw new Error('notch');
  if (judgeFilm(0, 0, true) !== 'miss') throw new Error('miss');
  if (decodeMorse(scarfCodes()) !== CALLSIGN) throw new Error('scarf');
  if (!judgeCallsign('vogel3')) throw new Error('callsign');
  if (judgeSafeStop(0, 'R', 32) !== 'advance' || judgeSafeStop(1, 'L', 15) !== 'advance') throw new Error('safe');
  if (judgeSafeStop(2, 'R', 27) !== 'open' || judgeSafeStop(0, 'R', 31) !== 'reset') throw new Error('safe2');
  if (!thump(2, 'R', 27) || thump(1, 'R', 27)) throw new Error('thump');
  if (!pinsMatch([...PIN_HUM]) || pinsMatch([...PIN_BASE])) throw new Error('pins');
  const shown = pinNumbers([...PIN_HUM]);
  if (shown.join(',') !== '6,,1,,7,,2') throw new Error('pin numbers');
  if (judgeSend(['GLASHAUS ABBRUCH', '52086172', 'VOGEL3'], 'D') !== 'A') throw new Error('send A');
  if (judgeSend(['GLASHAUS ABBRUCH', '52086172', 'VOGEL3'], 'B') !== 'B') throw new Error('send B');
  if (judgeSend(['GLASHAUS ABBRUCH', '52086172', 'VOGEL3'], 'A') !== 'dead') throw new Error('send dead');
  if (judgeSend(['NOPE', '0', 'X'], 'D') !== 'bad') throw new Error('send bad');
  if (judgeSend(['GLASHAUS ABBRUCH', '52086172', 'VOGEL3'], null) !== 'channel') throw new Error('send ch');
  if (stepZoom(1, -1, 1, 6) !== 1 || stepZoom(6, 1, 1, 6) !== 6) throw new Error('zoom');
  if (nextPuzzle({}) !== 'P1' || nextPuzzle({ P1: true }) !== 'P2') throw new Error('next');
}
