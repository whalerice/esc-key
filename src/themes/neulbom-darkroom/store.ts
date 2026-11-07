'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type DarkroomExtra } from './extra';

export type { DarkroomExtra } from './extra';

export function initialSave(): ThemeSave<DarkroomExtra> {
  return {
    version: 1,
    scene: 'darkroom',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:neulbom-darkroom. */
export const useDarkroomStore = createThemeStore<DarkroomExtra>(
  'neulbom-darkroom',
  initialSave(),
);
