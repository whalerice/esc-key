/** Vertical slider stub. Spec: docs/개발/공통엔진_v1.md §19-2. */
export class VerticalFader {
  value = 0;
  set(n: number): void {
    this.value = Math.min(1, Math.max(0, n));
  }
}
