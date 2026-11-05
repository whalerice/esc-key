import type { EndingDef, EndingId } from '@/engine/types';

export function findEnding(
  endings: EndingDef[],
  id: EndingId,
): EndingDef | undefined {
  return endings.find((e) => e.id === id);
}
