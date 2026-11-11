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
import { saveKey, withoutEphemeralExtra } from '@/engine/types';
import { migrateOrReset } from './migrate';

export type ThemeStoreApi<TExtra> = ThemeSave<TExtra> & {
  setScene: (scene: SceneId) => void;
  markSolved: (puzzleId: PuzzleId) => void;
  addItem: (itemId: ItemId) => void;
  setHintStep: (puzzleId: PuzzleId, step: 0 | 1 | 2 | 3) => void;
  setFlag: (key: string, value?: boolean) => void;
  patchTimer: (partial: Partial<ThemeSave['timer']>) => void;
  patchExtra: (partial: Partial<TExtra>) => void;
  setCaptionQueue: (queue: NonNullable<ThemeSave['captionQueue']>) => void;
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
            extra: withoutEphemeralExtra({ ...s.extra, ...partial } as TExtra),
          })),
        setCaptionQueue: (captionQueue) => set({ captionQueue }),
        reset: (next) =>
          set({
            ...next,
            captionQueue: next.captionQueue ?? [],
          }),
      }),
      {
        name: key,
        version: initial.version,
        partialize: (state) => {
          const {
            setScene: _setScene,
            markSolved: _markSolved,
            addItem: _addItem,
            setHintStep: _setHintStep,
            setFlag: _setFlag,
            patchTimer: _patchTimer,
            patchExtra: _patchExtra,
            setCaptionQueue: _setCaptionQueue,
            reset: _reset,
            extra,
            ...data
          } = state;
          return { ...data, extra: withoutEphemeralExtra(extra) };
        },
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

type WipeStore<TExtra> = {
  getState: () => { reset: (initial: ThemeSave<TExtra>) => void };
  persist?: {
    clearStorage?: () => void | Promise<void>;
    getOptions?: () => { name?: string };
  };
};

/** Set while wiping so ThemePlay unmount cannot re-persist the old timer. */
let wipingTheme = false;

export function isThemeWiping(): boolean {
  return wipingTheme;
}

/** Memory + localStorage wipe, then hard reload so gate/timer/captions boot clean. */
export function wipeAndReload<TExtra>(
  store: WipeStore<TExtra>,
  initial: ThemeSave<TExtra>,
): void {
  wipingTheme = true;
  store.getState().reset(initial);
  const name = store.persist?.getOptions?.()?.name;
  const nuke = () => {
    try {
      if (name && typeof localStorage !== 'undefined') localStorage.removeItem(name);
      void store.persist?.clearStorage?.();
    } catch {
      /* ignore storage errors; reload still boots from missing key */
    }
  };
  nuke();
  window.addEventListener('pagehide', nuke);
  window.addEventListener('beforeunload', nuke);
  window.location.reload();
}

/** True when a hydrated save is past a fresh start (resume, not first boot). */
export function hasThemeProgress(
  save: Pick<ThemeSave, 'scene' | 'solved' | 'items' | 'timer' | 'flags' | 'hintsUsed'>,
  startScene?: SceneId,
): boolean {
  if (save.timer.elapsedMs > 0) return true;
  if (save.items.length > 0) return true;
  if (Object.values(save.solved).some(Boolean)) return true;
  if (Object.values(save.flags).some(Boolean)) return true;
  if (Object.values(save.hintsUsed).some((step) => (step ?? 0) > 0)) return true;
  if (startScene && save.scene !== startScene) return true;
  return false;
}

export function assertHasThemeProgress(): void {
  const blank = {
    scene: 'control' as SceneId,
    solved: {},
    items: [] as string[],
    timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
    flags: {},
    hintsUsed: {},
  };
  if (hasThemeProgress(blank, 'control')) throw new Error('fresh');
  if (!hasThemeProgress({ ...blank, timer: { ...blank.timer, elapsedMs: 1 } }, 'control')) {
    throw new Error('timer');
  }
  if (!hasThemeProgress({ ...blank, scene: 'booth' }, 'control')) throw new Error('scene');
  if (!hasThemeProgress({ ...blank, solved: { P1: true } }, 'control')) throw new Error('solved');
  if (!hasThemeProgress({ ...blank, items: ['key'] }, 'control')) throw new Error('items');
  if (!hasThemeProgress({ ...blank, flags: { endingA: true } }, 'control')) throw new Error('flags');
  if (!hasThemeProgress({ ...blank, hintsUsed: { P1: 1 } }, 'control')) throw new Error('hints');
}
