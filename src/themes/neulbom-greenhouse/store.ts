'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type GreenhouseExtra } from './extra';

export type { GreenhouseExtra } from './extra';

export function initialSave(): ThemeSave<GreenhouseExtra> {
  return {
    version: 2,
    scene: 'foyer',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:neulbom-greenhouse. v1 was the stub save and resets. */
export const useGreenhouseStore = createThemeStore<GreenhouseExtra>(
  'neulbom-greenhouse',
  initialSave(),
);
