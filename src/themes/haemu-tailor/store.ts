'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type TailorExtra } from './extra';
import { ITEM_CASE, ITEM_TICKET } from './puzzles/answers';

export type { TailorExtra } from './extra';

export function initialSave(): ThemeSave<TailorExtra> {
  return {
    version: 2,
    scene: 'shop',
    solved: {},
    items: [ITEM_TICKET, ITEM_CASE],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    extra: initialExtra,
  };
}

/** Persist key: escape:haemu-tailor. v1 was the stub save and resets. */
export const useTailorStore = createThemeStore<TailorExtra>('haemu-tailor', initialSave());
