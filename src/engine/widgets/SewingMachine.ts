/**
 * Two-thumb sew. Emits needle, feed, and stitch offset.
 * Theme decides if the crooked ratio passes. No audio.
 * Spec: docs/개발/공통엔진_v1.md §19-8.
 *
 * ponytail: path is a polyline. Pass denser points when a curve needs it.
 */
import { MultiPointerRoles } from '@/engine/input/multiPointerRoles';

export type SewPoint = { x: number; y: number };

export type SewStitch = {
  x: number;
  y: number;
  /** Signed px off the chalk line. */
  offset: number;
  /** Degrees. Crooked stitches lean. */
  angle: number;
  progress: number;
};

export type SewSnapshot = {
  needle: SewPoint;
  /** 0..1 along the chalk line. */
  progress: number;
  offset: number;
  speed: 0 | 1 | 2 | 3;
  clothX: number;
  clothAngle: number;
  stitches: number;
  crookedRatio: number;
};

export type SewingMachineOpts = {
  path?: SewPoint[];
  /** Px/s at speed 0..3. */
  feed?: readonly [number, number, number, number];
  /** Hold time per speed step. */
  stepMs?: number;
  /** Pedal with no cloth motion. */
  bunchMs?: number;
  stitchEvery?: number;
  /** Half-width of a straight stitch. 3× fires `bigMiss`. */
  tolerance?: number;
  curve?: boolean;
  /** Pedal runs only while the cloth finger moves. */
  oneHand?: boolean;
  onChange?: (snap: SewSnapshot) => void;
  onStitch?: (offset: number) => void;
  onBunch?: () => void;
  onBigMiss?: (offset: number) => void;
  /** Ratio only. Not a pass/fail. */
  onReachEnd?: (crookedRatio: number) => void;
  /** 0..3. Theme may start a loop. This widget plays nothing. */
  onSpeed?: (stage: 0 | 1 | 2 | 3) => void;
};

const DEFAULT_PATH: SewPoint[] = [
  { x: 0, y: 0 },
  { x: 0, y: 240 },
];

export class SewingMachine {
  stitches: SewStitch[] = [];
  clothX = 0;
  clothAngle = 0;
  speed: 0 | 1 | 2 | 3 = 0;
  progressPx = 0;

  private path: SewPoint[];
  private length: number;
  private readonly feed: readonly [number, number, number, number];
  private readonly stepMs: number;
  private readonly bunchMs: number;
  private readonly stitchEvery: number;
  private readonly tolerance: number;
  private curve: boolean;
  private oneHand: boolean;
  private readonly opts: SewingMachineOpts;
  private readonly roles = new MultiPointerRoles();
  private readonly clothPt = new Map<number, SewPoint>();
  private pedalOn = false;
  private pedalSince: number | null = null;
  private dragSince: number | null = null;
  private lastClothMove: number | null = null;
  private pauseUntil = 0;
  private lastTick: number | null = null;
  private stitchCursor = 0;
  private missLatched = false;
  private reached = false;
  private done = false;
  private unlisten: (() => void) | null = null;

  constructor(opts: SewingMachineOpts = {}) {
    this.opts = opts;
    this.path = opts.path?.length ? opts.path.map((p) => ({ ...p })) : DEFAULT_PATH.map((p) => ({ ...p }));
    this.length = polylineLength(this.path);
    this.feed = opts.feed ?? [0, 80, 160, 240];
    this.stepMs = opts.stepMs ?? 500;
    this.bunchMs = opts.bunchMs ?? 1000;
    this.stitchEvery = opts.stitchEvery ?? 20;
    this.tolerance = opts.tolerance ?? 28;
    this.curve = opts.curve ?? false;
    this.oneHand = opts.oneHand ?? false;
  }

  get progress(): number {
    if (!(this.length > 0)) return 0;
    return Math.min(1, this.progressPx / this.length);
  }

  get offset(): number {
    return this.measure().offset;
  }

  get crookedRatio(): number {
    if (!this.stitches.length) return 0;
    const bad = this.stitches.filter((s) => Math.abs(s.offset) > this.tolerance).length;
    return bad / this.stitches.length;
  }

  /** Cloth-space point under the fixed needle. */
  needle(): SewPoint {
    return this.measure().needle;
  }

  snapshot(): SewSnapshot {
    const { needle, offset } = this.measure();
    return {
      needle,
      progress: this.progress,
      offset,
      speed: this.speed,
      clothX: this.clothX,
      clothAngle: this.clothAngle,
      stitches: this.stitches.length,
      crookedRatio: this.crookedRatio,
    };
  }

  setCurve(on: boolean): void {
    this.curve = on;
    if (!on) this.clothAngle = 0;
  }

  setOneHand(on: boolean): void {
    this.oneHand = on;
    if (!on) this.dragSince = null;
  }

  setPath(path: SewPoint[]): void {
    this.path = path.length ? path.map((p) => ({ ...p })) : DEFAULT_PATH.map((p) => ({ ...p }));
    this.length = polylineLength(this.path);
    this.resetProgress();
  }

  /** Button fallback. Release stops at once. */
  setPedal(on: boolean, now: number): void {
    if (on === this.pedalOn) return;
    this.pedalOn = on;
    if (on) this.pedalSince = now;
    else {
      this.pedalSince = null;
      this.pauseUntil = 0;
    }
    this.syncSpeed(now);
    this.opts.onChange?.(this.snapshot());
  }

  /** Button fallback. `dx` steers. Curve mode takes the drag angle. */
  nudgeCloth(dx: number, dy: number, now: number): void {
    this.clothX += dx;
    if (this.curve && (dx !== 0 || dy !== 0)) {
      this.clothAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    }
    this.lastClothMove = now;
    this.missLatched = false;
    if (this.oneHand && this.dragSince == null) this.dragSince = now;
    this.syncSpeed(now);
    this.opts.onChange?.(this.snapshot());
  }

  /** One-hand: lifting the cloth finger stops the pedal. */
  endCloth(now: number): void {
    this.dragSince = null;
    if (this.oneHand) this.syncSpeed(now);
  }

  speedAt(now: number): 0 | 1 | 2 | 3 {
    if (this.done || now < this.pauseUntil) return 0;
    let since: number | null = null;
    if (this.pedalOn && this.pedalSince != null) since = this.pedalSince;
    else if (this.oneHand && this.dragSince != null) since = this.dragSince;
    if (since == null) return 0;
    const held = Math.max(0, now - since);
    return Math.min(3, Math.floor(held / this.stepMs) + 1) as 0 | 1 | 2 | 3;
  }

  tick(now: number): void {
    const prev = this.lastTick;
    this.lastTick = now;
    if (prev == null) {
      this.syncSpeed(now);
      return;
    }
    const speed = this.speedAt(now);
    this.syncSpeed(now);
    if (this.done || now < this.pauseUntil || speed === 0) {
      this.opts.onChange?.(this.snapshot());
      return;
    }
    if (!this.oneHand && this.clothIdle(now)) {
      this.pauseUntil = now + this.bunchMs;
      this.lastClothMove = this.pauseUntil;
      this.speed = 0;
      this.opts.onSpeed?.(0);
      this.opts.onBunch?.();
      this.opts.onChange?.(this.snapshot());
      return;
    }
    const dt = Math.min(0.25, (now - prev) / 1000);
    this.advance(this.feed[speed] * dt);
    this.opts.onChange?.(this.snapshot());
  }

  /** Drop the crooked run back to the last straight stitch. */
  undoSection(): void {
    let keep = 0;
    for (let i = this.stitches.length - 1; i >= 0; i--) {
      if (Math.abs(this.stitches[i]!.offset) <= this.tolerance) {
        keep = i + 1;
        break;
      }
    }
    this.stitches.length = keep;
    const back = keep ? this.stitches[keep - 1]!.progress : 0;
    this.progressPx = back;
    this.stitchCursor = back;
  }

  reset(): void {
    this.pedalOn = false;
    this.pedalSince = null;
    this.dragSince = null;
    this.lastClothMove = null;
    this.pauseUntil = 0;
    this.clothX = 0;
    this.clothAngle = 0;
    this.speed = 0;
    this.roles.clear();
    this.clothPt.clear();
    this.resetProgress();
  }

  pointerDown(id: number, x: number, y: number, width: number, height: number, now: number): void {
    const role = this.roles.down(id, x, y, width, height);
    if (role === 'pedal') this.setPedal(true, now);
    if (role === 'cloth') this.clothPt.set(id, { x, y });
  }

  pointerMove(id: number, x: number, y: number, now: number): void {
    if (this.roles.roleOf(id) !== 'cloth') return;
    const prev = this.clothPt.get(id);
    if (!prev) return;
    this.nudgeCloth(x - prev.x, y - prev.y, now);
    this.clothPt.set(id, { x, y });
  }

  pointerUp(id: number, now: number): void {
    const role = this.roles.roleOf(id);
    this.roles.up(id);
    this.clothPt.delete(id);
    if (role === 'pedal' && this.roles.ids('pedal').length === 0) this.setPedal(false, now);
    if (role === 'cloth' && this.roles.ids('cloth').length === 0) this.endCloth(now);
  }

  attach(el: HTMLElement): () => void {
    this.detach();
    el.style.touchAction = 'none';
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
    };
    const down = (e: PointerEvent) => {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      const p = local(e);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      this.pointerDown(e.pointerId, p.x, p.y, p.w, p.h, performance.now());
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      this.pointerMove(e.pointerId, p.x, p.y, performance.now());
    };
    const up = (e: PointerEvent) => {
      this.pointerUp(e.pointerId, performance.now());
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
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
    this.roles.clear();
    this.clothPt.clear();
  }

  private resetProgress(): void {
    this.stitches = [];
    this.progressPx = 0;
    this.stitchCursor = 0;
    this.missLatched = false;
    this.reached = false;
    this.done = false;
    this.lastTick = null;
  }

  private clothIdle(now: number): boolean {
    const since = this.lastClothMove ?? this.pedalSince ?? now;
    return now - since >= this.bunchMs;
  }

  private syncSpeed(now: number): void {
    const speed = this.speedAt(now);
    if (speed === this.speed) return;
    this.speed = speed;
    this.opts.onSpeed?.(speed);
  }

  private measure(): { needle: SewPoint; offset: number } {
    const a = (-this.clothAngle * Math.PI) / 180;
    const vx = -this.clothX;
    const vy = this.progressPx;
    const needle = {
      x: vx * Math.cos(a) - vy * Math.sin(a),
      y: vx * Math.sin(a) + vy * Math.cos(a),
    };
    return { needle, offset: signedDistance(needle, this.path) };
  }

  private advance(dp: number): void {
    if (this.missLatched || !(dp > 0) || !(this.length > 0)) return;
    const next = Math.min(this.length, this.progressPx + dp);
    while (this.stitchCursor + this.stitchEvery <= next + 1e-6) {
      this.stitchCursor += this.stitchEvery;
      this.progressPx = this.stitchCursor;
      if (!this.placeStitch()) return;
    }
    this.progressPx = next;
    if (this.progressPx >= this.length - 1e-6 && !this.reached) {
      this.reached = true;
      this.done = true;
      this.speed = 0;
      this.opts.onReachEnd?.(this.crookedRatio);
    }
  }

  /** False when a big miss rewound the seam. */
  private placeStitch(): boolean {
    const { needle, offset } = this.measure();
    if (Math.abs(offset) >= this.tolerance * 3) {
      if (!this.missLatched) {
        this.missLatched = true;
        this.opts.onBigMiss?.(offset);
        this.undoSection();
      }
      return false;
    }
    this.missLatched = false;
    const heading = tangentDeg(this.path, this.progressPx);
    const crooked = Math.abs(offset) > this.tolerance;
    this.stitches.push({
      x: needle.x,
      y: needle.y,
      offset,
      angle: heading + (crooked ? offset * 0.4 : 0),
      progress: this.progressPx,
    });
    this.opts.onStitch?.(offset);
    return true;
  }
}

function polylineLength(pts: SewPoint[]): number {
  let n = 0;
  for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  return n;
}

function tangentDeg(pts: SewPoint[], dist: number): number {
  if (pts.length < 2) return 90;
  let left = dist;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (left <= len || i === pts.length - 1) {
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    }
    left -= len;
  }
  return 90;
}

function signedDistance(p: SewPoint, path: SewPoint[]): number {
  if (path.length === 0) return 0;
  if (path.length === 1) {
    const dx = p.x - path[0]!.x;
    const dy = p.y - path[0]!.y;
    return Math.hypot(dx, dy);
  }
  let best = Infinity;
  let signed = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    const qx = a.x + dx * t;
    const qy = a.y + dy * t;
    const ox = p.x - qx;
    const oy = p.y - qy;
    const d = Math.hypot(ox, oy);
    if (d < best) {
      best = d;
      const cross = dx * oy - dy * ox;
      signed = (cross >= 0 ? 1 : -1) * d;
    }
  }
  return signed;
}
