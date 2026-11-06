/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/해무/01_심야라디오_설계_v1.md §6, §9-3.
 */

export const P1_CODE = '4538';

export function judgeP1(code: string): 'ok' | 'postit' | 'no' {
  if (code === P1_CODE) return 'ok';
  if (code.length === 4 && code.startsWith('5')) return 'postit';
  return 'no';
}

export const P2_HZ = 87.9;
export const P2_TOL = 0.05;
export const P2_HOLD_MS = 1000;
export const P2_TEASE_LO = 87.55;
export const P2_TEASE_HI = 87.65;

export function inBand(freq: number, target: number, tol: number): boolean {
  return Math.abs(freq - target) <= tol;
}

export function isP2Tease(freq: number): boolean {
  return freq >= P2_TEASE_LO && freq <= P2_TEASE_HI;
}

export type CartId =
  | 'call'
  | 'fish'
  | 'tailor'
  | 'weather'
  | 'archive'
  | 'campaign'
  | 'jingle';

export const CARTS: { id: CartId; label: string; sec: number; ad: boolean }[] = [
  { id: 'call', label: '호출부호', sec: 10, ad: false },
  { id: 'fish', label: '해무수산 광고', sec: 20, ad: true },
  { id: 'tailor', label: '한 땀 광고', sec: 25, ad: true },
  { id: 'weather', label: '날씨·안개', sec: 40, ad: false },
  { id: 'archive', label: '녹음 코너', sec: 80, ad: false },
  { id: 'campaign', label: '졸음운전', sec: 30, ad: false },
  { id: 'jingle', label: '로고송', sec: 15, ad: false },
];

export const P3_ANSWER: CartId[] = ['call', 'archive', 'fish', 'weather'];
export const P3_TARGET_SEC = 150;

const cartById = new Map(CARTS.map((c) => [c.id, c]));

export function judgeP3(queue: readonly (string | null)[]): 'ok' | 'short' | 'long' | 'rule' {
  const ids = queue.filter((id): id is string => !!id);
  if (ids.length === 0) return 'short';
  const secs = ids.reduce((n, id) => n + (cartById.get(id as CartId)?.sec ?? 0), 0);
  const second = ids[1];
  const rule =
    ids[0] !== 'call' ||
    ids[ids.length - 1] !== 'weather' ||
    (second != null && !!cartById.get(second as CartId)?.ad);
  if (rule) return 'rule';
  if (secs < P3_TARGET_SEC) return 'short';
  if (secs > P3_TARGET_SEC) return 'long';
  if (ids.join() !== P3_ANSWER.join()) return 'rule';
  return 'ok';
}

export type LetterId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const LETTERS: { id: LetterId; face: string; back: string }[] = [
  { id: 'A', face: '10/28 · 등대지기 영감 · 두 시의 우편함', back: '올겨울이면 등대가 무인화. 밤마다 이 시간 방송을 틀어 놓고 불을 지킴.' },
  { id: 'B', face: '10/21 · 등대 아래 고양이 · 두 시의 우편함', back: '방파제 고양이가 새끼를 넷. 하나는 두시.' },
  { id: 'C', face: '소인 번짐 · 수산시장 막내 · 두 시의 우편함', back: '오늘 해무 불꽃축제. 마지막 세 발을 봄. 포스터는 10/18.' },
  { id: 'D', face: '10/25 · 등대 아래 고양이 · 두 시의 우편함', back: '새끼 이름, 하나는 벌써 두시.' },
  { id: 'E', face: '10/14 · 바다반장 · 〈아침의 해무〉', back: '아침 날씨 코너 고맙습니다.' },
  { id: 'F', face: '11/01 · 졸업반 김씨 · 두 시의 우편함', back: '졸업 작품 발표 전날, 이 방송만 들음.' },
];

export function judgeP4(board: readonly (string | null)[]): 'ok' | 'morning' | 'same' | 'no' {
  if (board.length === 4 && board[0] === 'C' && board[1] == null && board[2] === 'B' && board[3] === 'A') {
    return 'ok';
  }
  if (board.includes('E')) return 'morning';
  if (board.includes('B') && board.includes('D')) return 'same';
  return 'no';
}

export function slot2Rejects(index: number): boolean {
  return index === 1;
}

export const P5_STATIONS = [
  { id: 'd100', freq: 88.5, digit: '5', d: 100, caption: '88.5 · 창 5 · D-100 · 컵라면' },
  { id: 'd50', freq: 87.3, digit: '3', d: 50, caption: '87.3 · 창 3 · D-50 · 3반 걔' },
  { id: 'd30', freq: 88.2, digit: '2', d: 30, caption: '88.2 · 창 2 · D-30 · 성적표' },
  { id: 'd7', freq: 87.6, digit: '6', d: 7, caption: '87.6 · 창 6 · D-7 · 끊김' },
] as const;

export type FragmentId = (typeof P5_STATIONS)[number]['id'];

// ponytail: stations sit still. The ±0.03 wobble waits for a real old-broadcast asset.
export const P5_TOL = 0.03;
export const P5_ASSIST_TOL = 0.15;
export const P5_HOLD_MS = 4000;
export const P5_CODE = '5326';

export function p5Tol(hearingAssist: boolean): number {
  return hearingAssist ? P5_ASSIST_TOL : P5_TOL;
}

export function stationAt(freq: number, tol: number) {
  return P5_STATIONS.find((s) => inBand(freq, s.freq, tol)) ?? null;
}

export function judgeP5(code: string): 'ok' | 'order' | 'no' {
  if (code === P5_CODE) return 'ok';
  const digits = new Set(code);
  const frag = ['2', '3', '5', '6'].every((d) => digits.has(d));
  if (frag && (code === [...code].sort().join('') || code === '3625' || code === '3562')) {
    return 'order';
  }
  return 'no';
}

export const P6_BOXES = [
  { id: '1020', label: '1020' },
  { id: '1027', label: '1027' },
  { id: '1103', label: '번짐' },
  { id: '1110', label: '번짐' },
  { id: '1117', label: '1117' },
] as const;

export const P6_BOX = '1103';
export const P6_TRAP_BOX = '1110';
export const P6_COUNTER = 412;
export const P6_TOL = 3;
export const P6_ORIGIN = 873;

export function judgeP6Box(id: string): 'ok' | 'trap' | 'no' {
  if (id === P6_BOX) return 'ok';
  if (id === P6_TRAP_BOX) return 'trap';
  return 'no';
}

export function judgeP6Counter(n: number): boolean {
  return Math.abs(n - P6_COUNTER) <= P6_TOL;
}

/** Counts per second. Doubles every 0.5s, caps at ×8. */
export function rewindRate(heldMs: number): number {
  const steps = Math.min(3, Math.floor(Math.max(0, heldMs) / 500));
  return 20 * 2 ** steps;
}

export const P7_HOLD_MS = 600;
export const P7_KEY = '큰 등대';
export const P7_RED = '빨간 등대';
export const P7_TAGS = ['배', '부표', '갈매기', '빨간 등대', '큰 등대'] as const;

export function judgeKey(tag: string): 'ok' | 'red' | 'no' {
  if (tag === P7_KEY) return 'ok';
  if (tag === P7_RED) return 'red';
  return 'no';
}

export const P8_HZ = 87.9;
export const P8_TOL = 0.05;
export const P8_HOLD_MS = 2000;
export const P8_PER_TURN = 1 / 3;

export function judgeFader(value: number): boolean {
  return value >= 1;
}

export function windowDigit(freq: number): string {
  return String(Math.abs(Math.round(freq * 10)) % 10);
}

export function assertRadioAnswers(): void {
  if (judgeP1('4538') !== 'ok' || judgeP1('5538') !== 'postit' || judgeP1('1111') !== 'no') {
    throw new Error('P1');
  }
  if (!inBand(87.94, P2_HZ, P2_TOL) || inBand(88, P2_HZ, P2_TOL) || !isP2Tease(87.6)) {
    throw new Error('P2');
  }
  if (judgeP3(P3_ANSWER) !== 'ok') throw new Error('P3 ok');
  if (judgeP3(['call', 'weather']) !== 'short') throw new Error('P3 short');
  if (judgeP3(['call', 'archive', 'campaign', 'weather']) !== 'long') throw new Error('P3 long');
  if (judgeP3(['call', 'fish', 'archive', 'weather']) !== 'rule') throw new Error('P3 rule');
  if (judgeP4(['C', null, 'B', 'A']) !== 'ok') throw new Error('P4');
  if (judgeP4(['E', null, 'B', 'A']) !== 'morning') throw new Error('P4 E');
  if (judgeP4(['C', null, 'B', 'D']) !== 'same') throw new Error('P4 same');
  if (slot2Rejects(1) !== true) throw new Error('slot2');
  const heard = [...P5_STATIONS].sort((a, b) => b.d - a.d).map((s) => s.digit).join('');
  if (heard !== P5_CODE || judgeP5('5326') !== 'ok' || judgeP5('2356') !== 'order' || judgeP5('3625') !== 'order') {
    throw new Error('P5');
  }
  if (judgeP5('1111') !== 'no') throw new Error('P5 no');
  if (judgeP6Box('1103') !== 'ok' || judgeP6Box('1110') !== 'trap') throw new Error('P6 box');
  if (!judgeP6Counter(412) || !judgeP6Counter(409) || !judgeP6Counter(415) || judgeP6Counter(408)) {
    throw new Error('P6 counter');
  }
  if (rewindRate(0) !== 20 || rewindRate(500) !== 40 || rewindRate(1500) !== 160) throw new Error('rewind');
  if (judgeKey('큰 등대') !== 'ok' || judgeKey('빨간 등대') !== 'red' || judgeKey('배') !== 'no') {
    throw new Error('P7');
  }
  if (!judgeFader(1) || judgeFader(0.99) || P8_PER_TURN !== 1 / 3) throw new Error('P8');
  if (windowDigit(87.9) !== '9') throw new Error('digit');
}
