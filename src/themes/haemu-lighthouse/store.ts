'use client';

import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeSave } from '@/engine/types';
import { initialExtra, type LighthouseExtra } from './extra';

export type { LighthouseExtra } from './extra';

export function initialSave(): ThemeSave<LighthouseExtra> {
  return {
    version: 2,
    scene: 'f1',
    solved: {},
    items: [],
    notebook: [],
    hintsUsed: {},
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: { v1: true },
    extra: initialExtra,
  };
}

/** Persist key: escape:haemu-lighthouse. v1 was the stub save and resets. */
export const useLighthouseStore = createThemeStore<LighthouseExtra>(
  'haemu-lighthouse',
  initialSave(),
);
