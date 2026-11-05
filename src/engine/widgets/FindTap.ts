export type FindTarget = { id: string; found: boolean };

export function markFound(targets: FindTarget[], id: string): FindTarget[] {
  return targets.map((t) => (t.id === id ? { ...t, found: true } : t));
}

export function allFound(targets: FindTarget[]): boolean {
  return targets.every((t) => t.found);
}
