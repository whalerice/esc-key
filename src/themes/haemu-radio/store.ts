'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type RadioExtra } from './extra';

export type { RadioExtra } from './extra';

export function initialSave(): ThemeSave<RadioExtra> {
  return {
    version: 1,
    scene: 'control',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:haemu-radio. `radioFreq` / `txFreq` are stripped if they appear. */
export const useRadioStore = createThemeStore<RadioExtra>('haemu-radio', initialSave());
