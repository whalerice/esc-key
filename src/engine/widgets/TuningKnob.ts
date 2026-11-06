/**
 * Continuous knob. Emits a value only — puzzle code judges the answer.
 * One-finger rotate around the center, or two-finger rotate (distance ignored).
 * Frequency is not stored. Spec: docs/개발/공통엔진_v1.md §19-1, §12-2.
 */
import { TwoFingerRotate } from '@/engine/input/gestures';

export type TuningStation = {
  freq: number;
  width: number;
  soundId: string;
};

export type TuningKnobOpts = {
  min?: number;
  max?: number;
  /** Value swept by one full turn. */
  perTurn?: number;
  /** Quantize when the finger lifts and coast ends. */
  snap?: number;
  /** Coast time-constant in ms. 0 disables. */
  inertiaMs?: number;
  stations?: TuningStation[];
  lockAt?: number;
  lockHoldMs?: number;
  onChange?: (value: number) => void;
  onSignal?: (signal: number, station: TuningStation | null) => void;
  onLock?: (station: TuningStation) => void;
  onFirstHit?: (station: TuningStation) => void;
};

/** 1 at the station, 0 outside `width`, raised cosine between. */
export function stationSignal(value: number, station: TuningStation): number {
  const width = station.width;
  if (!(width > 0)) return value === station.freq ? 1 : 0;
  const dist = Math.abs(value - station.freq);
  if (dist >= width) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * (dist / width)));
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export class TuningKnob {
  readonly min: number;
  readonly max: number;
  readonly perTurn: number;
  readonly stations: TuningStation[];
  value: number;

  private readonly snapStep: number | undefined;
  private readonly inertiaMs: number;
  private readonly lockAt: number;
  private readonly lockHoldMs: number;
  private readonly opts: TuningKnobOpts;
  private readonly rotate: TwoFingerRotate;
  private readonly singles = new Map<number, number>();
  private readonly hold = new Map<string, number>();
  private readonly locked = new Set<string>();
  private readonly hit = new Set<string>();
  private velocity = 0;
  private lastAt = 0;
  private raf = 0;
  private holdTimer: number | null = null;
  private unlisten: (() => void) | null = null;

  constructor(opts: TuningKnobOpts = {}) {
    this.opts = opts;
    this.min = opts.min ?? 0;
    this.max = opts.max ?? 1;
    this.perTurn = opts.perTurn ?? 1;
    this.snapStep = opts.snap;
    this.inertiaMs = opts.inertiaMs ?? 280;
    this.lockAt = opts.lockAt ?? 0.95;
    this.lockHoldMs = opts.lockHoldMs ?? 1000;
    this.stations = opts.stations ?? [];
    this.value = this.min;
    this.rotate = new TwoFingerRotate((delta) => this.applyDeg(delta));
  }

  reading(): { signal: number; station: TuningStation | null } {
    let best = 0;
    let station: TuningStation | null = null;
    for (const s of this.stations) {
      const n = stationSignal(this.value, s);
      if (n > best) {
        best = n;
        station = s;
      }
    }
    return { signal: best, station };
  }

  set(n: number): void {
    this.stopCoast();
    this.value = clamp(n, this.min, this.max);
    this.emit();
    this.checkLock();
  }

  /** Hold still inside the lock band — call from tests, or via attach(). */
  checkLock(now = performance.now()): void {
    for (const s of this.stations) {
      const key = `${s.soundId}@${s.freq}`;
      const n = stationSignal(this.value, s);
      if (n >= this.lockAt) {
        const since = this.hold.get(key);
        if (since == null) this.hold.set(key, now);
        else if (!this.locked.has(key) && now - since >= this.lockHoldMs) {
          this.locked.add(key);
          this.opts.onLock?.(s);
        }
      } else {
        this.hold.delete(key);
        this.locked.delete(key);
      }
    }
  }

  /**
   * Claims two-finger rotate on `el`. Pinch on the same screen throws.
   */
  attach(el: HTMLElement): () => void {
    this.detach();
    this.rotate.bind(el);
    el.style.touchAction = 'none';

    const down = (e: PointerEvent) => {
      this.stopCoast();
      this.velocity = 0;
      el.setPointerCapture(e.pointerId);
      const c = centerOf(el);
      this.rotate.down(e.pointerId, e.clientX, e.clientY);
      this.singles.set(e.pointerId, Math.atan2(e.clientY - c.y, e.clientX - c.x));
    };
    const move = (e: PointerEvent) => {
      if (!this.singles.has(e.pointerId)) return;
      const c = centerOf(el);
      this.rotate.move(e.pointerId, e.clientX, e.clientY);
      const prev = this.singles.get(e.pointerId)!;
      const angle = Math.atan2(e.clientY - c.y, e.clientX - c.x);
      if (this.rotate.count < 2) {
        const deg = ((angle - prev) * 180) / Math.PI;
        this.applyDeg(((deg % 360) + 540) % 360 - 180);
      }
      this.singles.set(e.pointerId, angle);
    };
    const up = (e: PointerEvent) => {
      this.rotate.up(e.pointerId);
      this.singles.delete(e.pointerId);
      if (this.rotate.count === 0) this.coast();
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    this.unlisten = () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    this.holdTimer = window.setInterval(() => this.checkLock(), 100);

    return () => this.detach();
  }

  detach(): void {
    this.stopCoast();
    if (this.holdTimer != null) {
      window.clearInterval(this.holdTimer);
      this.holdTimer = null;
    }
    this.unlisten?.();
    this.unlisten = null;
    this.rotate.unbind();
    this.rotate.clear();
    this.singles.clear();
  }

  private applyDeg(deltaDeg: number): void {
    if (!deltaDeg) return;
    this.drive(this.value + (deltaDeg / 360) * this.perTurn);
  }

  private drive(next: number): void {
    const now = performance.now();
    const dt = now - this.lastAt;
    if (this.lastAt && dt > 0 && dt < 100) {
      this.velocity = (next - this.value) / dt;
    }
    this.lastAt = now;
    this.value = clamp(next, this.min, this.max);
    this.emit();
    this.checkLock(now);
  }

  private coast(): void {
    this.stopCoast();
    if (!(this.inertiaMs > 0) || Math.abs(this.velocity) < 1e-6) {
      this.finish();
      return;
    }
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      this.velocity *= Math.exp(-dt / this.inertiaMs);
      if (Math.abs(this.velocity) < 1e-5) {
        this.velocity = 0;
        this.raf = 0;
        this.finish();
        return;
      }
      this.drive(this.value + this.velocity * dt);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private finish(): void {
    if (this.snapStep == null || !(this.snapStep > 0)) {
      this.emit();
      return;
    }
    const steps = Math.round((this.value - this.min) / this.snapStep);
    this.value = clamp(this.min + steps * this.snapStep, this.min, this.max);
    this.emit();
    this.checkLock();
  }

  private stopCoast(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private emit(): void {
    this.opts.onChange?.(this.value);
    const { signal, station } = this.reading();
    this.opts.onSignal?.(signal, station);
    if (station && signal > 0) {
      const key = `${station.soundId}@${station.freq}`;
      if (!this.hit.has(key)) {
        this.hit.add(key);
        this.opts.onFirstHit?.(station);
      }
    }
  }
}

function centerOf(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
