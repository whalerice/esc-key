import type { ThemeDefinition } from '@/engine/types';

export const themeDarkroom: ThemeDefinition = {
  id: 'neulbom-darkroom',
  world: 'neulbom',
  title: '붉은 방',
  lengthMin: 30,
  gate: { label: '암실에 들어가기', needs: ['orientation'] },
  timer: { skin: 'darkroom', durationMs: 30 * 60_000, onZero: 'C' },
  hud: {
    inventoryName: '소지품',
    hintChannel: 'rotary-phone',
    notebook: true,
  },
  scenes: [{ id: 'darkroom', background: '#1a0505' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [{ id: 'C', title: '엔딩 C', condition: 'timer-zero' }],
  assets: [],
};
