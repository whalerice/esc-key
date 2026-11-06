import type { ThemeDefinition } from '@/engine/types';

/** Route stub. */
export const themeHaemuLighthouse: ThemeDefinition = {
  id: 'haemu-lighthouse',
  world: 'haemu',
  title: '등대지기의 마지막 일지',
  lengthMin: 30,
  gate: { label: '당직실 문 두드리기', needs: [] },
  timer: {
    skin: 'watch-clock',
    durationMs: 30 * 60_000,
    startClock: '02:00',
    onZero: [{ if: { solved: 'P7' }, ending: 'B2' }, { ending: 'B1' }],
  },
  hud: {
    inventoryName: '주머니',
    hintChannel: 'speaking-tube',
    notebook: true,
  },
  scenes: [{ id: 'duty', background: '#12100c' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [
    { id: 'B1', title: '안개 속 닻', condition: 'timer-zero' },
    { id: 'B2', title: '빈 일지', condition: 'timer-zero' },
  ],
  assets: [],
};
