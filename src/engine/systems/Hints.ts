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

/** After the 3 steps. Last line repeats. Spec §8-5 잡담. */
export function smallTalkLine(
  lines: readonly string[] | undefined,
  index: number,
): string | undefined {
  if (!lines?.length) return undefined;
  const at = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  return lines[Math.min(at, lines.length - 1)];
}

export function nextSmallTalkIndex(length: number, index: number): number {
  if (length <= 0) return 0;
  const at = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  return Math.min(at + 1, length - 1);
}

/** Hint steps only. 잡담 is not counted. */
export function hintUsesByChannel(
  hintsUsed: Record<string, number | undefined>,
  order: readonly string[],
  base: HintChannelSkin,
  channels: { skin: HintChannelSkin; fromPuzzle: PuzzleId }[] | undefined,
): Partial<Record<HintChannelSkin, number>> {
  const out: Partial<Record<HintChannelSkin, number>> = {};
  for (const id of order) {
    const n = hintsUsed[id] ?? 0;
    if (n <= 0) continue;
    const skin = channelForPuzzle(base, channels, id, order);
    out[skin] = (out[skin] ?? 0) + n;
  }
  return out;
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
