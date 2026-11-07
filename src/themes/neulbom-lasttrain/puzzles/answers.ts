/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/늘봄/07_막차이후_설계_v1.md §5–§7.
 */

import { replayCheonjiin } from '@/engine/widgets/cheonjiin';

export const DURATION_MS = 30 * 60_000;
export const BOX_PENALTY_MS = 20_000;
export const REPLY_PENALTY_MS = 60_000;
export const STICKER_ZOOM_MAX = 4;
export const PIN = '1225';
export const FOLDER = '2247';
export const DRAFT_HANGUL = '선물눈사람';
export const DRAFT_DIGITS = '8215003255 5325812551200';
export const REPLY_FULL = '812100125502214';
export const REPLY_SHORT = '8121001255';
export const EUNGOK_DIGITS = '0354234';

export const PORT = { id: 'port', x: 200, y: 72, r: 52 };
export const CHARGERS = [
  { id: 'A', x: 48, y: 180, name: 'A 타원' },
  { id: 'B', x: 160, y: 180, name: 'B 20핀' },
  { id: 'C', x: 272, y: 180, name: 'C 금속' },
] as const;

export const RECEIPT = [
  { id: 'left', x: 70, y: 48, r: 40 },
  { id: 'right', x: 170, y: 48, r: 40 },
] as const;

export const FINDER_PAD = { w: 560, h: 320 };

export function boxFrame(row: number, col: number): { x: number; y: number; w: number; h: number } {
  return { x: 8 + (col - 1) * 90, y: 8 + (row - 1) * 76, w: 82, h: 64 };
}

export const SPOTS = {
  ledger: { id: 'ledger', x: 250, y: 170, w: 180, h: 80 },
  timetable: { id: 'timetable', x: 360, y: 16, w: 170, h: 64 },
  glass: { id: 'glass', x: 16, y: 16, w: 120, h: 80 },
  shelf: { id: 'shelf', ...boxFrame(3, 2) },
} as const;

export type SpotId = keyof typeof SPOTS;

export function spotCenter(id: SpotId): { x: number; y: number } {
  const spot = SPOTS[id];
  return { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 };
}

export type BoxTape = 'none' | 'X' | 'plus' | 'line' | 'brown';

export type ShelfBox = {
  id: string;
  row: number;
  col: number;
  tape: BoxTape;
  dent: boolean;
};

/** 4×6. The matching box is the bottom row, left end. */
export function warehouseBoxes(): ShelfBox[] {
  const boxes: ShelfBox[] = [];
  for (let row = 1; row <= 4; row += 1) {
    for (let col = 1; col <= 6; col += 1) {
      boxes.push({ id: `r${row}c${col}`, row, col, tape: 'none', dent: false });
    }
  }
  const at = (id: string) => {
    const box = boxes.find((item) => item.id === id);
    if (!box) throw new Error(id);
    return box;
  };
  at('r4c1').tape = 'X';
  at('r4c1').dent = true;
  at('r2c4').tape = 'plus';
  at('r1c6').tape = 'line';
  at('r3c5').tape = 'brown';
  at('r3c5').dent = true;
  at('r3c2').tape = 'brown';
  at('r2c1').dent = true;
  return boxes;
}

export const ANSWER_BOX = 'r4c1';
export const OLD_SLOT = 'r3c2';

export type LedgerLine = { id: string; text: string; answer: boolean };

export const LEDGER: LedgerLine[] = [
  { id: 'flowers', text: '꽃다발 3칸 → 폐기', answer: false },
  { id: 'umbrella', text: '우산 (검정 장우산) 7칸 → 상자 19', answer: false },
  { id: 'scarf', text: '목도리 (회색) 9칸 → 상자 20', answer: false },
  { id: 'bear', text: '곰인형 12칸 → 상자 21', answer: false },
  { id: 'hat', text: '털모자 (눈사람 무늬) 15칸 → 상자 22', answer: false },
  { id: 'bag', text: '쇼핑백 (눈꽃문구 · 선물 포장) 7칸 → 상자 24', answer: true },
  { id: 'film', text: '필름 카메라 (명화사진관 수리 스티커) 3칸 → 주인 찾아감', answer: false },
  { id: 'cake', text: '케이크 상자 5칸 → 폐기', answer: false },
  { id: 'phone', text: '휴대폰 — 미습득', answer: false },
];

export const TIMETABLE =
  '시청 23:02 · 송현 23:24 · 반곡 23:29 · 은곡 23:33 · 도래 23:37 · 새말 23:40';

export const MESSAGES = [
  { id: 'm1', time: '23:22', text: '지훈아 어디야', read: true },
  { id: 'm2', time: '23:31', text: '엄마도 아까 말이 심했대. 들어와', read: false },
  { id: 'm3', time: '23:40', text: '막차 탔으면 새말역에서 기다릴게. 12시 넘어도.', read: false },
] as const;

export const SISTER_2026 =
  '지훈아. 올해도 새말역이야. 그날 너 어디 가던 길이었는지, 그것만 알려 줘. 우리 방식으로.';

export const CALLS = [
  { time: '21:50', who: '집', kind: '부재중' },
  { time: '23:24', who: '누나', kind: '부재중' },
  { time: '23:36', who: '누나', kind: '부재중' },
] as const;

export const ALARM = '23:33 다 와 감 · 일어나 (울림 1회)';

export const PHOTOS = [
  { id: 'p1', text: '문구점 진열대. 스노글로브.' },
  { id: 'p2', text: '영수증을 든 손. 브이.' },
  { id: 'p3', text: '포장 완료 23:12. 열차 좌석.' },
  { id: 'p4', text: '23:28 창문 셀카. 남색 교복 코트. 스노글로브. 역 불빛.' },
] as const;

export function judgeCharger(id: string | null): boolean {
  return id === 'B';
}

export function judgePin(text: string): boolean {
  return text.trim() === PIN;
}

export function judgeDraft(text: string): boolean {
  return text.replace(/\s/g, '') === DRAFT_HANGUL;
}

export function judgeLedger(id: string): boolean {
  return LEDGER.find((line) => line.id === id)?.answer === true;
}

export type BoxMiss = 'plus' | 'line' | 'dent' | 'other';

export function judgeBox(id: string): 'ok' | BoxMiss {
  const box = warehouseBoxes().find((item) => item.id === id);
  if (!box) return 'other';
  if (box.id === ANSWER_BOX) return 'ok';
  if (box.tape === 'plus') return 'plus';
  if (box.tape === 'line') return 'line';
  if (box.dent && box.tape !== 'X') return 'dent';
  return 'other';
}

export function judgeFolder(text: string): boolean {
  return text.trim() === FOLDER;
}

export type StationHit = 'ok' | 'saemal' | 'dorae' | 'asleep' | 'none';

export function judgeStation(text: string): StationHit {
  const name = text.replace(/\s/g, '').replace(/역$/, '');
  if (name === '은곡') return 'ok';
  if (name === '새말') return 'saemal';
  if (name === '도래') return 'dorae';
  if (name === '시청' || name === '송현' || name === '반곡') return 'asleep';
  return 'none';
}

export type ReplyHit = 'ok' | 'ourWay' | 'eungok' | 'wrong';

export function judgeReply(script: 'digit' | 'hangul', text: string): ReplyHit {
  const compact = text.replace(/\s/g, '');
  if (script === 'digit') {
    if (compact === REPLY_FULL || compact === REPLY_SHORT) return 'ok';
    const spoken = replayCheonjiin(compact);
    if (spoken === '은곡' || spoken === '은곡역') return 'eungok';
    return 'wrong';
  }
  if (compact === '은곡' || compact === '은곡역') return 'eungok';
  if (compact === '새말역' || compact === '새말') return 'ourWay';
  return 'wrong';
}

export function tapeLabel(box: ShelfBox): string {
  const tape =
    box.tape === 'X'
      ? '파란 X'
      : box.tape === 'plus'
        ? '파란 十'
        : box.tape === 'line'
          ? '파란 한 줄'
          : box.tape === 'brown'
            ? '갈색 테이프'
            : '테이프 없음';
  return `${tape}${box.dent ? ' · 찌그러짐' : ''}`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function lasttrainResultLines(input: {
  endingId: string;
  title: string;
  elapsedMs: number;
  remainingMs: number;
  battery: string;
  hints: number;
}): string[] {
  const blurb =
    input.endingId === 'A'
      ? '열일곱 해 늦은 선물이, 생일에 도착했다.'
      : '상자 24는 한 해 더 기다린다.';
  return [
    input.title,
    blurb,
    `걸린 시간 ${formatClock(input.elapsedMs)}`,
    `남은 배터리 ${input.battery}`,
    `곽 반장이 내선을 ${input.hints}번 받았다`,
  ];
}

export function assertLasttrainAnswers(): void {
  if (!judgeCharger('B') || judgeCharger('A')) throw new Error('charger');
  if (!judgePin(PIN) || judgePin('0000')) throw new Error('pin');
  if (!judgeDraft('선물 눈사람') || !judgeDraft('선물눈사람')) throw new Error('draft');
  if (!judgeLedger('bag') || judgeLedger('film') || judgeLedger('hat')) throw new Error('ledger');
  if (judgeBox(ANSWER_BOX) !== 'ok' || judgeBox('r2c4') !== 'plus') throw new Error('box');
  if (judgeBox('r1c6') !== 'line' || judgeBox('r3c5') !== 'dent') throw new Error('box miss');
  if (!judgeFolder(FOLDER)) throw new Error('folder');
  if (judgeStation('은곡') !== 'ok' || judgeStation('은곡역') !== 'ok') throw new Error('station');
  if (judgeStation('새말') !== 'saemal' || judgeStation('도래') !== 'dorae') throw new Error('station miss');
  if (judgeStation('반곡') !== 'asleep' || judgeStation('서울') !== 'none') throw new Error('station other');
  if (judgeReply('digit', REPLY_FULL) !== 'ok' || judgeReply('digit', REPLY_SHORT) !== 'ok') {
    throw new Error('reply');
  }
  if (judgeReply('hangul', '새말역') !== 'ourWay' || judgeReply('hangul', '새말') !== 'ourWay') {
    throw new Error('our way');
  }
  if (judgeReply('digit', EUNGOK_DIGITS) !== 'eungok' || judgeReply('hangul', '은곡') !== 'eungok') {
    throw new Error('eungok');
  }
  if (judgeReply('digit', '111') !== 'wrong') throw new Error('wrong reply');
}
