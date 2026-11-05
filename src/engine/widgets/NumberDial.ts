/** Emits value changes only — puzzle judges answers. Spec: §8-2. */
export type DialListener = (value: number[]) => void;

export class NumberDial {
  values: number[];
  constructor(
    public digits: number,
    private onChange?: DialListener,
  ) {
    this.values = Array(digits).fill(0);
  }
  setDigit(i: number, v: number): void {
    this.values[i] = v;
    this.onChange?.([...this.values]);
  }
}
