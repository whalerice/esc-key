/** LOD threshold helper for zoom scenes (e.g. 1/12). Spec: §8-1. */

export function lodLevel(scale: number, thresholds: number[]): number {
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (scale >= thresholds[i]!) level = i + 1;
  }
  return level;
}
