'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ItemId,
  PuzzleId,
  SceneId,
  ThemeId,
  ThemeSave,
} from '@/engine/types';
import { saveKey } from '@/engine/types';
import { migrateOrReset } from './migrate';

export type ThemeStoreApi<TExtra> = ThemeSave<TExtra> & {
  setScene: (scene: SceneId) => void;
  markSolved: (puzzleId: PuzzleId) => void;
  addItem: (itemId: ItemId) => void;
  setHintStep: (puzzleId: PuzzleId, step: 0 | 1 | 2 | 3) => void;
  setFlag: (key: string, value?: boolean) => void;
  patchTimer: (partial: Partial<ThemeSave['timer']>) => void;
  patchExtra: (partial: Partial<TExtra>) => void;
  reset: (initial: ThemeSave<TExtra>) => void;
};

export function createThemeStore<TExtra>(
  themeId: ThemeId,
  initial: ThemeSave<TExtra>,
  migrate?: (old: unknown) => ThemeSave<TExtra>,
) {
  const key = saveKey(themeId);

  return create<ThemeStoreApi<TExtra>>()(
    persist(
      (set) => ({
        ...initial,
        setScene: (scene) => set({ scene }),
        markSolved: (puzzleId) =>
          set((s) => ({
            solved: { ...s.solved, [puzzleId]: true },
          })),
        addItem: (itemId) =>
          set((s) =>
            s.items.includes(itemId) ? s : { items: [...s.items, itemId] },
          ),
        setHintStep: (puzzleId, step) =>
          set((s) => ({
            hintsUsed: { ...s.hintsUsed, [puzzleId]: step },
          })),
        setFlag: (flagKey, value = true) =>
          set((s) => ({ flags: { ...s.flags, [flagKey]: value } })),
        patchTimer: (partial) =>
          set((s) => ({ timer: { ...s.timer, ...partial } })),
        patchExtra: (partial) =>
          set((s) => ({
            extra: { ...s.extra, ...partial } as TExtra,
          })),
        reset: (next) => set({ ...next }),
      }),
      {
        name: key,
        version: initial.version,
        migrate: (persisted, _from) => {
          const next = migrateOrReset<ThemeSave<TExtra>>(
            persisted,
            initial.version,
            migrate,
          );
          return (next ?? initial) as ThemeStoreApi<TExtra>;
        },
      },
    ),
  );
}

/** Read saved progress outside the theme page (hub “이어 하기”). */
export function readThemeSave<TExtra = unknown>(
  themeId: ThemeId,
): ThemeSave<TExtra> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(saveKey(themeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: ThemeSave<TExtra> };
    return parsed.state ?? (parsed as ThemeSave<TExtra>);
  } catch {
    return null;
  }
}
