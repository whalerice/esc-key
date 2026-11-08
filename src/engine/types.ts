/** Theme / engine shared types. Spec: docs/개발/공통엔진_v1.md §12–§13. */

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
  | 'wallclock'
  | 'onair-clock'
  | 'watch-clock'
  | 'thread-spool';

export type HintChannelSkin =
  | 'author-notebook'
  | 'radio'
  | 'rotary-phone'
  | 'extension'
  | 'guard-phone'
  | 'messenger'
  | 'walkie'
  | 'speaking-tube'
  | 'thimble';

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

/** First matching rule wins. No `if` = default. Spec §8-6. */
export type OnZeroRule = {
  if?: { solved: PuzzleId };
  ending: EndingId;
};

export type FloorStop = {
  id: string;
  name: string;
  /** Color band. Theme skin. */
  band?: string;
};

export type FloorNavDef = {
  floors: FloorStop[];
  start?: string;
};

/** Clock cues only. Clue audio is HTML5, not this queue. Spec §19-6. */
export type RadioBedDef = {
  cues: { at: string; soundId: string }[];
};

export type ThemeDefinition<TExtra = unknown> = {
  id: ThemeId;
  world: WorldId;
  title: string;
  lengthMin: 30 | 60;
  gate: { label: string; needs: GateNeed[] };
  timer: {
    skin: TimerSkin;
    durationMs?: number;
    /** Clock face start, e.g. '02:00'. Spec §8-6. */
    startClock?: string;
    /** Freeze the drawn clock (ending). Spec §8-6. */
    displayOverride?: string;
    onZero?: EndingId | OnZeroRule[];
  };
  hud: {
    inventoryName: string;
    hintChannel: HintChannelSkin;
    notebook: boolean;
    floorNav?: FloorNavDef;
    /** Scenes that collapse HUD. Spec §19-11. */
    collapsibleIn?: SceneId[];
  };
  scenes: SceneDef[];
  puzzles: PuzzleDef[];
  hints: Record<PuzzleId, HintDef>;
  /** New channel from this puzzle onward. Radio: walkie from P7 (switch fires when P6 solves). */
  hintChannels?: { skin: HintChannelSkin; fromPuzzle: PuzzleId }[];
  smallTalk?: Partial<Record<HintChannelSkin, string[]>>;
  radioBed?: RadioBedDef;
  events: EventDef[];
  endings: EndingDef[];
  assets: AssetBundleDef[];
  extra?: { initial: TExtra; migrate?: (old: unknown) => TExtra };
};

/** Dropped on save. Spec §12-2. Frequency, beam, pressure, and mid-sew needle stay out of `extra`. */
export const EPHEMERAL_EXTRA_KEYS = [
  'radioFreq',
  'txFreq',
  'beamDeg',
  'morseCode',
  'pressure',
  'stitchProgress',
  'needlePos',
  'activeStitches',
  'threadTension',
  'pedalSpeed',
  'clothX',
  'clothAngle',
  /** Last train. Phone open is UI. Design §9-6 does not save it. */
  'phoneOpen',
  /** 1/12. Zoom, dials, magnet order, card order, and the tape on the frame are redone. */
  'zoomScale',
  'dialDigits',
  'magnetOrder',
  'sortOrder',
  'tapeOnFrame',
] as const;

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
  /**
   * Remaining bottom-strip lines. Restored on resume so the room and caption match.
   * `undefined` = never seeded (fresh or pre-field save). `[]` = openings finished.
   */
  captionQueue?: { text: string; kind: 'narration' | 'dialogue'; speaker?: string }[];
  extra: TExtra;
};

/** Logical stage size — docs/개발/공통엔진_v1.md §6. */
export const LOGICAL_WIDTH = 1920;
export const LOGICAL_HEIGHT = 1080;

/** Dead zones (CSS px at 360px-tall landscape baseline). */
export const DEAD_ZONE = { left: 24, right: 24, bottom: 20 } as const;

export const MIN_HIT = 44;

export const SAVE_KEY_PREFIX = 'escape:';

export function saveKey(themeId: ThemeId): string {
  return `${SAVE_KEY_PREFIX}${themeId}`;
}

/** Drop instantaneous values before they hit storage or `extra`. Spec §12-2. */
export function withoutEphemeralExtra<T>(extra: T): T {
  if (!extra || typeof extra !== 'object') return extra;
  const copy = { ...(extra as Record<string, unknown>) };
  for (const key of EPHEMERAL_EXTRA_KEYS) delete copy[key];
  return copy as T;
}
