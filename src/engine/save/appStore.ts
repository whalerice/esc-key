'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSave, AppSettings, ThemeId } from '@/engine/types';

const defaultSettings: AppSettings = {
  bigText: false,
  oneHand: false,
  hearingAssist: false,
  sfx: 1,
  bgm: 1,
  voice: 1,
  reduceEffects: false,
};

type AppState = AppSave & {
  setSettings: (partial: Partial<AppSettings>) => void;
  dismissHomeScreenTip: () => void;
  recordClear: (
    themeId: ThemeId,
    entry: { ending: string; timeMs: number; hints: number },
  ) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      homeScreenTipDismissed: false,
      cleared: {},
      setSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      dismissHomeScreenTip: () => set({ homeScreenTipDismissed: true }),
      recordClear: (themeId, entry) =>
        set((s) => ({
          cleared: {
            ...s.cleared,
            [themeId]: [...(s.cleared[themeId] ?? []), entry],
          },
        })),
    }),
    { name: 'escape:app' },
  ),
);
