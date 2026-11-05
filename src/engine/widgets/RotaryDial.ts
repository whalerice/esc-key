/** Rotary phone dial stub. */
export class RotaryDial {
  lastDigit: number | null = null;
  dial(digit: number): void {
    this.lastDigit = digit;
  }
}
