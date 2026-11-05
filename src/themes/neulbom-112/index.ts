import type { ThemeDefinition, ThemeSave } from '@/engine/types';

/** Stub theme — 1/12. Full design: docs/늘봄. No puzzles yet. */
export const theme112: ThemeDefinition = {
  id: 'neulbom-112',
  world: 'neulbom',
  title: '1/12',
  lengthMin: 30,
  gate: { label: '공방 문 열기', needs: [] },
  timer: { skin: 'none' },
  hud: {
    inventoryName: '부품함',
    hintChannel: 'author-notebook',
    notebook: false,
  },
  scenes: [{ id: 'workshop', background: '#1a1510' }],
  puzzles: [],
  hints: {},
  events: [],
  endings: [{ id: 'A', title: '엔딩 A', condition: 'stub' }],
  assets: [],
  extra: { initial: {} },
};

export function initialSave(): ThemeSave {
  return {
    version: 1,
    scene: 'workshop',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: {},
  };
}
