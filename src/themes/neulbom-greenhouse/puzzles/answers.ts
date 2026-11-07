/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/늘봄/05_겨울온실_설계_v1.md §4–§6.
 */

export const HEATER_PAUSE_MS = 180_000;
export const BLOOM_STEP_MS = 5 * 60_000;
export const BLOOM_OPEN_MS = 6_000;
export const BREATH_HOLD_MS = 1_500;
export const DURATION_MS = 30 * 60_000;
export const MAT_NOTCHES = 8;
export const MAT_SCALE = 13;

export const P2_ORDER = ['blue', 'yellow', 'green', 'red'] as const;

/** Screen order is shuffled. Pressure is a display value, not a save. */
export const VALVES = [
  { id: 'green', pressure: 1.6, label: '초록' },
  { id: 'red', pressure: 2.1, label: '빨강' },
  { id: 'blue', pressure: 0.8, label: '파랑' },
  { id: 'yellow', pressure: 1.2, label: '노랑' },
] as const;

export const P3_CODE = 'HAYUNAE';
export const P4_CODE = '1214';

export const PLANTS = [
  { id: 'cyclamen', name: '시클라멘', clue: '하트 잎, 은색 잎맥', pot: '하트 잎', seed: false, syllable: '아' },
  { id: 'pansy', name: '팬지', clue: '둥근 잎끝', pot: '둥근 톱니 잎', seed: false, syllable: '빠' },
  { id: 'marigold', name: '금잔화', clue: '주걱 + 잔털', pot: '주걱 잎', seed: false, syllable: '봄' },
  { id: 'pink', name: '패랭이꽃', clue: '회녹색 풀잎', pot: '회녹색 풀잎', seed: false, syllable: '에' },
  { id: 'balsam', name: '봉선화', clue: '둥근 갈색 씨', pot: '씨앗 봉투', seed: true, syllable: '또' },
  { id: 'sunflower', name: '해바라기', clue: '줄무늬 씨', pot: '씨앗 봉투', seed: true, syllable: '올' },
  { id: 'cosmos', name: '코스모스', clue: '바늘 모양 씨', pot: '씨앗 봉투', seed: true, syllable: '게' },
] as const;

export type PlantId = (typeof PLANTS)[number]['id'];

export const MONTH: Record<PlantId, number> = {
  cyclamen: 1,
  pansy: 3,
  marigold: 4,
  pink: 5,
  balsam: 7,
  sunflower: 8,
  cosmos: 10,
};

export const CRAYON = ['아', '빠', '봄', '에', '또', '올', '게'] as const;

export const P7_ORDER = ['water', 'sides', 'coat', 'paper'] as const;

export const P7_LABEL: Record<(typeof P7_ORDER)[number], string> = {
  water: '물주머니 채우기',
  sides: '상자 양옆',
  coat: '외투로 싸기',
  paper: '신문 덮기',
};

export const BLOOM_NAME = ['봉오리', '부풂', '꽃잎', '반개', '만개'] as const;

export function judgePlug(outlet: string): 'ok' | 'dead' | 'no' {
  if (outlet === 'yellow') return 'ok';
  if (outlet === 'grey') return 'dead';
  return 'no';
}

export function judgeP1(mat: boolean, pot: boolean, outlet: string | null): 'ok' | 'dead' | 'wait' {
  if (!mat || !pot || !outlet) return 'wait';
  const plug = judgePlug(outlet);
  return plug === 'ok' ? 'ok' : plug === 'dead' ? 'dead' : 'wait';
}

export function judgeValves(order: readonly string[]): 'ok' | 'back' | 'short' {
  for (let i = 0; i < order.length; i++) {
    if (order[i] !== P2_ORDER[i]) return 'back';
  }
  return order.length === P2_ORDER.length ? 'ok' : 'short';
}

export function judgeSpecies(code: string): 'ok' | 'no' {
  return code.trim().toUpperCase() === P3_CODE ? 'ok' : 'no';
}

export function judgeDate(code: string): 'ok' | 'year' | 'height' | 'no' {
  if (code === P4_CODE) return 'ok';
  if (code === '1996') return 'year';
  if (code === '0112') return 'height';
  return 'no';
}

export function stickerNote(potId: string, stickerId: string): string | null {
  if (potId === stickerId) return null;
  if (potId === 'pink') return '뽑지 마라. 이것도 꽃이다.';
  if (potId === 'pansy' || stickerId === 'pansy') return '잎끝이 둥글지 않다.';
  return '노트 그림이랑 다르다.';
}

export function judgeStickers(placed: Readonly<Record<string, string>>): 'ok' | 'no' {
  return PLANTS.every((plant) => placed[plant.id] === plant.id) ? 'ok' : 'no';
}

export function judgeShelf(slots: Readonly<Record<number, string>>): 'ok' | 'no' {
  return PLANTS.every((plant) => slots[MONTH[plant.id]] === plant.id) ? 'ok' : 'no';
}

export function judgeWrap(order: readonly string[], waterFilled: boolean): 'ok' | 'dry' | 'no' {
  if (!waterFilled) return 'dry';
  if (order.length !== P7_ORDER.length) return 'no';
  return order.every((id, i) => id === P7_ORDER[i]) ? 'ok' : 'no';
}

export function judgeMat(notches: number): 'ok' | 'hot' | 'cold' {
  if (notches === MAT_NOTCHES) return 'ok';
  if (notches > MAT_NOTCHES) return 'hot';
  return 'cold';
}

export function judgeP8(gap: boolean, notches: number, lightOff: boolean): 'ok' | 'no' {
  return gap && judgeMat(notches) === 'ok' && lightOff ? 'ok' : 'no';
}

/** Strokes skip OCR. A drawn line stands in for a name. Typed text is 1–8 chars. */
export function judgeFinale(text: string, strokeCount: number): 'ok' | 'empty' | 'long' {
  const trimmed = text.trim();
  if (strokeCount > 0 && trimmed.length === 0) return 'ok';
  if ([...trimmed].length > 8) return 'long';
  if ([...trimmed].length === 0) return 'empty';
  return 'ok';
}

/** Half-open bud until P8. Full bloom is the solve, not the clock. */
export function bloomStage(gameMs: number, full: boolean): number {
  if (full) return 4;
  if (gameMs <= 0) return 0;
  return Math.min(3, Math.floor(gameMs / BLOOM_STEP_MS));
}

export function potSlots(): { id: string; x: number; y: number; r: number }[] {
  return PLANTS.map((plant, index) => ({
    id: plant.id,
    x: 80,
    y: 48 + index * 56,
    r: 36,
  }));
}

export function monthSlots(): { id: string; x: number; y: number; r: number }[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: String(index + 1),
    x: 70 + (index % 6) * 72,
    y: 40 + Math.floor(index / 6) * 72,
    r: 34,
  }));
}

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function greenhouseResultLines(input: {
  endingId: string;
  title: string;
  elapsedMs: number;
  remainingMs: number;
  tempLabel: string;
  hints: number;
  nameTag: string;
  drew: boolean;
  beforeReveal: boolean;
}): string[] {
  const head = [
    `걸린 시간 ${mmss(input.elapsedMs)}`,
    `남은 온도 ${input.tempLabel}`,
    `남 씨를 ${input.hints}번 불렀다`,
    input.title,
  ];
  if (input.endingId === 'A') {
    const name = input.nameTag.trim() || (input.drew ? '손글씨' : '');
    return [
      ...head,
      `이름표 아 · 빠 · 봄 · 에 · 또 · 올 · 게 · ${name}`,
      '하룻밤 꽃이 지기 전에, 편지는 답장을 받았다.',
      '……봄이네.',
      '2027. 4. 금잔화 피었다. 왔다.',
    ];
  }
  return [
    ...head,
    input.beforeReveal ? '…내 상자?' : '네 상자. 내 상자.',
    '씨는… 안 얼어.',
    '2027. 3. 셋 심었다. 왔다.',
    '늦은 답장도 답장이다.',
  ];
}

export function assertGreenhouseAnswers(): void {
  if (judgeP1(true, true, 'yellow') !== 'ok') throw new Error('p1');
  if (judgeP1(true, true, 'grey') !== 'dead') throw new Error('p1 grey');
  if (judgeValves([...P2_ORDER]) !== 'ok') throw new Error('p2');
  if (judgeValves(['green']) !== 'back') throw new Error('p2 back');
  if (judgeSpecies('hayunae') !== 'ok') throw new Error('p3');
  if (judgeDate('1214') !== 'ok' || judgeDate('1996') !== 'year' || judgeDate('0112') !== 'height') {
    throw new Error('p4');
  }
  const placed = Object.fromEntries(PLANTS.map((plant) => [plant.id, plant.id]));
  if (judgeStickers(placed) !== 'ok') throw new Error('p5');
  if (stickerNote('pink', 'pansy') == null) throw new Error('p5 note');
  const shelf = Object.fromEntries(PLANTS.map((plant) => [MONTH[plant.id], plant.id]));
  if (judgeShelf(shelf) !== 'ok') throw new Error('p6');
  if (judgeWrap([...P7_ORDER], true) !== 'ok') throw new Error('p7');
  if (judgeWrap([...P7_ORDER], false) !== 'dry') throw new Error('p7 dry');
  if (judgeMat(8) !== 'ok' || judgeMat(9) !== 'hot') throw new Error('mat');
  if (judgeP8(true, 8, true) !== 'ok' || judgeP8(true, 8, false) !== 'no') throw new Error('p8');
  if (judgeFinale('', 0) !== 'empty' || judgeFinale('봄', 0) !== 'ok' || judgeFinale('', 1) !== 'ok') {
    throw new Error('finale');
  }
  if (judgeFinale('가나다라마바사아자', 0) !== 'long') throw new Error('finale long');
  if (bloomStage(0, false) !== 0 || bloomStage(BLOOM_STEP_MS, false) !== 1 || bloomStage(0, true) !== 4) {
    throw new Error('bloom');
  }
}
