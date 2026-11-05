/**
 * Fair wall-clock timer stub. Spec: docs/공통엔진.md §8-6, §9.
 * Pause intervals (portrait, background, system overlay) excluded later.
 */

export type TimerState = {
  elapsedMs: number;
  bonusPausedMs: number;
  penaltyMs: number;
};

export function remainingMs(
  durationMs: number,
  t: TimerState,
  pausedAccumMs = 0,
): number {
  const used = t.elapsedMs + t.penaltyMs - t.bonusPausedMs - pausedAccumMs;
  return Math.max(0, durationMs - used);
}

export function formatMmSs(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export class TimerController {
  private running = false;
  private startedAt = 0;
  private pausedAccum = 0;
  private pauseStarted: number | null = null;

  constructor(
    private durationMs: number | undefined,
    private state: TimerState,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.startedAt = performance.now();
  }

  pause(): void {
    if (!this.running || this.pauseStarted != null) return;
    this.pauseStarted = performance.now();
  }

  resume(): void {
    if (this.pauseStarted == null) return;
    this.pausedAccum += performance.now() - this.pauseStarted;
    this.pauseStarted = null;
  }

  penalty(ms: number): void {
    this.state.penaltyMs += ms;
  }

  pauseBonus(ms: number): void {
    this.state.bonusPausedMs += ms;
  }

  remaining(): number | null {
    if (this.durationMs == null) return null;
    const live =
      this.running && this.pauseStarted == null
        ? performance.now() - this.startedAt - this.pausedAccum
        : this.state.elapsedMs;
    return remainingMs(this.durationMs, {
      ...this.state,
      elapsedMs: Math.max(this.state.elapsedMs, live),
    });
  }
}
