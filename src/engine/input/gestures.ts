/**
 * Pointer gestures. Spec: docs/개발/공통엔진_v1.md §7-2.
 * Pinch and two-finger rotate cannot be claimed together.
 */
export const GESTURE = {
  tapMovePx: 10,
  tapMs: 300,
  doubleTapMs: 280,
  longPressMs: 600,
  dragMovePx: 10,
} as const;

export type GestureKind =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'drag'
  | 'snap-drag'
  | 'rotate-drag'
  | 'pinch'
  | 'two-finger-rotate';

export type TwoFingerMode = 'pinch' | 'rotate';

const claims = new Map<object, TwoFingerMode>();

export function activeTwoFingerMode(): TwoFingerMode | null {
  const modes = new Set(claims.values());
  if (modes.size === 0) return null;
  if (modes.size > 1) return null;
  return [...modes][0] ?? null;
}

/** One screen, one two-finger mode. Same mode may have several owners. */
export function claimTwoFinger(owner: object, mode: TwoFingerMode): void {
  for (const [other, claimed] of claims) {
    if (other !== owner && claimed !== mode) {
      throw new Error(
        'pinch and two-finger rotate cannot be active on the same surface',
      );
    }
  }
  claims.set(owner, mode);
}

export function releaseTwoFinger(owner: object): void {
  claims.delete(owner);
}

export function wrapDeltaDeg(delta: number): number {
  let d = delta;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

type Point = { x: number; y: number };

/**
 * Angle of the line between two pointers. Distance is ignored.
 * `ratio` scales finger-degrees → value-degrees (default 1° → 1°).
 */
export class TwoFingerRotate {
  private pts = new Map<number, Point>();
  private last: number | null = null;
  totalDeg = 0;
  private surface: object | null = null;
  private onDelta: (deltaDeg: number, totalDeg: number) => void;
  private ratio: number;

  constructor(
    onDelta: (deltaDeg: number, totalDeg: number) => void = () => undefined,
    ratio = 1,
  ) {
    this.onDelta = onDelta;
    this.ratio = ratio;
  }

  get count(): number {
    return this.pts.size;
  }

  bind(surface: object): void {
    claimTwoFinger(surface, 'rotate');
    this.surface = surface;
  }

  unbind(): void {
    if (!this.surface) return;
    releaseTwoFinger(this.surface);
    this.surface = null;
  }

  down(id: number, x: number, y: number): void {
    this.pts.set(id, { x, y });
    this.last = this.pairAngle();
  }

  move(id: number, x: number, y: number): number {
    if (!this.pts.has(id)) return 0;
    this.pts.set(id, { x, y });
    return this.consume();
  }

  up(id: number): void {
    this.pts.delete(id);
    this.last = this.pairAngle();
  }

  clear(): void {
    this.pts.clear();
    this.last = null;
  }

  private pairAngle(): number | null {
    if (this.pts.size < 2) return null;
    const [a, b] = [...this.pts.values()];
    return (Math.atan2(b!.y - a!.y, b!.x - a!.x) * 180) / Math.PI;
  }

  private consume(): number {
    const angle = this.pairAngle();
    if (angle == null || this.last == null) {
      this.last = angle;
      return 0;
    }
    const delta = wrapDeltaDeg(angle - this.last) * this.ratio;
    this.last = angle;
    if (delta === 0) return 0;
    this.totalDeg += delta;
    this.onDelta(delta, this.totalDeg);
    return delta;
  }
}
