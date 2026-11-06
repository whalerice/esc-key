import type { ThemeDefinition } from '@/engine/types';

/** Route stub. Puzzle play is not this file. */
export const themeHaemuRadio: ThemeDefinition = {
  id: 'haemu-radio',
  world: 'haemu',
  title: '심야 라디오',
  lengthMin: 30,
  gate: { label: '부조정실 문 열기', needs: [] },
  timer: {
    skin: 'onair-clock',
    durationMs: 30 * 60_000,
    startClock: '02:00',
    onZero: 'B',
  },
  hud: { inventoryName: '가방', hintChannel: 'messenger', notebook: true },
  hintChannels: [{ skin: 'walkie', fromPuzzle: 'P7' }],
  scenes: [{ id: 'control', background: '#140c0c' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [{ id: 'B', title: '송출 종료', condition: 'timer-zero' }],
  assets: [],
};
