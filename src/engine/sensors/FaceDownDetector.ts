/**
 * Face-down detector. Spec: docs/개발/공통엔진_v1.md §10-2.
 * screen-up = cos(beta) × cos(gamma). Degrees, as DeviceOrientationEvent.
 * ≤ −0.8 for 1s → face down. ≥ 0.3 for 0.5s → turned back.
 * Button mode is a black hold. A touch cancels it. Held time is not saved.
 */

export const FACE_DOWN_ENTER = -0.8;
export const FACE_DOWN_ENTER_MS = 1000;
export const FACE_UP_EXIT = 0.3;
export const FACE_UP_EXIT_MS = 500;

export function screenUpness(betaDeg: number, gammaDeg: number): number {
  const b = (betaDeg * Math.PI) / 180;
  const g = (gammaDeg * Math.PI) / 180;
  return Math.cos(b) * Math.cos(g);
}

export class FaceDownDetector {
  active = false;
  faceDown = false;
  /** Last completed hold. Stays after flip-up so the theme can read it. */
  lastHeld = 0;
  heldMs = 0;

  private enterSince: number | null = null;
  private exitSince: number | null = null;
  private downSince: number | null = null;

  start(): void {
    this.active = true;
  }

  stop(): void {
    this.active = false;
    this.faceDown = false;
    this.enterSince = null;
    this.exitSince = null;
    this.downSince = null;
    this.heldMs = 0;
  }

  /** Sensor sample. `now` is a monotonic ms clock. No-op until `start`. */
  push(betaDeg: number, gammaDeg: number, now: number): void {
    if (!this.active) return;
    const up = screenUpness(betaDeg, gammaDeg);
    if (!this.faceDown) {
      this.exitSince = null;
      if (up <= FACE_DOWN_ENTER) {
        if (this.enterSince == null) this.enterSince = now;
        else if (now - this.enterSince >= FACE_DOWN_ENTER_MS) {
          this.faceDown = true;
          this.downSince = now;
          this.heldMs = 0;
        }
      } else {
        this.enterSince = null;
      }
      return;
    }
    this.enterSince = null;
    this.heldMs = this.downSince == null ? 0 : Math.max(0, now - this.downSince);
    if (up >= FACE_UP_EXIT) {
      if (this.exitSince == null) this.exitSince = now;
      else if (now - this.exitSince >= FACE_UP_EXIT_MS) {
        this.lastHeld = this.heldMs;
        this.faceDown = false;
        this.downSince = null;
        this.exitSince = null;
      }
    } else {
      this.exitSince = null;
    }
  }

  /** Button stand-in. Screen goes black. Touch calls `cancelButton`. */
  beginButton(now: number): void {
    this.faceDown = true;
    this.downSince = now;
    this.heldMs = 0;
    this.lastHeld = 0;
  }

  buttonHeld(now: number): number {
    if (!this.faceDown || this.downSince == null) return 0;
    this.heldMs = Math.max(0, now - this.downSince);
    return this.heldMs;
  }

  cancelButton(): void {
    this.lastHeld = this.heldMs;
    this.faceDown = false;
    this.downSince = null;
  }
}
