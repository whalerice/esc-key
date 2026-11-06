/** Hide hint + inventory on sewing scenes. Spec: docs/개발/공통엔진_v1.md §19-11. */

export function hudCollapsed(scene: string, scenes?: readonly string[] | null): boolean {
  return !!scenes?.includes(scene);
}
