/**
 * Face-down detector stub. Spec: §10-2.
 * cos(beta)*cos(gamma) <= -0.8 for 1s → face down.
 * While active, call orientation.suppress().
 */
export class FaceDownDetector {
  active = false;
  faceDown = false;
  start(): void {
    this.active = true;
  }
  stop(): void {
    this.active = false;
    this.faceDown = false;
  }
}
