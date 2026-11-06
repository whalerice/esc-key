import type { HintChannelSkin, HintDef, PuzzleId } from '@/engine/types';

/** 3-tier hint stub. Spec: docs/개발/공통엔진_v1.md §8-5. */

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

/** Channel that applies at `puzzleId`. Earlier puzzles keep the previous skin. */
export function channelForPuzzle(
  base: HintChannelSkin,
  channels: { skin: HintChannelSkin; fromPuzzle: PuzzleId }[] | undefined,
  puzzleId: PuzzleId | null,
  order: readonly PuzzleId[],
): HintChannelSkin {
  if (!puzzleId || !channels?.length) return base;
  const at = order.indexOf(puzzleId);
  if (at < 0) return base;
  let skin = base;
  for (const ch of channels) {
    const from = order.indexOf(ch.fromPuzzle);
    if (from >= 0 && at >= from) skin = ch.skin;
  }
  return skin;
}
