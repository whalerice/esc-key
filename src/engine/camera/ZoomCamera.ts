/** Zoom camera — pinch / pan / double-tap. Spec: docs/개발/공통엔진_v1.md §8-1. */
import { Container, FederatedPointerEvent, Rectangle } from 'pixi.js';
import { GESTURE } from '@/engine/input/gestures';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';

export type ZoomCameraOpts = {
  min: number;
  max: number;
  thresholds?: number[];
  /** Fired when scale crosses a threshold upward. */
  onThreshold?: (scale: number) => void;
};

type Ptr = { id: number; x: number; y: number };

export class ZoomCamera {
  scale = 1;
  x = 0;
  y = 0;

  private target: Container | null = null;
  private opts: ZoomCameraOpts;
  private pointers = new Map<number, Ptr>();
  private pinchStartDist = 0;
  private pinchStartScale = 1;
  private panLast: { x: number; y: number } | null = null;
  private lastTapAt = 0;
  private crossed = new Set<number>();
  private unbound: Array<() => void> = [];

  constructor(opts: ZoomCameraOpts = { min: 1, max: 12 }) {
    this.opts = opts;
  }

  /** Attach world container; listen on `stage` for gestures. */
  attach(target: Container, stage: Container): void {
    this.detach();
    this.target = target;
    target.eventMode = 'passive';
    stage.eventMode = 'static';
    if (!stage.hitArea) {
      stage.hitArea = new Rectangle(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }

    const onDown = (e: FederatedPointerEvent) => {
      this.pointers.set(e.pointerId, { id: e.pointerId, x: e.globalX, y: e.globalY });
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        this.pinchStartDist = dist(a!, b!);
        this.pinchStartScale = this.scale;
        this.panLast = null;
      } else if (this.pointers.size === 1) {
        this.panLast = { x: e.globalX, y: e.globalY };
        const now = performance.now();
        if (now - this.lastTapAt < GESTURE.doubleTapMs) {
          this.setScale(this.scale < 2 ? 2 : this.scale < 4 ? 4 : 1);
          this.lastTapAt = 0;
        } else {
          this.lastTapAt = now;
        }
      }
    };
    const onMove = (e: FederatedPointerEvent) => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { id: e.pointerId, x: e.globalX, y: e.globalY });
      if (this.pointers.size >= 2) {
        const [a, b] = [...this.pointers.values()];
        const d = dist(a!, b!);
        if (this.pinchStartDist > 0) {
          this.setScale(this.pinchStartScale * (d / this.pinchStartDist));
        }
      } else if (this.panLast && this.scale > 1) {
        this.x += e.globalX - this.panLast.x;
        this.y += e.globalY - this.panLast.y;
        this.panLast = { x: e.globalX, y: e.globalY };
        this.clampPan();
        this.apply();
      }
    };
    const onUp = (e: FederatedPointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinchStartDist = 0;
      if (this.pointers.size === 1) {
        const only = [...this.pointers.values()][0]!;
        this.panLast = { x: only.x, y: only.y };
      } else {
        this.panLast = null;
      }
    };

    stage.on('pointerdown', onDown);
    stage.on('pointermove', onMove);
    stage.on('pointerup', onUp);
    stage.on('pointerupoutside', onUp);
    stage.on('pointercancel', onUp);
    this.unbound.push(() => {
      stage.off('pointerdown', onDown);
      stage.off('pointermove', onMove);
      stage.off('pointerup', onUp);
      stage.off('pointerupoutside', onUp);
      stage.off('pointercancel', onUp);
    });
    this.apply();
  }

  detach(): void {
    for (const u of this.unbound) u();
    this.unbound = [];
    this.pointers.clear();
    this.target = null;
  }

  clampScale(s: number): number {
    return Math.min(this.opts.max, Math.max(this.opts.min, s));
  }

  setScale(s: number): void {
    const prev = this.scale;
    this.scale = this.clampScale(s);
    this.clampPan();
    this.apply();
    for (const t of this.opts.thresholds ?? []) {
      if (prev < t && this.scale >= t && !this.crossed.has(t)) {
        this.crossed.add(t);
        this.opts.onThreshold?.(t);
      }
      if (this.scale < t) this.crossed.delete(t);
    }
  }

  zoomIn(step = 0.5): void {
    this.setScale(this.scale + step);
  }

  zoomOut(step = 0.5): void {
    this.setScale(this.scale - step);
  }

  reset(): void {
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.crossed.clear();
    this.apply();
  }

  private clampPan(): void {
    if (this.scale <= 1) {
      this.x = 0;
      this.y = 0;
      return;
    }
    const maxX = (LOGICAL_WIDTH * (this.scale - 1)) / 2;
    const maxY = (LOGICAL_HEIGHT * (this.scale - 1)) / 2;
    this.x = Math.min(maxX, Math.max(-maxX, this.x));
    this.y = Math.min(maxY, Math.max(-maxY, this.y));
  }

  private apply(): void {
    if (!this.target) return;
    this.target.pivot.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
    this.target.position.set(LOGICAL_WIDTH / 2 + this.x, LOGICAL_HEIGHT / 2 + this.y);
    this.target.scale.set(this.scale);
  }
}

function dist(a: Ptr, b: Ptr): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
