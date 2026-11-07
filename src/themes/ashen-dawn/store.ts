'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type AshExtra } from './extra';

export type { AshExtra } from './extra';

export function initialSave(): ThemeSave<AshExtra> {
  return {
    version: 1,
    scene: 'desk',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:ashen-dawn. */
export const useAshStore = createThemeStore<AshExtra>('ashen-dawn', initialSave());
