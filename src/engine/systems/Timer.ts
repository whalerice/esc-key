/**
 * Fair timer + clock skins. Spec: docs/개발/공통엔진_v1.md §8-6, §9, §19-13.
 * Portrait / background / system overlay time is not counted.
 */

export type TimerState = {
  elapsedMs: number;
  bonusPausedMs: number;
  penaltyMs: number;
};

export type TimerSkinName =
  | 'none'
  | 'thermometer'
  | 'darkroom'
  | 'battery'
  | 'wallclock'
  | 'onair-clock'
  | 'watch-clock'
  | 'thread-spool';

export function remainingMs(
  durationMs: number,
  t: TimerState,
  pausedAccumMs = 0,
): number {
  const used = t.elapsedMs + t.penaltyMs - t.bonusPausedMs - pausedAccumMs;
  return Math.max(0, durationMs - used);
}

export function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** '02:00' or '02:00:08' → ms from 00:00. */
export function parseClockMs(text: string): number | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const s = Number(m[3] ?? 0);
  if (min > 59 || s > 59 || h > 99) return null;
  return ((h * 60 + min) * 60 + s) * 1000;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const s = total % 60;
  const min = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Cue `at` minus the bed's start clock. Spec §19-6. */
export function cueOffsetMs(at: string, startClock: string): number | null {
  const cue = parseClockMs(at);
  const start = parseClockMs(startClock);
  if (cue == null || start == null) return null;
  return cue - start;
}

export type OnZeroInput =
  | string
  | { if?: { solved: string }; ending: string }[]
  | undefined;

/** First matching rule wins. A rule without `if` is the default. */
export function resolveOnZero(
  onZero: OnZeroInput,
  solved: Record<string, boolean>,
): string | null {
  if (onZero == null) return null;
  if (typeof onZero === 'string') return onZero;
  for (const rule of onZero) {
    if (!rule.if || solved[rule.if.solved]) return rule.ending;
  }
  return null;
}

export type TimerFaceInput = {
  skin: TimerSkinName;
  durationMs?: number;
  elapsedMs: number;
  bonusPausedMs?: number;
  penaltyMs?: number;
  startClock?: string;
  /** Ending freeze. Replaces the drawn clock only. */
  displayOverride?: string;
  watchLamp?: 'standby' | 'main';
};

export type TimerFaceModel = {
  skin: TimerSkinName;
  label: string;
  warn: boolean;
  blink: boolean;
  ratio: number;
  step: number;
  redCore: boolean;
  flutter: boolean;
  lamp: 'on' | 'blink' | 'off';
  watchLamp: 'standby' | 'main';
};

const CLOCK_SKINS = new Set<TimerSkinName>(['onair-clock', 'watch-clock']);

/**
 * Clock skins draw startClock + fair used time (so 10 min left is 02:20).
 * `displayOverride` replaces that text.
 */
export function timerFace(input: TimerFaceInput): TimerFaceModel {
  const state: TimerState = {
    elapsedMs: input.elapsedMs,
    bonusPausedMs: input.bonusPausedMs ?? 0,
    penaltyMs: input.penaltyMs ?? 0,
  };
  const rem =
    input.durationMs == null ? null : remainingMs(input.durationMs, state);
  const used =
    input.durationMs != null && rem != null
      ? input.durationMs - rem
      : input.elapsedMs;
  const ratio =
    input.durationMs != null && rem != null && input.durationMs > 0
      ? rem / input.durationMs
      : 1;
  const warn = rem != null && rem > 0 && rem <= 10 * 60_000;
  const blink = rem != null && rem > 0 && rem <= 60_000;
  const zero = rem === 0;
  const clock = clockText(input, used);
  const label =
    clock ??
    (rem == null ? '' : formatMmSs(rem));
  const step = zero ? 0 : Math.max(1, Math.min(6, Math.ceil(ratio * 6)));
  const clockSkin = CLOCK_SKINS.has(input.skin);
  return {
    skin: input.skin,
    label,
    warn: clockSkin || input.skin === 'thread-spool' ? warn : false,
    blink: clockSkin || input.skin === 'thread-spool' ? blink : false,
    ratio,
    step,
    redCore: input.skin === 'thread-spool' && warn,
    flutter: input.skin === 'thread-spool' && blink,
    lamp: !clockSkin ? 'off' : zero ? 'off' : blink ? 'blink' : 'on',
    watchLamp: input.watchLamp ?? 'standby',
  };
}

function clockText(input: TimerFaceInput, usedMs: number): string | null {
  const clockSkin =
    CLOCK_SKINS.has(input.skin) || input.skin === 'thread-spool';
  if (!clockSkin && !input.displayOverride && !input.startClock) return null;
  if (input.skin !== 'thread-spool' && !CLOCK_SKINS.has(input.skin)) {
    return null;
  }
  if (input.displayOverride) {
    const parsed = parseClockMs(input.displayOverride);
    return parsed == null ? input.displayOverride : formatClock(parsed);
  }
  if (!input.startClock) return null;
  const start = parseClockMs(input.startClock);
  if (start == null) return input.startClock;
  return formatClock(start + usedMs);
}

export class TimerController {
  private state: TimerState;
  private durationMs: number | undefined;
  private running = false;
  private base = 0;
  private startedAt = 0;
  private pausedAccum = 0;
  private pauseStarted: number | null = null;

  constructor(durationMs: number | undefined, state: TimerState) {
    this.durationMs = durationMs;
    this.state = { ...state };
    this.base = state.elapsedMs;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.base = this.state.elapsedMs;
    this.startedAt = performance.now();
    this.pausedAccum = 0;
    this.pauseStarted = null;
  }

  /** No-arg: system pause. With ms: theme bonus freeze (`timer.pause(ms)`). */
  pause(ms?: number): void {
    if (typeof ms === 'number') {
      this.state.bonusPausedMs += Math.max(0, ms);
      return;
    }
    if (!this.running || this.pauseStarted != null) return;
    this.pauseStarted = performance.now();
    this.state.elapsedMs = this.elapsed();
  }

  resume(): void {
    if (this.pauseStarted == null) return;
    this.pausedAccum += performance.now() - this.pauseStarted;
    this.pauseStarted = null;
  }

  penalty(ms: number): void {
    this.state.penaltyMs += ms;
  }

  elapsed(): number {
    if (!this.running) return this.state.elapsedMs;
    const end = this.pauseStarted ?? performance.now();
    return this.base + Math.max(0, end - this.startedAt - this.pausedAccum);
  }

  snapshot(): TimerState {
    return {
      elapsedMs: this.elapsed(),
      bonusPausedMs: this.state.bonusPausedMs,
      penaltyMs: this.state.penaltyMs,
    };
  }

  remaining(): number | null {
    if (this.durationMs == null) return null;
    return remainingMs(this.durationMs, this.snapshot());
  }
}
