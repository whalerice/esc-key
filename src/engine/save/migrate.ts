/** Version migrate helper. Spec: docs/개발/공통엔진_v1.md §12. */

export function migrateOrReset<T>(
  raw: unknown,
  expectedVersion: number,
  migrate?: (old: unknown) => T,
): T | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = (raw as { version?: number }).version;
  if (v === expectedVersion) return raw as T;
  if (migrate) {
    try {
      return migrate(raw);
    } catch {
      return null;
    }
  }
  return null;
}
