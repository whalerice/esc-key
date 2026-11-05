'use client';

import { useMemo } from 'react';
import { ThemePlay } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import { createThemeStore } from '@/engine/save/createThemeStore';
import type { ThemeDefinition, ThemeSave } from '@/engine/types';
import type { SceneMount } from '@/engine/ui/SceneMount';

const stubInitial = (scene: string): ThemeSave => ({
  version: 1,
  scene,
  solved: {},
  items: [],
  notebook: [],
  hintsUsed: {},
  timer: { elapsedMs: 0, bonusPausedMs: 0, penaltyMs: 0 },
  flags: {},
  extra: {},
});

const stubMount: SceneMount = ({ say }) => {
  say('엔진 스텁 — 테마 장면은 아직 없음. 탭해서 넘기기.');
  return () => undefined;
};

/** Unfinished themes: gate + HUD only. */
export function StubThemePlay({ theme }: { theme: ThemeDefinition }) {
  const useStore = useMemo(
    () =>
      createThemeStore(theme.id, stubInitial(theme.scenes[0]?.id ?? 'stub')),
    [theme],
  );

  return (
    <ThemePlay
      theme={theme}
      useStore={useStore as unknown as ThemePlayStore}
      mountScene={stubMount}
    />
  );
}
