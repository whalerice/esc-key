/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/해무/05_수선집_설계_v1.md §5–§6.
 */

export const P1_CODE = '0731';
export const P1_TRAP = '1370';

export function judgeP1(code: string): 'ok' | 'reverse' | 'no' {
  if (code === P1_CODE) return 'ok';
  if (code === P1_TRAP) return 'reverse';
  return 'no';
}

/** Six tiers so "third from the bottom" is not "third from the top". */
export const SHELF_TIERS = 6;

export function fromBottom(fromTop: number, tiers = SHELF_TIERS): number {
  return tiers - fromTop + 1;
}

export function judgeShelf(color: string, fromTop: number): 'ok' | 'clue' | 'trap' | 'no' {
  if (color === 'blue' && fromTop === 2) return 'clue';
  if (color === 'navy' && fromTop === 3) return 'ok';
  if (color === 'navy' && fromBottom(fromTop) === 3) return 'trap';
  return 'no';
}

/** Crooked-stitch ratio. 20% still passes. The widget does not decide this. */
export const SEW_PASS = 0.2;
export const SEW_LEN = 200;
export const CURVE_AMP = 36;

export function judgeSew(crookedRatio: number): 'ok' | 'again' {
  return crookedRatio <= SEW_PASS ? 'ok' : 'again';
}

export function straightPercent(ratio: number): number {
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.round((1 - clamped) * 100);
}

export type Pt = { x: number; y: number };

export const STRAIGHT_PATH: Pt[] = [
  { x: 0, y: 0 },
  { x: 0, y: SEW_LEN },
];

/** Sine bulge. y is the running length only when the bulge is shallow; park uses arc length. */
export function curvePath(): Pt[] {
  const n = 12;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const y = (SEW_LEN * i) / n;
    pts.push({ x: Math.sin((Math.PI * i) / n) * CURVE_AMP, y });
  }
  return pts;
}

export function pointAlong(path: Pt[], dist: number): Pt {
  if (!path.length) return { x: 0, y: 0 };
  let left = Math.max(0, dist);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (left <= len || i === path.length - 1) {
      const t = len === 0 ? 0 : Math.min(1, left / len);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    left -= len;
  }
  return { ...path[path.length - 1]! };
}

/** Angle 0 puts the needle at (-clothX, progress). Match the chalk x. */
export function clothPark(path: Pt[], dist: number): number {
  return -pointAlong(path, dist).x;
}

export type Cover = {
  id: string;
  edge: boolean;
  wave: boolean;
  seal: boolean;
  label: string;
};

/** 4 edge-fail, 2 edge-only, 1 edge+wave, 1 all three. Appendix C. */
export const COVERS: Cover[] = [
  { id: 'a', edge: false, wave: false, seal: false, label: '커버 1' },
  { id: 'b', edge: false, wave: false, seal: false, label: '커버 2' },
  { id: 'c', edge: false, wave: true, seal: false, label: '커버 3' },
  { id: 'd', edge: false, wave: false, seal: true, label: '커버 4' },
  { id: 'e', edge: true, wave: false, seal: false, label: '커버 5' },
  { id: 'f', edge: true, wave: false, seal: true, label: '커버 6' },
  { id: 'g', edge: true, wave: true, seal: false, label: '커버 7' },
  { id: 'h', edge: true, wave: true, seal: true, label: '커버 8' },
];

export function judgeCover(id: string): 'ok' | 'edge' | 'wave' | 'seal' | 'no' {
  const cover = COVERS.find((item) => item.id === id);
  if (!cover) return 'no';
  if (!cover.edge) return 'edge';
  if (!cover.wave) return 'wave';
  if (!cover.seal) return 'seal';
  return 'ok';
}

export const ITEM_TICKET = '번호표';
export const ITEM_CASE = '필통';
export const ITEM_KEY = '철망 열쇠';
export const ITEM_RIPPER = '실뜯개';
export const ITEM_NOTE = '엄마의 쪽지';

export const RIP_COUNT = 7;

export type CaseItem = { id: string; name: string; mm: number; holes: number };

export const CASE: CaseItem[] = [
  { id: 'eraser', name: '지우개', mm: 0, holes: 0 },
  { id: 'pencil', name: '몽당연필', mm: 0, holes: 0 },
  { id: 'bead', name: '유리구슬', mm: 16, holes: 1 },
  { id: 'shell', name: '조개껍데기', mm: 22, holes: 1 },
  { id: 'cap', name: '병뚜껑', mm: 30, holes: 2 },
  { id: 'brown', name: '갈색 바다유리', mm: 18, holes: 2 },
  { id: 'green', name: '초록 바다유리', mm: 22, holes: 2 },
];

export const GAUGE_MM = [18, 20, 22, 25, 30] as const;

export const GAUGE_TARGETS = GAUGE_MM.map((mm, i) => ({
  id: String(mm),
  x: 24 + i * 48,
  y: 28,
  r: 18,
}));

export function judgeGauge(itemId: string, holeMm: number): 'fit' | 'no' {
  const item = CASE.find((entry) => entry.id === itemId);
  if (!item?.mm) return 'no';
  return item.mm === holeMm ? 'fit' : 'no';
}

export function judgeButton(itemId: string): 'ok' | 'small' | 'big' | 'one' | 'roll' | 'no' {
  if (itemId === 'green') return 'ok';
  if (itemId === 'brown') return 'small';
  if (itemId === 'cap') return 'big';
  if (itemId === 'shell') return 'one';
  if (itemId === 'bead') return 'roll';
  return 'no';
}

/** Up through hole 1, down through hole 2, four times. */
export const HOLE_ORDER = ['1u', '2d', '1u', '2d', '1u', '2d', '1u', '2d'] as const;

export function judgeHoles(seq: readonly string[]): 'ok' | 'no' {
  if (seq.length !== HOLE_ORDER.length) return 'no';
  return seq.every((id, i) => id === HOLE_ORDER[i]) ? 'ok' : 'no';
}

export const EYE_HOLD_MS = 600;
export const THREAD_TIP = { x: 90, y: 48 };

/**
 * Gray box: the eye sways, but the sway stays inside the snap radius.
 * DragSnap has no wobble option, so a held thread tip still counts.
 */
export function eyeTarget(nowMs: number): { id: string; x: number; y: number; r: number } {
  const x = THREAD_TIP.x + Math.sin((nowMs / 1000) * (Math.PI / 2)) * 10;
  return { id: 'eye', x, y: THREAD_TIP.y, r: 18 };
}

export function judgeEye(cut: boolean, inside: boolean, heldMs: number): 'ok' | 'fuzz' | 'short' | 'miss' {
  if (!cut) return 'fuzz';
  if (!inside) return 'miss';
  if (heldMs < EYE_HOLD_MS) return 'short';
  return 'ok';
}

export const WRAP_TURNS = 3;

export function judgeWrap(turns: number): 'ok' | 'short' {
  return turns >= WRAP_TURNS - 1e-6 ? 'ok' : 'short';
}

/** Script says one second. Gesture default is shorter; the theme waits the full second. */
export const KNOT_MS = 1000;

export function judgeKnot(heldMs: number): 'ok' | 'short' {
  return heldMs >= KNOT_MS ? 'ok' : 'short';
}

const ENDING_COPY: Record<string, { blurb: string; share: string }> = {
  A: { blurb: '27년 기다린 코트에, 마지막 한 땀.', share: '남색 코트의 초록 단추' },
  B1: { blurb: '반쪽 번호표만 손에 남았다.', share: '컨테이너 앞 번호표 반쪽' },
  B2: { blurb: '코트는 찾았지만, 한 칸이 비어 있었다.', share: '단추 칸이 빈 코트' },
};

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function tailorResultLines(input: {
  endingId: string;
  title: string;
  elapsedMs: number;
  remainingMs: number;
  thimble: number;
  trapReverseTape: boolean;
  trapShelfFromBottom: boolean;
  trapBrownGlass: boolean;
  sewScore?: { P3: number; P8: number };
}): string[] {
  const copy = ENDING_COPY[input.endingId] ?? { blurb: input.title, share: '' };
  const traps = [
    input.trapReverseTape ? '거꾸로 읽은 줄자' : null,
    input.trapShelfFromBottom ? '아래에서 센 선반' : null,
    input.trapBrownGlass ? '갈색 바다유리' : null,
  ].filter((trap): trap is string => !!trap);
  const lines = [
    copy.blurb,
    `걸린 시간 ${mmss(input.elapsedMs)}`,
    `남은 실 ${mmss(input.remainingMs)}`,
    `골무 ${input.thimble}번`,
    `도장 「${input.title}」`,
    `함정 발견 ${traps.length ? traps.join(' · ') : '없음'}`,
  ];
  if (input.endingId === 'A' && input.sewScore) {
    lines.push(`반듯한 땀 — 바지 단 ${input.sewScore.P3}% · 안감 ${input.sewScore.P8}%`);
  }
  if (input.endingId === 'B1' || input.endingId === 'B2') {
    lines.push('그날 밤, 해무시장 2층의 불은 21시 30분에 꺼졌다.');
  }
  if (copy.share) lines.push(copy.share);
  return lines;
}

export function assertTailorAnswers(): void {
  if (judgeP1(P1_CODE) !== 'ok' || judgeP1(P1_TRAP) !== 'reverse' || judgeP1('0000') !== 'no') {
    throw new Error('P1');
  }
  if (judgeShelf('navy', 3) !== 'ok') throw new Error('P2 ok');
  if (judgeShelf('blue', 2) !== 'clue') throw new Error('P2 clue');
  if (judgeShelf('navy', 4) !== 'trap' || fromBottom(4) !== 3) throw new Error('P2 trap');
  if (judgeShelf('red', 1) !== 'no') throw new Error('P2 no');
  if (judgeSew(0) !== 'ok' || judgeSew(SEW_PASS) !== 'ok' || judgeSew(SEW_PASS + 0.001) !== 'again') {
    throw new Error('sew');
  }
  if (straightPercent(0.2) !== 80) throw new Error('percent');
  const covers = {
    edge: COVERS.filter((c) => !c.edge).length,
    only: COVERS.filter((c) => c.edge && !c.wave).length,
    wave: COVERS.filter((c) => c.edge && c.wave && !c.seal).length,
    all: COVERS.filter((c) => c.edge && c.wave && c.seal).length,
  };
  if (covers.edge !== 4 || covers.only !== 2 || covers.wave !== 1 || covers.all !== 1) {
    throw new Error('covers');
  }
  if (judgeCover('h') !== 'ok' || judgeCover('g') !== 'seal' || judgeCover('e') !== 'wave') {
    throw new Error('cover judge');
  }
  if (judgeCover('a') !== 'edge') throw new Error('cover edge');
  if (judgeGauge('green', 22) !== 'fit' || judgeGauge('green', 18) !== 'no') throw new Error('gauge');
  if (judgeButton('green') !== 'ok' || judgeButton('brown') !== 'small' || judgeButton('cap') !== 'big') {
    throw new Error('button');
  }
  if (judgeButton('shell') !== 'one' || judgeButton('bead') !== 'roll' || judgeButton('eraser') !== 'no') {
    throw new Error('button rest');
  }
  if (judgeHoles([...HOLE_ORDER]) !== 'ok' || judgeHoles(['1u', '2d']) !== 'no') throw new Error('holes');
  if (judgeEye(false, true, 1000) !== 'fuzz') throw new Error('fuzz');
  if (judgeEye(true, false, 1000) !== 'miss') throw new Error('miss');
  if (judgeEye(true, true, 599) !== 'short' || judgeEye(true, true, 600) !== 'ok') throw new Error('eye');
  if (judgeWrap(2.9) !== 'short' || judgeWrap(3) !== 'ok') throw new Error('wrap');
  if (judgeKnot(999) !== 'short' || judgeKnot(1000) !== 'ok') throw new Error('knot');
  const card = tailorResultLines({
    endingId: 'A',
    title: '찾아가신 옷',
    elapsedMs: 125_000,
    remainingMs: 30 * 60_000 - 125_000,
    thimble: 4,
    trapReverseTape: true,
    trapShelfFromBottom: false,
    trapBrownGlass: true,
    sewScore: { P3: 90, P8: 80 },
  });
  if (card[0] !== '27년 기다린 코트에, 마지막 한 땀.') throw new Error('card A');
  if (!card.includes('골무 4번') || !card.includes('도장 「찾아가신 옷」')) throw new Error('card stamp');
  if (!card.includes('함정 발견 거꾸로 읽은 줄자 · 갈색 바다유리')) throw new Error('card trap');
  if (!card.includes('반듯한 땀 — 바지 단 90% · 안감 80%')) throw new Error('card sew');
  if (!card.includes('남색 코트의 초록 단추')) throw new Error('card share');
  const b1 = tailorResultLines({
    endingId: 'B1',
    title: '아직 기다리는 옷',
    elapsedMs: 30 * 60_000,
    remainingMs: 0,
    thimble: 0,
    trapReverseTape: false,
    trapShelfFromBottom: true,
    trapBrownGlass: false,
  });
  if (b1[0] !== '반쪽 번호표만 손에 남았다.') throw new Error('card B1');
  if (!b1.includes('함정 발견 아래에서 센 선반')) throw new Error('card B1 trap');
  if (!b1.includes('그날 밤, 해무시장 2층의 불은 21시 30분에 꺼졌다.')) throw new Error('card night');
  const b2 = tailorResultLines({
    endingId: 'B2',
    title: '단추 하나 없는 코트',
    elapsedMs: 30 * 60_000,
    remainingMs: 0,
    thimble: 1,
    trapReverseTape: false,
    trapShelfFromBottom: false,
    trapBrownGlass: false,
  });
  if (b2[0] !== '코트는 찾았지만, 한 칸이 비어 있었다.') throw new Error('card B2');
  if (!b2.includes('함정 발견 없음') || !b2.includes('단추 칸이 빈 코트')) throw new Error('card B2 rest');
}
