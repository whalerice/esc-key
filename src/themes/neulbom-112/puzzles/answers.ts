/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/늘봄/03_미니어처_설계_v1.md §2.
 *
 * P5: photo 3 sits on the desk, and the second floor stays dark until P5.
 * The frame at ×6 shows all three years and hours so the dial can be set
 * before that photo is picked up. Noted on the PR.
 */
import { nearestSnap, type SnapTarget } from '@/engine/widgets/DragSnap';
import { DragSort } from '@/engine/widgets/DragSort';
import { allFound, markFound } from '@/engine/widgets/FindTap';
import { SequenceTap } from '@/engine/widgets/SequenceTap';

export const ZOOM = {
  p1: 2,
  p2: 3,
  p3: 4,
  p4: 5,
  p5: 6,
  p7: 6,
  tooth: 8,
  p6: 9,
  crayon: 10,
  p8: 12,
} as const;

export const ZOOM_STEPS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12] as const;

export function stepZoom(zoom: number, dir: 1 | -1): number {
  const at = ZOOM_STEPS.findIndex((n) => n >= zoom);
  const index = at < 0 ? ZOOM_STEPS.length - 1 : ZOOM_STEPS[at] === zoom ? at : Math.max(0, at);
  const next = Math.min(ZOOM_STEPS.length - 1, Math.max(0, index + dir));
  return ZOOM_STEPS[next]!;
}

export const P1_ANSWER = [1, 1, 2, 4];

export const HEIGHTS = [
  { age: 6, cm: 108 },
  { age: 8, cm: 121 },
  { age: 10, cm: 133 },
  { age: 12, cm: 146 },
] as const;

export const P2_ANSWER = HEIGHTS.map((row) => row.cm % 10);

export const P3_ORDER = ['talk', 'walk', 'sleep', 'school'] as const;

export const P3_LABEL: Record<(typeof P3_ORDER)[number], string> = {
  talk: '처음 엄마라고 한 날',
  walk: '처음 걸은 날',
  sleep: '처음 혼자 잔 날',
  school: '처음 학교 간 날',
};

export const P3_START = ['school', 'talk', 'sleep', 'walk'] as const;

export const MAGNETS = [
  { id: 'wall', label: '벽', dot: 3 },
  { id: 'clock', label: '시', dot: 2 },
  { id: 'stairs', label: '계', dot: 1 },
  { id: 'woo', label: '우', dot: 0 },
  { id: 'ri', label: '리', dot: 0 },
  { id: 'bap', label: '밥', dot: 0 },
  { id: 'jip', label: '집', dot: 0 },
  { id: 'sa', label: '사', dot: 0 },
  { id: 'rang', label: '랑', dot: 0 },
  { id: 'line', label: '새말선', dot: 0, route: true },
] as const;

export const P4_ORDER = ['wall', 'clock', 'stairs'] as const;

export const PHOTOS = [
  { id: '사진·돌', year: 1991, hour: 4, note: '돌' },
  { id: '사진·입학', year: 1997, hour: 9, note: '입학' },
  { id: '사진·졸업', year: 2006, hour: 7, note: '졸업' },
] as const;

export const P5_ANSWER = [...PHOTOS].sort((a, b) => a.year - b.year).map((photo) => photo.hour);

export const P8_SLOTS = [
  ['우', '엄', '하', '내', '작'],
  ['리', '마', '늘', '집', '은'],
  ['집', '방', '꿈', '네', '다'],
];

export const P8_ANSWER = '우리집';

export const FUR_COAT = 'fur';

export const COATS = [
  { id: 'fur', label: '털 칼라' },
  { id: 'navy', label: '남색' },
  { id: 'beige', label: '베이지' },
] as const;

export const DOOR_FRAME: SnapTarget = { id: 'frame', x: 100, y: 60, r: 40 };
export const TAPE_PAD = { w: 200, h: 120 };

export const PIECES = [
  { id: 'order', label: '주문서 사본', zoom: 3, after: 'start', text: '내 이름. 엄마 글씨로 먼저 적혀 있었다.' },
  { id: 'brush', label: '몽당 붓', zoom: 3, after: 'start', text: '이 집을 만드느라 닳은 붓. 작가님도 오래 걸리셨구나.' },
  { id: 'shoe', label: '아기 신발', zoom: 4, after: 'P1', text: '엄지손가락만 한 신발. 이게 맞았던 때가 있었다.' },
  { id: 'spoon', label: '이유식 숟가락', zoom: 5, after: 'P1', text: '손잡이에 잇자국이 있다. 아마 내 거다.' },
  { id: 'block', label: '장난감 블록', zoom: 6, after: 'P1', text: '소파 틈에서 사라졌던 빨간 블록. 여기 있었구나.' },
  { id: 'tooth', label: '젖니 통', zoom: 8, after: 'P5', text: '이걸 모아 두는 사람이 진짜 있었다.' },
  { id: 'cloth', label: '어머니 손수건', zoom: 6, after: 'P5', text: '아직 엄마 냄새가 날 것 같다.' },
  { id: 'crayon', label: '빨간 크레파스', zoom: 10, after: 'P7', text: '그림 속 지붕 색. 거의 다 닳아 있다.' },
] as const;

export type PieceId = (typeof PIECES)[number]['id'];

const PUZZLE_ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'] as const;

export function nextPuzzle(solved: Readonly<Record<string, boolean | undefined>>): (typeof PUZZLE_ORDER)[number] | null {
  return PUZZLE_ORDER.find((id) => !solved[id]) ?? null;
}

export function isP1Correct(values: readonly number[]): boolean {
  return values.length === P1_ANSWER.length && values.every((v, i) => v === P1_ANSWER[i]);
}

export function isP2Correct(values: readonly number[]): boolean {
  return values.length === P2_ANSWER.length && values.every((v, i) => v === P2_ANSWER[i]);
}

export function isP5Correct(values: readonly number[]): boolean {
  return values.length === P5_ANSWER.length && values.every((v, i) => v === P5_ANSWER[i]);
}

export function isP8Correct(value: string): boolean {
  return value === P8_ANSWER;
}

export function judgeP3(order: readonly string[]): boolean {
  const sort = new DragSort([...order]);
  return sort.order.length === P3_ORDER.length && sort.order.every((id, i) => id === P3_ORDER[i]);
}

export function judgeP4(taps: readonly string[]): 'ok' | 'reset' | 'short' {
  for (let i = 0; i < taps.length; i++) {
    if (taps[i] !== P4_ORDER[i]) return 'reset';
  }
  if (taps.length < P4_ORDER.length) return 'short';
  return new SequenceTap([...P4_ORDER]).check([...taps]) ? 'ok' : 'reset';
}

export function judgeTape(x: number, y: number, zoom: number): 'ok' | 'far' | 'miss' {
  if (!nearestSnap(x, y, [DOOR_FRAME])) return 'miss';
  return zoom >= ZOOM.p2 ? 'ok' : 'far';
}

export function judgeCoat(id: string): 'ok' | 'no' {
  return id === FUR_COAT ? 'ok' : 'no';
}

export function judgeZoom(zoom: number, need: number): 'ok' | 'far' {
  return zoom >= need ? 'ok' : 'far';
}

export function pieceOpen(
  after: (typeof PIECES)[number]['after'],
  solved: Readonly<Record<string, boolean | undefined>>,
): boolean {
  if (after === 'start') return true;
  if (after === 'P1') return !!solved.P1;
  if (after === 'P5') return !!solved.P5;
  return !!solved.P7;
}

export function collectPiece(have: readonly string[], id: string): string[] {
  const found = markFound(
    PIECES.map((piece) => ({ id: piece.id, found: have.includes(piece.id) })),
    id,
  );
  return found.filter((piece) => piece.found).map((piece) => piece.id);
}

export function piecesComplete(have: readonly string[]): boolean {
  return allFound(PIECES.map((piece) => ({ id: piece.id, found: have.includes(piece.id) })));
}

export function frameLines(): string[] {
  return [...PHOTOS]
    .sort((a, b) => a.year - b.year)
    .map((photo) => `${photo.year} ${photo.note} · ${photo.hour}시`);
}

function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function resultLines(input: { elapsedMs: number; hints: number; pieces: number }): string[] {
  return [
    `걸린 시간 ${mmss(input.elapsedMs)}`,
    `작가의 메모장 ${input.hints}번`,
    `기억 조각 ${input.pieces}/8`,
    '1/12 — CLEAR',
    '다녀왔어요.',
  ];
}

export function assert112Answers(): void {
  if (!isP1Correct(P1_ANSWER) || isP1Correct([1, 1, 2, 5])) throw new Error('p1');
  if (!isP2Correct(P2_ANSWER) || P2_ANSWER.join('') !== '8136') throw new Error('p2');
  if (!judgeP3([...P3_ORDER]) || judgeP3([...P3_START])) throw new Error('p3');
  if (judgeP4([...P4_ORDER]) !== 'ok' || judgeP4(['woo']) !== 'reset' || judgeP4(['wall']) !== 'short') {
    throw new Error('p4');
  }
  if (!isP5Correct(P5_ANSWER) || P5_ANSWER.join('') !== '497') throw new Error('p5');
  if (judgeTape(DOOR_FRAME.x, DOOR_FRAME.y, 2) !== 'far') throw new Error('tape far');
  if (judgeTape(DOOR_FRAME.x, DOOR_FRAME.y, 3) !== 'ok') throw new Error('tape');
  if (judgeTape(0, 0, 3) !== 'miss') throw new Error('tape miss');
  if (judgeCoat('fur') !== 'ok' || judgeCoat('navy') !== 'no') throw new Error('coat');
  if (!isP8Correct(P8_ANSWER) || isP8Correct('엄마')) throw new Error('p8');
  if (stepZoom(1, 1) !== 2 || stepZoom(12, 1) !== 12 || stepZoom(12, -1) !== 10) throw new Error('zoom');
  if (judgeZoom(8, 9) !== 'far' || judgeZoom(9, 9) !== 'ok') throw new Error('bed');
  const pieces = collectPiece([], 'order');
  if (pieces.join() !== 'order' || piecesComplete(pieces)) throw new Error('piece');
  if (!piecesComplete(PIECES.map((piece) => piece.id))) throw new Error('pieces');
  if (nextPuzzle({}) !== 'P1' || nextPuzzle({ P1: true, P2: true }) !== 'P3' || nextPuzzle({ P1: true, P2: true, P3: true, P4: true, P5: true, P6: true, P7: true, P8: true }) !== null) {
    throw new Error('next');
  }
  if (frameLines()[0] !== '1991 돌 · 4시') throw new Error('frame');
}
