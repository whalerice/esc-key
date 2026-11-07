'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type LasttrainExtra } from './extra';

export type { LasttrainExtra } from './extra';

export function initialSave(): ThemeSave<LasttrainExtra> {
  return {
    version: 2,
    scene: 'counter',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:neulbom-lasttrain. v1 was the stub save and resets. */
export const useLasttrainStore = createThemeStore<LasttrainExtra>(
  'neulbom-lasttrain',
  initialSave(),
);
