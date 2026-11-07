/**
 * Follow a polyline from the start. Leaving the path rewinds to the start.
 * Emits progress 0–1. Does not know the answer. One pointer.
 * Spec: docs/시리즈/늘봄/01_붉은방_설계_v1.md §P2 (film spiral).
 */

export type PathPoint = { x: number; y: number };

export type PathFollowOpts = {
  path: PathPoint[];
  /** Px from the line. Default 36 (screen basis). */
  tolerance?: number;
  /** How far one sample may jump ahead, px along the line. */
  lead?: number;
  onChange?: (progress: number) => void;
  onStray?: () => void;
  onComplete?: () => void;
};

export class PathFollow {
  progress = 0;
  readonly tolerance: number;
  readonly lead: number;

  private readonly path: PathPoint[];
  private readonly opts: PathFollowOpts;
  private along = 0;
  private done = false;
  private unlisten: (() => void) | null = null;

  constructor(opts: PathFollowOpts) {
    this.opts = opts;
    this.path = opts.path.map((p) => ({ ...p }));
    this.tolerance = opts.tolerance ?? 36;
    const maxSeg = maxSegment(this.path);
    this.lead = opts.lead ?? Math.max(this.tolerance * 2, maxSeg * 1.5);
  }

  /** Local px. Off the ribbon, or a jump, rewinds. */
  move(x: number, y: number): void {
    if (this.done || this.path.length < 2) return;
    const hit = closestOnPath(this.path, x, y);
    if (hit.total <= 0) return;
    const off = hit.dist > this.tolerance;
    const back = hit.along < this.along - this.lead;
    const skip = hit.along > this.along + this.lead;
    if (off || back || skip) {
      if (this.along > 0) this.rewind();
      return;
    }
    this.along = hit.along;
    const next = this.along / hit.total;
    this.progress = next >= 0.995 ? 1 : next;
    this.opts.onChange?.(this.progress);
    if (this.progress >= 1 && !this.done) {
      this.done = true;
      this.opts.onComplete?.();
    }
  }

  end(): void {
    /* stroke break. Progress stays. */
  }

  attach(el: HTMLElement): () => void {
    this.detach();
    el.style.touchAction = 'none';
    let active: number | null = null;
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      if (active != null) return;
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      active = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      const p = local(e);
      this.move(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      const p = local(e);
      this.move(p.x, p.y);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      active = null;
      this.end();
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
    this.unlisten?.();
    this.unlisten = null;
  }

  private rewind(): void {
    this.along = 0;
    this.progress = 0;
    this.opts.onStray?.();
    this.opts.onChange?.(0);
  }
}

/** Outside-in spiral. `turns` loops. Center sits slightly right. */
export function spiralPath(turns: number, size: number): PathPoint[] {
  const cx = size * 0.62;
  const cy = size * 0.5;
  const outer = size * 0.35;
  const steps = Math.max(8, Math.round(Math.max(1, turns) * 24));
  const pts: PathPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = t * turns * Math.PI * 2;
    const r = outer * (1 - t * 0.82);
    pts.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
  }
  return pts;
}

/** 36px at a reel that is 70% of a 1080-tall stage, scaled into `box`. */
export function reelTolerance(box: number): number {
  return (36 * box) / (1080 * 0.7);
}

function maxSegment(path: PathPoint[]): number {
  let max = 0;
  for (let i = 1; i < path.length; i++) {
    max = Math.max(max, Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y));
  }
  return max;
}

function closestOnPath(
  path: PathPoint[],
  x: number,
  y: number,
): { dist: number; along: number; total: number } {
  let total = 0;
  let bestDist = Infinity;
  let bestAlong = 0;
  let walked = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const t = len === 0 ? 0 : Math.min(1, Math.max(0, ((x - a.x) * dx + (y - a.y) * dy) / (len * len)));
    const dist = Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t));
    if (dist < bestDist) {
      bestDist = dist;
      bestAlong = walked + len * t;
    }
    walked += len;
    total += len;
  }
  return { dist: bestDist, along: bestAlong, total };
}
