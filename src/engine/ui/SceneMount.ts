/** Theme scene mount contract — ThemePlay owns HUD/save; theme draws Pixi world. */
import type { Application } from 'pixi.js';
import type { PuzzleId, ThemeDefinition } from '@/engine/types';
import type { ThemeStoreApi } from '@/engine/save/createThemeStore';
import type { SayFn } from '@/engine/ui/caption';

export type SceneMountContext = {
  app: Application;
  theme: ThemeDefinition;
  store: ThemeStoreApi<unknown>;
  getState: () => ThemeStoreApi<unknown>;
  say: SayFn;
  openPuzzle: (id: PuzzleId) => void;
  closePuzzle: () => void;
  onSolved: (id: PuzzleId) => void;
};

export type SceneMount = (ctx: SceneMountContext) => () => void;
