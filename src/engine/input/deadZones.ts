import { DEAD_ZONE } from '@/engine/types';

/** True if point (css px) sits in system-gesture dead zones. Spec: §6. */
export function inDeadZone(
  x: number,
  y: number,
  cssW: number,
  cssH: number,
): boolean {
  if (x < DEAD_ZONE.left || x > cssW - DEAD_ZONE.right) return true;
  if (y > cssH - DEAD_ZONE.bottom) return true;
  return false;
}
