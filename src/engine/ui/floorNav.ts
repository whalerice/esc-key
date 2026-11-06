/** Floor list rules. The widget does not change the scene. Spec: §19-7. */

export const FLOOR_STAIR_MS = 2000;
export const FLOOR_FADE_MS = 400;

export function floorCanGo(id: string, visited: readonly string[]): boolean {
  return visited.includes(id);
}

/** Stair, or a short fade when effects are reduced. */
export function floorTravelMs(reduceEffects: boolean): number {
  return reduceEffects ? FLOOR_FADE_MS : FLOOR_STAIR_MS;
}
