/** Theme / engine shared types. Spec: docs/공통엔진.md §12–§13. */

export type ThemeId = string;
export type SceneId = string;
export type PuzzleId = string;
export type ItemId = string;
export type EndingId = string;

export type WorldId = 'neulbom' | 'haemu' | 'standalone';

export type TimerSkin =
  | 'none'
  | 'thermometer'
  | 'darkroom'
  | 'battery'
  | 'wallclock';

export type HintChannelSkin =
  | 'author-notebook'
  | 'radio'
  | 'rotary-phone'
  | 'extension'
  | 'guard-phone';

export type GateNeed = 'mic' | 'orientation';

export type NoteEntry = {
  id: string;
  text: string;
  icon?: string;
};

export type HintDef = {
  intro?: string;
  steps: [string, string, string];
};

export type EventTrigger =
  | { solved: PuzzleId }
  | { stalledMin: number }
  | { timerLeftMin: number }
  | { item: ItemId }
  | { enterScene: SceneId };

export type EventDef = {
  on: EventTrigger;
  run: string[];
};

export type EndingDef = {
  id: EndingId;
  title: string;
  condition: string;
  scenes?: SceneId[];
};

export type SceneDef = {
  id: SceneId;
  /** Background fill used for letterboxing (logical 1920×1080 contain). */
  background?: string;
};

export type PuzzleDef = {
  id: PuzzleId;
  scene: SceneId;
  /** Widget / answer wiring lives in theme puzzle code — stub only. */
  widget?: string;
};

export type AssetBundleDef = {
  scene: SceneId;
  urls: string[];
};

export type ThemeDefinition<TExtra = unknown> = {
  id: ThemeId;
  world: WorldId;
  title: string;
  lengthMin: 30 | 60;
  gate: { label: string; needs: GateNeed[] };
  timer: { skin: TimerSkin; durationMs?: number; onZero?: EndingId };
  hud: {
    inventoryName: string;
    hintChannel: HintChannelSkin;
    notebook: boolean;
  };
  scenes: SceneDef[];
  puzzles: PuzzleDef[];
  hints: Record<PuzzleId, HintDef>;
  events: EventDef[];
  endings: EndingDef[];
  assets: AssetBundleDef[];
  extra?: { initial: TExtra; migrate?: (old: unknown) => TExtra };
};

export type AppSettings = {
  bigText: boolean;
  oneHand: boolean;
  hearingAssist: boolean;
  sfx: number;
  bgm: number;
  voice: number;
  reduceEffects: boolean;
};

export type AppSave = {
  settings: AppSettings;
  homeScreenTipDismissed: boolean;
  cleared: Record<
    ThemeId,
    { ending: string; timeMs: number; hints: number }[]
  >;
};

export type ThemeSave<TExtra = unknown> = {
  version: number;
  scene: SceneId;
  solved: Record<PuzzleId, boolean>;
  items: ItemId[];
  notebook: NoteEntry[];
  hintsUsed: Record<PuzzleId, 0 | 1 | 2 | 3>;
  timer: { elapsedMs: number; bonusPausedMs: number; penaltyMs: number };
  flags: Record<string, boolean>;
  extra: TExtra;
};

/** Logical stage size — docs/공통엔진.md §6. */
export const LOGICAL_WIDTH = 1920;
export const LOGICAL_HEIGHT = 1080;

/** Dead zones (CSS px at 360px-tall landscape baseline). */
export const DEAD_ZONE = { left: 24, right: 24, bottom: 20 } as const;

export const MIN_HIT = 44;

export const SAVE_KEY_PREFIX = 'escape:';

export function saveKey(themeId: ThemeId): string {
  return `${SAVE_KEY_PREFIX}${themeId}`;
}
