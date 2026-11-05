/** Zoom camera stub. Spec: docs/공통엔진.md §8-1. */

export type ZoomCameraOpts = {
  min: number;
  max: number;
  thresholds?: number[];
};

export class ZoomCamera {
  scale = 1;
  x = 0;
  y = 0;

  constructor(private opts: ZoomCameraOpts = { min: 1, max: 12 }) {}

  clampScale(s: number): number {
    return Math.min(this.opts.max, Math.max(this.opts.min, s));
  }

  setScale(s: number): void {
    this.scale = this.clampScale(s);
  }

  /** Stub — pan/pinch/double-tap wired when scene graph exists. */
  reset(): void {
    this.scale = 1;
    this.x = 0;
    this.y = 0;
  }
}
