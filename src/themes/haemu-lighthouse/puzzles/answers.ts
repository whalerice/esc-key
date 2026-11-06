/**
 * Answer checks only. Widgets emit values; this file judges them.
 * Spec: docs/시리즈/해무/03_등대지기_설계_v1.md §5, §6, §9-3.
 */

export const P1_CODE = '1418';
export const P1_TRAP = '1416';

export function judgeP1(code: string): 'ok' | 'chart' | 'no' {
  if (code === P1_CODE) return 'ok';
  if (code === P1_TRAP) return 'chart';
  return 'no';
}

export const LEVERS = [
  { id: 'blue', floor: 1, down: false, label: '파랑 1' },
  { id: 'green', floor: 2, down: true, label: '초록 2' },
  { id: 'white', floor: 3, down: false, label: '흰색 3' },
  { id: 'black', floor: 4, down: false, label: '검정 4' },
  { id: 'yellow', floor: 5, down: true, label: '노랑 5' },
  { id: 'red', floor: 6, down: true, label: '빨강 6' },
] as const;

export const P2_ORDER = ['red', 'yellow', 'green'] as const;

export function judgeLevers(order: readonly string[]): 'ok' | 'prefix' | 'reset' {
  if (order.length > P2_ORDER.length) return 'reset';
  for (let i = 0; i < order.length; i++) {
    if (order[i] !== P2_ORDER[i]) return 'reset';
  }
  return order.length === P2_ORDER.length ? 'ok' : 'prefix';
}

export function judgeLight(slot: number): 'dead' | 'dim' | 'ok' | 'flash' {
  if (slot === 1) return 'dead';
  if (slot === 2) return 'dim';
  if (slot === 3) return 'ok';
  return 'flash';
}

export const FOCUS_TOL = 0.12;
export const FOCUS_HOLD_MS = 1000;

export function shadowOf(focus: { x: number; y: number }): { x: number; y: number } {
  return { x: -focus.x, y: -focus.y };
}

export function focusAligned(focus: { x: number; y: number }): boolean {
  const shadow = shadowOf(focus);
  return Math.hypot(shadow.x, shadow.y) <= FOCUS_TOL;
}

export const BEAM_MIN = 40;
export const BEAM_MAX = 180;
export const BEAM_WIDTH = 16;
export const BEAM_HOLD_MS = 2000;

export const MARKS = [
  { id: 'gull', deg: 40, name: '갈매기 바위' },
  { id: 'boatA', deg: 80, name: '해진 8호' },
  { id: 'buoy', deg: 105, name: '부표 3번' },
  { id: 'boatB', deg: 110, name: '제3해진호' },
  { id: 'red', deg: 150, name: '빨간 등대' },
  { id: 'rock', deg: 170, name: '검은여' },
] as const;

export type MarkId = (typeof MARKS)[number]['id'];

export function judgeHold(id: string): 'ok' | 'trap' | 'look' {
  if (id === 'boatB') return 'ok';
  if (id === 'boatA') return 'trap';
  return 'look';
}

export const SHIP_FROM = 135;
export const SHIP_TO = 150;
export const SHIP_DPS = 0.3;

/** 135° toward 150°, then back to 135°. `ms` is time since the drift started. */
export function shipBearing(ms: number): number {
  const span = SHIP_TO - SHIP_FROM;
  const cycle = (span / SHIP_DPS) * 1000;
  const t = ((ms % cycle) + cycle) % cycle;
  return SHIP_FROM + (t / 1000) * SHIP_DPS;
}

export function shipBearingSince(elapsedMs: number, startMs: number): number {
  return shipBearing(Math.max(0, elapsedMs - startMs));
}

/** Same alphabet MorseInput emits. Dot U+00B7, dash U+2212. */
export const MORSE_U = '\u00b7\u00b7\u2212';

export function judgeSignal(code: string, inBeam: readonly string[]): 'ok' | 'red' | 'miss' | 'no' {
  const onShip = inBeam.includes('boatB');
  const onRed = inBeam.includes('red');
  if (!onShip && onRed) return 'red';
  if (!onShip) return 'miss';
  return code === MORSE_U ? 'ok' : 'no';
}

export type TabColor = 'red' | 'blue' | 'yellow';

export type LogTab = {
  id: string;
  color: TabColor;
  shape: string;
  date: string;
  old?: boolean;
  body: string;
};

export const FIRST_BLUE = '2016.07.15';

export const PROCEDURE = `2016. 7. 15 (금) 짙은 안개
자동화 준공식. 화환 다 젖음.
01:40 안개 짙음. 감지기 '안개 없음'. 무적 안 움.
손으로 켬.
1. 압축기 켬
2. 압력 7까지 기다릴 것
3. 배수 밸브 먼저 잠글 것
4. 공기 밸브 엶
5. 울림 2초 · 쉼 2초 · 울림 2초 ━━ · ━━
   그다음 쐐기. 30초마다 저 혼자 운다.
06:00 원격 확인 '이상 없음'.
라디오 켬 87.9 · 입항 2척`;

export const TABS: LogTab[] = [
  { id: 'r-2019', color: 'red', shape: '▽', date: '2019.3.2', body: '주등 단선. 3번으로 교체.' },
  {
    id: 'y-2009',
    color: 'yellow',
    shape: '◠',
    date: '2009.2.12',
    old: true,
    body: '편지 보냄 — 방파제 등대 보고 들어오던 배 얘기. "그 등대 말고." · 읽힘 ✓',
  },
  { id: 'y-2026', color: 'yellow', shape: '◠', date: '2026.10.28', body: '편지 보냄 · 읽힘 ( )' },
  {
    id: 'b-2021',
    color: 'blue',
    shape: '━',
    date: '2021.11.30',
    body: '안개. 감지기 못 봄. 무적 손으로 켬. 06:00 이상 없음 보고됨.',
  },
  {
    id: 'b-2018',
    color: 'blue',
    shape: '━',
    date: '2018.4.2',
    body: '안개. 감지기 못 봄. 무적 손으로 켬. 06:00 이상 없음 보고됨.',
  },
  { id: 'b-2016', color: 'blue', shape: '━', date: FIRST_BLUE, body: PROCEDURE },
];

export function judgeTab(tab: { color: string; date: string }): 'ok' | 'short' | 'read' {
  if (tab.color !== 'blue') return 'read';
  return tab.date === FIRST_BLUE ? 'ok' : 'short';
}

export const PRESSURE_MS = 6000;
export const PRESSURE_TARGET = 7;
export const RHYTHM_LO = 1500;
export const RHYTHM_HI = 2500;
export const WEDGE_ID = '나무 쐐기';
export const HORN_TARGET = 'horn';

export function pressureAt(elapsedMs: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs) / PRESSURE_MS);
  return Math.round(t * PRESSURE_TARGET * 10) / 10;
}

export function drainShut(deg: number): boolean {
  return deg >= 170;
}

export function airOpen(deg: number): boolean {
  return deg >= 170;
}

export type HornAction = 'compressor' | 'drain' | 'air' | 'sound';

export function judgeHorn(
  step: number,
  action: HornAction,
  needle: number,
): { step: number; result: 'advance' | 'water' | 'weak' | 'wait' | 'ready' | 'ignore' } {
  if (action === 'compressor') {
    return step === 0 ? { step: 1, result: 'advance' } : { step, result: 'ignore' };
  }
  if (action === 'air' && step < 3) return { step: 0, result: 'water' };
  if (action === 'drain') {
    if (step < 2) return { step, result: 'wait' };
    if (step === 2) return { step: 3, result: 'advance' };
    return { step, result: 'ignore' };
  }
  if (action === 'air') {
    return step === 3 ? { step: 4, result: 'ready' } : { step, result: 'ignore' };
  }
  if (needle < PRESSURE_TARGET || step < 4) return { step, result: 'weak' };
  return { step, result: 'ready' };
}

export function inRhythmWindow(ms: number): boolean {
  return ms >= RHYTHM_LO && ms <= RHYTHM_HI;
}

export function judgeRhythm(spans: readonly { kind: string; ms: number }[]): 'ok' | 'no' {
  if (spans.length !== 3) return 'no';
  const [a, b, c] = spans;
  if (!a || !b || !c) return 'no';
  if (a.kind !== 'press' || b.kind !== 'rest' || c.kind !== 'press') return 'no';
  return [a, b, c].every((span) => inRhythmWindow(span.ms)) ? 'ok' : 'no';
}

/** Leave the horn room, or open the page again: compressor from the top. */
export function hornStepKept(step: number, present: boolean, solved: boolean): number {
  if (solved) return step;
  return present ? step : 0;
}

export function judgeWedge(
  itemId: string | null,
  targetId: string,
  items: readonly string[],
  step: number,
): 'ok' | 'early' | 'missing' | 'wrong' | 'ignore' {
  if (targetId !== HORN_TARGET) return 'ignore';
  if (step < 5) return 'early';
  if (itemId !== WEDGE_ID) return itemId ? 'wrong' : 'missing';
  if (!items.includes(WEDGE_ID)) return 'missing';
  return 'ok';
}

export const P8_ANSWER = ['3', '30초 2회', '제3해진호', '87.9'] as const;

export const P8_CARDS = [
  '1',
  '2',
  '3',
  '4',
  '6초 1회',
  '8초 1회',
  '30초 1회',
  '30초 2회',
  '해진 8호',
  '제3해진호',
  '87.6',
  '87.9',
  '88.5',
] as const;

export const P8_SLOTS = [0, 1, 2, 3].map((i) => ({
  id: String(i),
  x: 40 + i * 80,
  y: 40,
  r: 50,
}));

export function judgeBlank(index: number, label: string): 'ok' | 'no' {
  return P8_ANSWER[index] === label ? 'ok' : 'no';
}

export function logComplete(blanks: readonly (string | null)[]): boolean {
  return blanks.length === 4 && blanks.every((blank, i) => blank === P8_ANSWER[i]);
}

export function logClock(elapsedMs: number): string {
  const total = 2 * 60 * 60_000 + Math.max(0, elapsedMs);
  const h = Math.floor(total / 3_600_000) % 24;
  const m = Math.floor(total / 60_000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function captainAt10(solved: Record<string, boolean>): string | null {
  if (!solved.P3) return '아직 깜깜해요. 불 켜져 있는 거 맞아요?';
  if (!solved.P4) return '불은 보이는데요. 어느 불인지를 모르겠어요.';
  return null;
}

export function captainAt20(solved: Record<string, boolean>): string | null {
  if (!solved.P6) return '검은여까지 10분이요. 소리라도 좀.';
  return null;
}

export function captainAt25(solved: Record<string, boolean>): string | null {
  if (!solved.P7) return '이제 정해야 돼요. 들어갈지, 닻 내릴지.';
  return '수로 보여요. 고마워요.';
}

export function captainAt29(solved: Record<string, boolean>): string | null {
  if (!solved.P7) return '…1분.';
  return null;
}

export const TUBE_DOYUN = '라디오가 지직거리네. 도윤이 또 옥상 올라갔구먼.';

const ENDING_COPY: Record<string, { blurb: string; share: string }> = {
  A: { blurb: '30년의 마지막 줄을, 내 손으로 적었다.', share: '안개를 가르는 등탑 빛줄기' },
  B1: { blurb: '배는 아침까지 안개 속에서 기다렸다.', share: '희미한 불빛과 닻 내린 배' },
  B2: { blurb: '배는 들어왔지만, 마지막 장은 비어 있었다.', share: '빈 일지 장' },
};

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Gray-box result card. Share line is a caption, not an image. */
export function lighthouseResultLines(input: {
  endingId: string;
  title: string;
  elapsedMs: number;
  remainingMs: number;
  tube: number;
  trapOldChart: boolean;
  trapBoat8: boolean;
  trapRedSignal: boolean;
  solvedAt?: { P3: number; P6: number; P7: number };
}): string[] {
  const copy = ENDING_COPY[input.endingId] ?? { blurb: input.title, share: '' };
  const traps = [
    input.trapOldChart ? '옛 해도' : null,
    input.trapBoat8 ? '해진 8호' : null,
    input.trapRedSignal ? '빨간 등대에 신호' : null,
  ].filter((trap): trap is string => !!trap);
  const lines = [
    copy.blurb,
    `걸린 시간 ${mmss(input.elapsedMs)}`,
    `남은 시간 ${mmss(input.remainingMs)}`,
    `전성관 ${input.tube}번`,
    `도장 「${input.title}」`,
    `함정 발견 ${traps.length ? traps.join(' · ') : '없음'}`,
  ];
  if (input.endingId === 'A' && input.solvedAt) {
    lines.push(
      `내가 적은 시각 — 주등 ${logClock(input.solvedAt.P3)} · 무적 ${logClock(input.solvedAt.P6)} · 입항 ${logClock(input.solvedAt.P7)}`,
    );
  }
  if (input.endingId === 'B1' || input.endingId === 'B2') {
    lines.push('그날 밤, 해무 큰 등대의 마지막 일지는 비어 있었다.');
  }
  if (copy.share) lines.push(copy.share);
  return lines;
}

export function assertLighthouseAnswers(): void {
  if (judgeP1('1418') !== 'ok' || judgeP1('1416') !== 'chart' || judgeP1('1410') !== 'no') {
    throw new Error('P1');
  }
  if (judgeLevers([]) !== 'prefix' || judgeLevers(['red']) !== 'prefix') throw new Error('P2 prefix');
  if (judgeLevers(['red', 'yellow', 'green']) !== 'ok') throw new Error('P2 ok');
  if (judgeLevers(['yellow']) !== 'reset' || judgeLevers(['red', 'green']) !== 'reset') {
    throw new Error('P2 reset');
  }
  if (judgeLight(1) !== 'dead' || judgeLight(2) !== 'dim' || judgeLight(3) !== 'ok' || judgeLight(4) !== 'flash') {
    throw new Error('P3 light');
  }
  if (!focusAligned({ x: 0, y: 0 }) || focusAligned({ x: 0.6, y: -0.45 })) throw new Error('P3 focus');
  const shadow = shadowOf({ x: 0.2, y: -0.3 });
  if (shadow.x !== -0.2 || shadow.y !== 0.3) throw new Error('P3 shadow');
  if (judgeHold('boatB') !== 'ok' || judgeHold('boatA') !== 'trap' || judgeHold('red') !== 'look') {
    throw new Error('P4');
  }
  if (shipBearing(0) !== 135 || shipBearing(10_000) !== 138 || shipBearing(50_000) !== 135) {
    throw new Error('P7 ship');
  }
  if (shipBearingSince(5_000, 10_000) !== 135) throw new Error('P7 wait');
  if (judgeSignal(MORSE_U, ['boatB']) !== 'ok') throw new Error('P7 u');
  if (judgeSignal(MORSE_U, ['red']) !== 'red') throw new Error('P7 red');
  if (judgeSignal('·−', ['boatB']) !== 'no' || judgeSignal(MORSE_U, []) !== 'miss') throw new Error('P7 miss');
  const blue = TABS.find((tab) => tab.date === FIRST_BLUE);
  const other = TABS.find((tab) => tab.id === 'b-2021');
  const red = TABS.find((tab) => tab.id === 'r-2019');
  if (!blue || !other || !red) throw new Error('P5 tabs');
  if (judgeTab(blue) !== 'ok' || judgeTab(other) !== 'short' || judgeTab(red) !== 'read') throw new Error('P5');
  if (pressureAt(0) !== 0 || pressureAt(PRESSURE_MS) !== 7 || pressureAt(3000) !== 3.5) throw new Error('needle');
  const up = judgeHorn(0, 'compressor', 0);
  if (up.step !== 1 || up.result !== 'advance') throw new Error('horn on');
  if (judgeHorn(1, 'air', 3).result !== 'water' || judgeHorn(1, 'air', 3).step !== 0) throw new Error('horn water');
  if (judgeHorn(1, 'drain', 3).result !== 'wait') throw new Error('horn wait');
  if (judgeHorn(2, 'drain', 7).step !== 3) throw new Error('horn drain');
  if (judgeHorn(3, 'air', 7).step !== 4 || judgeHorn(3, 'air', 7).result !== 'ready') throw new Error('horn air');
  if (judgeHorn(2, 'sound', 4).result !== 'weak' || judgeHorn(4, 'sound', 7).result !== 'ready') {
    throw new Error('horn sound');
  }
  if (judgeRhythm([{ kind: 'press', ms: 2000 }, { kind: 'rest', ms: 2000 }, { kind: 'press', ms: 2000 }]) !== 'ok') {
    throw new Error('rhythm ok');
  }
  if (judgeRhythm([{ kind: 'press', ms: 1499 }, { kind: 'rest', ms: 2000 }, { kind: 'press', ms: 2000 }]) !== 'no') {
    throw new Error('rhythm lo');
  }
  if (judgeRhythm([{ kind: 'press', ms: 2501 }, { kind: 'rest', ms: 2000 }, { kind: 'press', ms: 2000 }]) !== 'no') {
    throw new Error('rhythm hi');
  }
  if (hornStepKept(3, false, false) !== 0 || hornStepKept(3, true, false) !== 3 || hornStepKept(4, false, true) !== 4) {
    throw new Error('horn leave');
  }
  if (judgeWedge(WEDGE_ID, HORN_TARGET, [WEDGE_ID], 5) !== 'ok') throw new Error('wedge');
  if (judgeWedge(WEDGE_ID, HORN_TARGET, [WEDGE_ID], 4) !== 'early') throw new Error('wedge early');
  if (judgeWedge(null, HORN_TARGET, [WEDGE_ID], 5) !== 'missing') throw new Error('wedge missing');
  if (judgeWedge('열쇠', HORN_TARGET, ['열쇠'], 5) !== 'wrong') throw new Error('wedge wrong');
  if (judgeWedge(WEDGE_ID, 'desk', [WEDGE_ID], 5) !== 'ignore') throw new Error('wedge ignore');
  if (judgeBlank(0, '3') !== 'ok' || judgeBlank(0, '4') !== 'no' || judgeBlank(3, '87.9') !== 'ok') {
    throw new Error('P8');
  }
  if (!logComplete([...P8_ANSWER]) || logComplete(['3', null, null, null])) throw new Error('P8 full');
  if (logClock(0) !== '02:00' || logClock(10 * 60_000) !== '02:10') throw new Error('clock');
  if (captainAt10({}) !== '아직 깜깜해요. 불 켜져 있는 거 맞아요?') throw new Error('cap10');
  if (captainAt10({ P3: true }) !== '불은 보이는데요. 어느 불인지를 모르겠어요.') throw new Error('cap10b');
  if (captainAt10({ P3: true, P4: true }) !== null) throw new Error('cap10c');
  if (captainAt20({}) !== '검은여까지 10분이요. 소리라도 좀.' || captainAt20({ P6: true }) !== null) {
    throw new Error('cap20');
  }
  if (captainAt25({}) !== '이제 정해야 돼요. 들어갈지, 닻 내릴지.') throw new Error('cap25');
  if (captainAt25({ P7: true }) !== '수로 보여요. 고마워요.') throw new Error('cap25b');
  if (captainAt29({}) !== '…1분.' || captainAt29({ P7: true }) !== null) throw new Error('cap29');
  const cardA = lighthouseResultLines({
    endingId: 'A',
    title: '다음 사람에게',
    elapsedMs: 125_000,
    remainingMs: 30 * 60_000 - 125_000,
    tube: 4,
    trapOldChart: true,
    trapBoat8: false,
    trapRedSignal: true,
    solvedAt: { P3: 60_000, P6: 120_000, P7: 180_000 },
  });
  if (cardA[0] !== '30년의 마지막 줄을, 내 손으로 적었다.') throw new Error('card A');
  if (!cardA.includes('전성관 4번') || !cardA.includes('도장 「다음 사람에게」')) throw new Error('card A stamp');
  if (!cardA.includes('함정 발견 옛 해도 · 빨간 등대에 신호')) throw new Error('card A trap');
  if (!cardA.includes('내가 적은 시각 — 주등 02:01 · 무적 02:02 · 입항 02:03')) throw new Error('card A time');
  if (!cardA.includes('안개를 가르는 등탑 빛줄기')) throw new Error('card A share');
  const cardB = lighthouseResultLines({
    endingId: 'B1',
    title: '안개 속 닻',
    elapsedMs: 30 * 60_000,
    remainingMs: 0,
    tube: 0,
    trapOldChart: false,
    trapBoat8: true,
    trapRedSignal: false,
  });
  if (cardB[0] !== '배는 아침까지 안개 속에서 기다렸다.') throw new Error('card B1');
  if (!cardB.includes('함정 발견 해진 8호')) throw new Error('card B1 trap');
  if (!cardB.includes('그날 밤, 해무 큰 등대의 마지막 일지는 비어 있었다.')) throw new Error('card B1 empty');
  if (!cardB.includes('희미한 불빛과 닻 내린 배')) throw new Error('card B1 share');
  const cardB2 = lighthouseResultLines({
    endingId: 'B2',
    title: '빈 일지',
    elapsedMs: 30 * 60_000,
    remainingMs: 0,
    tube: 1,
    trapOldChart: false,
    trapBoat8: false,
    trapRedSignal: false,
  });
  if (cardB2[0] !== '배는 들어왔지만, 마지막 장은 비어 있었다.') throw new Error('card B2');
  if (!cardB2.includes('함정 발견 없음') || !cardB2.includes('빈 일지 장')) throw new Error('card B2 rest');
}
