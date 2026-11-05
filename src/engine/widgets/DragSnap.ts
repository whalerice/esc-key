export type SnapTarget = { id: string; x: number; y: number; r: number };

export function nearestSnap(
  x: number,
  y: number,
  targets: SnapTarget[],
): SnapTarget | null {
  let best: SnapTarget | null = null;
  let bestD = Infinity;
  for (const t of targets) {
    const d = Math.hypot(x - t.x, y - t.y);
    if (d <= t.r && d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best;
}
