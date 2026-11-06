/**
 * Tick count is `scale`. Default 40 → positions 0–39 (잿빛).
 * Pass 10 → 0–9 (심야 라디오 P5). Spec: docs/개발/공통엔진_v1.md §8-2.
 */
export class SafeDial {
  readonly scale: number;
  position = 0;
  constructor(scale = 40) {
    this.scale = scale;
  }
  set(n: number): void {
    const s = this.scale;
    this.position = ((n % s) + s) % s;
  }
}
