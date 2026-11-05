/** 0–39 safe dial stub. */
export class SafeDial {
  position = 0;
  set(n: number): void {
    this.position = ((n % 40) + 40) % 40;
  }
}
