import type { EventDef } from '@/engine/types';

/** Declarative event table runner stub. Spec: §8-7. */

export type EventBus = {
  emit: (name: string, payload?: unknown) => void;
};

export function matchEvents(
  table: EventDef[],
  predicate: (ev: EventDef) => boolean,
): EventDef[] {
  return table.filter(predicate);
}

/** Stub: log actions; theme wires real runners later. */
export function runActions(actions: string[], bus?: EventBus): void {
  for (const a of actions) {
    bus?.emit(a);
  }
}
