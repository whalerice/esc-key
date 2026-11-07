/**
 * Finger paint over named circles. Reports a covered ratio per circle.
 * Several dabs stack. The theme decides the pass ratio.
 * Spec: docs/개발/공통엔진_v1.md §8-8, docs/시리즈/늘봄/01_붉은방_설계_v1.md §9-5.
 */

export type MaskRegion = { id: string; x: number; y: number; r: number };

type Grid = { n: number; cells: Uint8Array; inside: number[] };

export class MaskAccumulator {
  /** Mean ratio, or the last `add` value when no regions exist. */
  covered = 0;

  private regions: MaskRegion[] = [];
  private grids = new Map<string, Grid>();

  add(amount: number): void {
    this.covered = Math.min(1, this.covered + amount);
  }

  reset(): void {
    this.covered = 0;
    for (const grid of this.grids.values()) grid.cells.fill(0);
  }

  /** Replace regions. `div` is the sample grid on each circle's box. */
  define(regions: MaskRegion[], div = 8): void {
    this.regions = regions.map((region) => ({ ...region }));
    this.grids.clear();
    const n = Math.max(2, div);
    for (const region of this.regions) {
      const cells = new Uint8Array(n * n);
      const inside: number[] = [];
      for (let iy = 0; iy < n; iy++) {
        for (let ix = 0; ix < n; ix++) {
          const px = region.x - region.r + ((ix + 0.5) / n) * region.r * 2;
          const py = region.y - region.r + ((iy + 0.5) / n) * region.r * 2;
          if (Math.hypot(px - region.x, py - region.y) <= region.r) inside.push(iy * n + ix);
        }
      }
      this.grids.set(region.id, { n, cells, inside });
    }
    this.covered = this.mean();
  }

  /** Paint every region the finger disk touches. */
  dab(x: number, y: number, fingerR: number): void {
    for (const region of this.regions) {
      const grid = this.grids.get(region.id);
      if (!grid) continue;
      const n = grid.n;
      for (const index of grid.inside) {
        const ix = index % n;
        const iy = Math.floor(index / n);
        const px = region.x - region.r + ((ix + 0.5) / n) * region.r * 2;
        const py = region.y - region.r + ((iy + 0.5) / n) * region.r * 2;
        if (Math.hypot(px - x, py - y) <= fingerR) grid.cells[index] = 1;
      }
    }
    this.covered = this.mean();
  }

  ratio(id: string): number {
    const grid = this.grids.get(id);
    if (!grid || grid.inside.length === 0) return 0;
    let hit = 0;
    for (const index of grid.inside) if (grid.cells[index]) hit += 1;
    return hit / grid.inside.length;
  }

  /** Restore a saved ratio by filling that share of the circle. */
  seed(id: string, ratio: number): void {
    const grid = this.grids.get(id);
    if (!grid || grid.inside.length === 0) return;
    const n = Math.round(Math.min(1, Math.max(0, ratio)) * grid.inside.length);
    for (let i = 0; i < grid.inside.length; i++) grid.cells[grid.inside[i]!] = i < n ? 1 : 0;
    this.covered = this.mean();
  }

  private mean(): number {
    if (this.regions.length === 0) return this.covered;
    let sum = 0;
    for (const region of this.regions) sum += this.ratio(region.id);
    return sum / this.regions.length;
  }
}
