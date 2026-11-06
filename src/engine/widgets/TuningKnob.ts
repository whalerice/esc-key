/** Continuous knob stub. Emits a value only. Spec: docs/개발/공통엔진_v1.md §19-1. */

export type TuningStation = {
  freq: number;
  width: number;
  soundId: string;
};

export class TuningKnob {
  value = 0;
  constructor(
    public min = 0,
    public max = 1,
    public stations: TuningStation[] = [],
  ) {}

  set(n: number): void {
    this.value = Math.min(this.max, Math.max(this.min, n));
  }
}
