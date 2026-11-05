'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';

export type Extra112 = {
  roofOpen: boolean;
  /** Slice stub: attic reachable after P1 without P2–P7. */
  atticReachable: boolean;
};

export function initialSave(): ThemeSave<Extra112> {
  return {
    version: 1,
    scene: 'workshop',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: { roofOpen: false, atticReachable: false },
  };
}

/** Persist key: escape:neulbom-112 */
export const use112Store = createThemeStore<Extra112>(
  'neulbom-112',
  initialSave(),
);
