import type { ThemeDefinition } from '@/engine/types';

export const themeGreenhouse: ThemeDefinition = {
  id: 'neulbom-greenhouse',
  world: 'neulbom',
  title: '겨울 온실',
  lengthMin: 30,
  gate: { label: '온실 문 열기', needs: ['mic'] },
  timer: { skin: 'thermometer', durationMs: 30 * 60_000, onZero: 'B' },
  hud: {
    inventoryName: '소지품',
    hintChannel: 'radio',
    notebook: true,
  },
  scenes: [{ id: 'greenhouse', background: '#0e1a14' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [{ id: 'B', title: '엔딩 B', condition: 'timer-zero' }],
  assets: [],
};
