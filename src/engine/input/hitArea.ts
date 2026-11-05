import { MIN_HIT } from '@/engine/types';

/** Minimum hit size in screen px; under zoom, radius = 22 / scale. Spec: §7-3. */
export function hitSize(zoom = 1): number {
  return Math.max(MIN_HIT / zoom, MIN_HIT / zoom);
}

export function hitRadius(zoom = 1): number {
  return 22 / zoom;
}
