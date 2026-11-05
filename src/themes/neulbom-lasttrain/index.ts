import type { ThemeDefinition } from '@/engine/types';

export const themeLasttrain: ThemeDefinition = {
  id: 'neulbom-lasttrain',
  world: 'neulbom',
  title: '막차 이후',
  lengthMin: 30,
  gate: { label: '문 열기', needs: [] },
  timer: { skin: 'battery', durationMs: 30 * 60_000, onZero: 'B' },
  hud: {
    inventoryName: '서랍',
    hintChannel: 'extension',
    notebook: true,
  },
  scenes: [{ id: 'lost-and-found', background: '#12141a' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [{ id: 'B', title: '엔딩 B', condition: 'timer-zero' }],
  assets: [],
};
