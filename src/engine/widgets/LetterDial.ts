export class LetterDial {
  constructor(
    public slots: string[][],
    public indices: number[] = slots.map(() => 0),
  ) {}
  value(): string {
    return this.indices.map((i, s) => this.slots[s]![i]!).join('');
  }
}
