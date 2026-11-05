/** Accumulated finger-mask ratio stub (dodging). Spec: §8-8. */
export class MaskAccumulator {
  covered = 0;
  add(_amount: number): void {
    this.covered = Math.min(1, this.covered + _amount);
  }
  reset(): void {
    this.covered = 0;
  }
}
