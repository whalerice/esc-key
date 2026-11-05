/** Screen color-matrix / filter stub (safelight etc.). Spec: §8-8. */
export type FilterKind = 'safelight' | 'none';

export class ScreenFilter {
  kind: FilterKind = 'none';
  set(kind: FilterKind): void {
    this.kind = kind;
  }
}
