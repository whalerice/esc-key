import { GESTURE } from '@/engine/input/gestures';

export function longPressMs(override?: number): number {
  return override ?? GESTURE.longPressMs;
}
