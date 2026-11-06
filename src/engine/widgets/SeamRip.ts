/**
 * Drag across basting stitches to lift them. A far drag warns and does not rewind.
 * Theme reads `left` and `complete`. Spec: docs/개발/공통엔진_v1.md §19-9.
 */
export type SeamPoint = { x: number; y: number };

export type SeamStitch = {
  index: number;
  x: number;
  y: number;
  ripped: boolean;
};

export type SeamRipOpts = {
  /** Default 7. */
  count?: number;
  path?: SeamPoint[];
  /** Px from a stitch that lifts it. */
  hit?: number;
  /** Px from the path that fires `stray`. */
  stray?: number;
  onRipped?: (index: number) => void;
  onStray?: () => void;
  onComplete?: () => void;
  onChange?: (left: number) => void;
};

export class SeamRip {
  readonly stitches: SeamStitch[];
  left: number;

  private readonly path: SeamPoint[];
  private readonly hit: number;
  private readonly stray: number;
  private readonly opts: SeamRipOpts;
  private away = false;
  private finished = false;
  private last: SeamPoint | null = null;
  private unlisten: (() => void) | null = null;

  constructor(opts: SeamRipOpts = {}) {
    this.opts = opts;
    const count = Math.max(1, opts.count ?? 7);
    this.path = opts.path?.length
      ? opts.path.map((p) => ({ ...p }))
      : [
          { x: 16, y: 36 },
          { x: 16 + 40 * (count - 1), y: 36 },
        ];
    this.hit = opts.hit ?? 16;
    this.stray = opts.stray ?? 72;
    this.stitches = placeStitches(this.path, count);
    this.left = count;
  }

  /** Drag. Passing a stitch lifts it. Far from the path → `stray`, progress stays. */
  move(x: number, y: number): void {
    const from = this.last ?? { x, y };
    this.last = { x, y };
    const dist = distanceToPath({ x, y }, this.path);
    if (dist > this.stray) {
      if (!this.away) {
        this.away = true;
        this.opts.onStray?.();
      }
    } else {
      this.away = false;
    }
    const span = Math.hypot(x - from.x, y - from.y);
    const steps = Math.max(1, Math.ceil(span / Math.max(4, this.hit / 2)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.liftNear(from.x + (x - from.x) * t, from.y + (y - from.y) * t);
    }
  }

  /** Break the drag so the next press does not sweep from the last point. */
  end(): void {
    this.last = null;
  }

  /** Button fallback for one stitch. */
  rip(index: number): boolean {
    const stitch = this.stitches.find((s) => s.index === index);
    if (!stitch || stitch.ripped) return false;
    this.lift(stitch);
    return true;
  }

  attach(el: HTMLElement): () => void {
    this.detach();
    el.style.touchAction = 'none';
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    let active = false;
    const down = (e: PointerEvent) => {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      active = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      const p = local(e);
      this.move(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const p = local(e);
      this.move(p.x, p.y);
    };
    const up = () => {
      active = false;
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

  private liftNear(x: number, y: number): void {
    for (const stitch of this.stitches) {
      if (stitch.ripped) continue;
      if (Math.hypot(stitch.x - x, stitch.y - y) <= this.hit) this.lift(stitch);
    }
  }

  private lift(stitch: SeamStitch): void {
    stitch.ripped = true;
    this.left = this.stitches.filter((s) => !s.ripped).length;
    this.opts.onRipped?.(stitch.index);
    this.opts.onChange?.(this.left);
    if (this.left === 0 && !this.finished) {
      this.finished = true;
      this.opts.onComplete?.();
    }
  }
}

function placeStitches(path: SeamPoint[], count: number): SeamStitch[] {
  const total = lengthOf(path);
  const out: SeamStitch[] = [];
  for (let i = 0; i < count; i++) {
    const dist = count === 1 ? total / 2 : (total * i) / (count - 1);
    const p = pointAlong(path, dist);
    out.push({ index: i, x: p.x, y: p.y, ripped: false });
  }
  return out;
}

function lengthOf(path: SeamPoint[]): number {
  let n = 0;
  for (let i = 1; i < path.length; i++) {
    n += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y);
  }
  return n;
}

function pointAlong(path: SeamPoint[], dist: number): SeamPoint {
  if (!path.length) return { x: 0, y: 0 };
  let left = dist;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (left <= len || i === path.length - 1) {
      const t = len === 0 ? 0 : Math.min(1, left / len);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    left -= len;
  }
  return { ...path[path.length - 1]! };
}

function distanceToPath(p: SeamPoint, path: SeamPoint[]): number {
  if (!path.length) return Infinity;
  if (path.length === 1) return Math.hypot(p.x - path[0]!.x, p.y - path[0]!.y);
  let best = Infinity;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    const d = Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
    if (d < best) best = d;
  }
  return best;
}
