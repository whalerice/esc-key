/**
 * Searchlight wedge. Emits bearing and who sits in the light.
 * Bearing is not saved. Theme judges the puzzle. Spec: docs/개발/공통엔진_v1.md §19-3.
 */
import { TwoFingerRotate, wrapDeltaDeg } from '@/engine/input/gestures';

export type BeamTarget = {
  id: string;
  /** Theme updates this for a moving ship. */
  deg: number;
};

export type BeamMaskOpts = {
  origin?: { x: number; y: number };
  deg?: number;
  min?: number;
  max?: number;
  /** Full wedge width in degrees. */
  widthDeg?: number;
  length?: number;
  /** Soft edge, degrees. Drawing only. */
  blur?: number;
  /** Finger degrees → beam degrees. */
  ratio?: number;
  inertiaMs?: number;
  holdMs?: number;
  targets?: BeamTarget[];
  particles?: boolean;
  reduceEffects?: boolean;
  onChange?: (deg: number) => void;
  onInBeam?: (id: string) => void;
  onHeld?: (id: string, ms: number) => void;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export class BeamMask {
  deg: number;
  readonly min: number;
  readonly max: number;
  widthDeg: number;
  length: number;
  blur: number;
  origin: { x: number; y: number };
  particles: boolean;
  reduceEffects: boolean;
  targets: BeamTarget[];

  private readonly ratio: number;
  private readonly inertiaMs: number;
  private readonly holdMs: number;
  private readonly opts: BeamMaskOpts;
  private readonly rotate: TwoFingerRotate;
  private readonly singles = new Map<number, number>();
  private readonly since = new Map<string, number>();
  private readonly heldSent = new Set<string>();
  private velocity = 0;
  private lastAt = 0;
  private raf = 0;
  private unlisten: (() => void) | null = null;
  /** Bearing at the previous sample. A moving beam is not a hold. */
  private stillAt: number | null = null;

  constructor(opts: BeamMaskOpts = {}) {
    this.opts = opts;
    this.min = opts.min ?? 40;
    this.max = opts.max ?? 180;
    this.deg = clamp(opts.deg ?? this.min, this.min, this.max);
    this.widthDeg = opts.widthDeg ?? 24;
    this.length = opts.length ?? 1;
    this.blur = opts.blur ?? 6;
    this.origin = opts.origin ?? { x: 0, y: 0 };
    this.particles = opts.particles ?? true;
    this.reduceEffects = opts.reduceEffects ?? false;
    this.targets = opts.targets?.map((t) => ({ ...t })) ?? [];
    this.ratio = opts.ratio ?? 1;
    this.inertiaMs = opts.inertiaMs ?? 120;
    this.holdMs = opts.holdMs ?? 2000;
    this.rotate = new TwoFingerRotate((delta) => this.applyFinger(delta));
  }

  showParticles(): boolean {
    return this.particles && !this.reduceEffects;
  }

  covers(targetDeg: number): boolean {
    const half = this.widthDeg / 2;
    return Math.abs(wrapDeltaDeg(targetDeg - this.deg)) <= half;
  }

  inside(): string[] {
    return this.targets.filter((t) => this.covers(t.deg)).map((t) => t.id);
  }

  set(deg: number): void {
    this.stopCoast();
    this.deg = clamp(deg, this.min, this.max);
    this.opts.onChange?.(this.deg);
  }

  /** Button / one-step fallback. Degrees on the beam, not the finger. */
  nudge(deltaDeg: number): void {
    if (!deltaDeg) return;
    this.set(this.deg + deltaDeg);
  }

  setTarget(id: string, deg: number): void {
    const found = this.targets.find((t) => t.id === id);
    if (found) found.deg = deg;
    else this.targets.push({ id, deg });
  }

  /**
   * Theme clock. Enter → `onInBeam`. Stay `holdMs` while the bearing is still → `onHeld` once.
   * ponytail: 0.35° per sample. A slow sweep through the wedge is not a hold; raise if a resting finger jitters more than this.
   */
  sample(now: number): void {
    const moved = this.stillAt != null && Math.abs(wrapDeltaDeg(this.deg - this.stillAt)) > 0.35;
    this.stillAt = this.deg;
    if (moved) {
      for (const id of this.since.keys()) {
        if (!this.heldSent.has(id)) this.since.set(id, now);
      }
    }
    const lit = new Set(this.inside());
    for (const id of [...this.since.keys()]) {
      if (!lit.has(id)) {
        this.since.delete(id);
        this.heldSent.delete(id);
      }
    }
    for (const id of lit) {
      const started = this.since.get(id);
      if (started == null) {
        this.since.set(id, now);
        this.opts.onInBeam?.(id);
        continue;
      }
      const ms = now - started;
      if (!this.heldSent.has(id) && ms >= this.holdMs) {
        this.heldSent.add(id);
        this.opts.onHeld?.(id, ms);
      }
    }
  }

  /**
   * Two-finger rotate claims this surface (pinch on it throws).
   * One finger rotates around the pad center.
   */
  attach(el: HTMLElement): () => void {
    this.detach();
    this.rotate.bind(el);
    el.style.touchAction = 'none';

    const down = (e: PointerEvent) => {
      this.stopCoast();
      this.velocity = 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
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
        this.applyFinger(((deg % 360) + 540) % 360 - 180);
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
    return () => this.detach();
  }

  detach(): void {
    this.stopCoast();
    this.unlisten?.();
    this.unlisten = null;
    this.rotate.unbind();
    this.rotate.clear();
    this.singles.clear();
  }

  private applyFinger(deltaDeg: number): void {
    if (!deltaDeg) return;
    this.drive(this.deg + deltaDeg * this.ratio);
  }

  private drive(next: number): void {
    const now = performance.now();
    const dt = now - this.lastAt;
    if (this.lastAt && dt > 0 && dt < 100) this.velocity = (next - this.deg) / dt;
    this.lastAt = now;
    this.deg = clamp(next, this.min, this.max);
    this.opts.onChange?.(this.deg);
  }

  private coast(): void {
    this.stopCoast();
    if (!(this.inertiaMs > 0) || Math.abs(this.velocity) < 1e-6) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      this.velocity *= Math.exp(-dt / this.inertiaMs);
      if (Math.abs(this.velocity) < 1e-4) {
        this.velocity = 0;
        this.raf = 0;
        return;
      }
      this.drive(this.deg + this.velocity * dt);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private stopCoast(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}

function centerOf(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
