import type { HintDef, PuzzleId } from '@/engine/types';

/** 3-tier hint stub. Spec: docs/공통엔진.md §8-5. */

export function hintText(
  hints: Record<PuzzleId, HintDef>,
  puzzleId: PuzzleId,
  step: 1 | 2 | 3,
): string | undefined {
  const def = hints[puzzleId];
  if (!def) return undefined;
  return def.steps[step - 1];
}

export function nextHintStep(current: 0 | 1 | 2 | 3): 0 | 1 | 2 | 3 {
  return Math.min(3, current + 1) as 0 | 1 | 2 | 3;
}
