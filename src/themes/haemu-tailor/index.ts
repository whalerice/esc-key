import type { ThemeDefinition } from '@/engine/types';

/** Route stub. */
export const themeHaemuTailor: ThemeDefinition = {
  id: 'haemu-tailor',
  world: 'haemu',
  title: '한 땀',
  lengthMin: 30,
  gate: { label: '가게 문 열기', needs: [] },
  timer: {
    skin: 'thread-spool',
    durationMs: 30 * 60_000,
    displayOverride: '21:30',
    onZero: 'B1',
  },
  hud: { inventoryName: '반짇고리', hintChannel: 'thimble', notebook: true },
  scenes: [{ id: 'shop', background: '#12141c' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [{ id: 'B1', title: '엔딩 B', condition: 'timer-zero' }],
  assets: [],
};
