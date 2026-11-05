/** Mic breath detector stub + long-press fallback. Spec: §10-1. */
export class BreathDetector {
  active = false;
  start(): void {
    this.active = true;
  }
  stop(): void {
    this.active = false;
  }
}
