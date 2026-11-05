export class SequenceTap {
  constructor(public expected: string[]) {}
  check(input: string[]): boolean {
    return (
      input.length === this.expected.length &&
      input.every((id, i) => id === this.expected[i])
    );
  }
}
