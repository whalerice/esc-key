'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type Extra112 } from './extra';

export type { Extra112 } from './extra';

export function initialSave(): ThemeSave<Extra112> {
  return {
    version: 2,
    scene: 'workshop',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:neulbom-112. v1 skipped the attic after P1 and resets. */
export const use112Store = createThemeStore<Extra112>('neulbom-112', initialSave());
