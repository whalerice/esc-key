/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/늘봄/01_붉은방_설계_v1.md §4–§6.
 */

export const DURATION_MS = 30 * 60_000;
export const PENALTY_MS = 60_000;
export const LOCK = [4, 1, 3] as const;
export const TEMP_C = 38;
export const TEMP_TOL = 0.5;
/** ponytail: design compresses 3:15. 4s stands in until a timed playtest. */
export const TANK_MS = 4_000;
export const EXPOSE_OK = 15;
export const DEVELOP_MS = 12_000;
export const DODGE_MS = 8_000;
export const DODGE_NEED = 0.6;
export const CONFIRM_MS = 1_000;
export const PRINT_MS = 5_000;
export const SPIRAL_TURNS = 3;
export const SPIRAL_TURNS_ONE_HAND = 2;
export const REEL_BOX = 280;
export const ENVELOPE = 741;

export const WOMAN_CUTS = ['A5', 'B2', 'C6', 'D3', 'E1', 'F4'] as const;

export const TRAP_NOTE: Record<string, string> = {
  A2: '우체통이다.',
  C3: '소화전.',
  F2: '시장 대야.',
};

export const P6_ORDER = ['maple', 'dol', 'window', 'family', 'id', 'snow'] as const;

export type PhotoId = (typeof P6_ORDER)[number];

export const PHOTOS: { id: PhotoId; name: string; clue: string; woman: string }[] = [
  {
    id: 'maple',
    name: '단풍놀이',
    clue: '단풍 절정. 전파사 자리에 비계. 왼쪽 끝 최 시계방.',
    woman: '골목 끝',
  },
  {
    id: 'dol',
    name: '돌잔치',
    clue: '현수막 11월 6일. 잎이 지기 시작. 비계 그대로.',
    woman: '맞은편 식당 앞',
  },
  {
    id: 'window',
    name: '쇼윈도',
    clue: '낙엽이 쌓임. 간판이 반쯤. 손님은 두꺼운 외투.',
    woman: '쇼윈도 유리',
  },
  {
    id: 'family',
    name: '가족사진',
    clue: '가지 앙상. 간판 완성. 화환 리본 11월 15일, 싱싱. 윤석주 — 아버지, 어머니, 다섯 살 딸.',
    woman: '출입문 안쪽',
  },
  {
    id: 'id',
    name: '증명사진',
    clue: '같은 화환이 시들었다. 여자가 접수증을 내민다.',
    woman: '카운터 앞',
  },
  {
    id: 'snow',
    name: '첫눈',
    clue: '창밖 첫눈. 안에서 찍었다.',
    woman: '암실 문 앞',
  },
];

export const MISS_LINE = [
  '…아니다. 나무가 거꾸로 간다.',
  '간판을 보자.',
  '꽃은 시들기만 한다.',
] as const;

export const BANDS = [1, 101, 201, 301, 401, 501, 601, 701, 801, 901] as const;

export const FACES = [
  { id: 'left', x: 80, y: 90, r: 60 },
  { id: 'right', x: 240, y: 90, r: 60 },
] as const;

export const FINGER_R = 60;

export const SLEEVE_W = 560;
export const SLEEVE_H = 420;
export const LOUPE_RADIUS = 72;
export const LOUPE_GAP = 12;

export function judgeLock(values: readonly number[]): boolean {
  return values.length === LOCK.length && values.every((n, i) => n === LOCK[i]);
}

export function judgeCrank(turns: number): boolean {
  return turns >= 1;
}

export function judgeSpiral(progress: number): boolean {
  return progress >= 1;
}

export function judgeChem(
  kit: string,
  temp: number,
  shook: boolean,
): 'ok' | 'bw' | 'cold' | 'hot' | 'shake' | 'wait' {
  if (!kit) return 'wait';
  if (kit === 'bw') return 'bw';
  if (kit !== 'color') return 'wait';
  if (temp < TEMP_C - TEMP_TOL) return 'cold';
  if (temp > TEMP_C + TEMP_TOL) return 'hot';
  if (!shook) return 'shake';
  return 'ok';
}

export function judgeCut(id: string): 'woman' | 'trap' | 'no' {
  if ((WOMAN_CUTS as readonly string[]).includes(id)) return 'woman';
  if (TRAP_NOTE[id]) return 'trap';
  return 'no';
}

export function cutNote(id: string): string {
  return TRAP_NOTE[id] ?? '사람이 아니다.';
}

export function judgeExposure(sec: number): 'ok' | 'thin' | 'dark' {
  if (sec === EXPOSE_OK) return 'ok';
  return sec < EXPOSE_OK ? 'thin' : 'dark';
}

export function judgeLine(slots: readonly string[]): 'ok' | 'short' | 'no' {
  if (slots.filter(Boolean).length < P6_ORDER.length) return 'short';
  return slots.every((id, i) => id === P6_ORDER[i]) ? 'ok' : 'no';
}

export function hangPhoto(slots: readonly string[], photo: string, clip: number): string[] {
  const next = Array.from({ length: P6_ORDER.length }, (_, i) => slots[i] ?? '');
  if (clip < 0 || clip >= next.length) return next;
  const from = next.indexOf(photo);
  const occupant = next[clip] ?? '';
  if (from >= 0) next[from] = occupant === photo ? '' : occupant;
  next[clip] = photo;
  return next;
}

export function judgeEnvelope(n: number): 'ok' | 'no' {
  return n === ENVELOPE ? 'ok' : 'no';
}

export function envelopesIn(band: number): number[] {
  if (band === 701) return [704, 741, 788];
  return [band, band + 40, band + 77];
}

export function judgeDodge(left: number, right: number): 'ok' | 'one' | 'no' {
  const l = left >= DODGE_NEED;
  const r = right >= DODGE_NEED;
  if (l && r) return 'ok';
  if (l || r) return 'one';
  return 'no';
}

export function judgeDevelopHold(heldMs: number, needMs = DEVELOP_MS): 'ok' | 'early' {
  return heldMs >= needMs ? 'ok' : 'early';
}

export function sleeveCells(): { id: string; x: number; y: number }[] {
  const rows = 'ABCDEF';
  const top = 80;
  const left = 46;
  const cw = 78;
  const ch = 40;
  const cells: { id: string; x: number; y: number }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      cells.push({
        id: `${rows[r]}${c + 1}`,
        x: left + c * cw + cw / 2,
        y: top + r * ch + ch / 2,
      });
    }
  }
  return cells;
}

export function clipSlots(): { id: string; x: number; y: number; r: number }[] {
  return P6_ORDER.map((_, i) => ({ id: String(i), x: 40 + i * 70, y: 36, r: 28 }));
}

export function endingCNote(solved: Readonly<Record<string, boolean>>): string {
  if (!solved.P5) return '인화 전이다. 사진이 남을 틈이 없다.';
  if (!solved.P6) return '쟁반의 젖은 사진이 검게 변한다.';
  if (!solved.P7) return '서랍이 열려 있고, 봉투 하나가 바닥에 떨어져 있다. 이름 칸은 안 보인다.';
  return '빨랫줄의 사진이 암실 문 앞부터 검게 변한다. 1974년 사진에서 정희가 있던 자리가 비어 있다.';
}

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STAMP: Record<string, string> = {
  A: '빛을 받아도 지워지지 않는 사진이 되었다.',
  B: '셔터는 이제 당신의 몫이다.',
  C: '현상되지 못한 사진이 남았다.',
};

export function darkroomResultLines(input: {
  endingId: string;
  title: string;
  elapsedMs: number;
  remainingMs: number;
  hints: number;
  solved: Readonly<Record<string, boolean>>;
}): string[] {
  const others = (['A', 'B', 'C'] as const)
    .filter((id) => id !== input.endingId)
    .map((id) => `${id} 실루엣`);
  return [
    `걸린 시간 ${mmss(input.elapsedMs)}`,
    `남은 시간 ${mmss(input.remainingMs)}`,
    `최 영감에게 ${input.hints}번 전화했다`,
    input.title,
    STAMP[input.endingId] ?? input.title,
    input.endingId === 'C' ? endingCNote(input.solved) : '',
    input.endingId === 'B' ? '결과 카드의 골목은 비어 있다.' : '',
    ...others,
  ].filter(Boolean);
}

export function assertDarkroomAnswers(): void {
  if (!judgeLock([4, 1, 3]) || judgeLock([4, 1, 2])) throw new Error('p1');
  if (!judgeCrank(1) || judgeCrank(0.2)) throw new Error('crank');
  if (!judgeSpiral(1) || judgeSpiral(0.5)) throw new Error('spiral');
  if (judgeChem('color', 38, true) !== 'ok') throw new Error('p3');
  if (judgeChem('bw', 38, true) !== 'bw') throw new Error('p3 bw');
  if (judgeChem('color', 36, true) !== 'cold') throw new Error('p3 cold');
  if (judgeChem('color', 40, true) !== 'hot') throw new Error('p3 hot');
  if (judgeChem('color', 38, false) !== 'shake') throw new Error('p3 shake');
  if (judgeChem('color', 37.5, true) !== 'ok' || judgeChem('color', 38.5, true) !== 'ok') {
    throw new Error('p3 tol');
  }
  if (judgeCut('A5') !== 'woman' || judgeCut('A2') !== 'trap' || judgeCut('B1') !== 'no') {
    throw new Error('p4');
  }
  if (WOMAN_CUTS.length !== 6) throw new Error('p4 count');
  if (judgeExposure(15) !== 'ok' || judgeExposure(10) !== 'thin' || judgeExposure(20) !== 'dark') {
    throw new Error('p5');
  }
  if (judgeLine([...P6_ORDER]) !== 'ok') throw new Error('p6');
  if (judgeLine(['maple']) !== 'short') throw new Error('p6 short');
  const swapped = hangPhoto([...P6_ORDER], 'snow', 0);
  if (swapped[0] !== 'snow' || swapped[5] !== 'maple') throw new Error('p6 swap');
  if (judgeEnvelope(741) !== 'ok' || judgeEnvelope(704) !== 'no') throw new Error('p7');
  if (!envelopesIn(701).includes(741)) throw new Error('p7 band');
  if (judgeDodge(0.6, 0.6) !== 'ok' || judgeDodge(0.6, 0.2) !== 'one' || judgeDodge(0, 0) !== 'no') {
    throw new Error('p8');
  }
  if (judgeDevelopHold(DEVELOP_MS) !== 'ok' || judgeDevelopHold(DEVELOP_MS - 1) !== 'early') {
    throw new Error('hold');
  }
  const cells = sleeveCells();
  if (cells.length !== 36 || cells.find((c) => c.id === 'A5') == null) throw new Error('sleeve');
}
