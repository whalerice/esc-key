/**
 * Seats only. No production pictures or sound in the gray box.
 * Spec: docs/시리즈/늘봄/05_겨울온실_설계_v1.md §10-7.
 */

export const BED = ['wind', 'boiler', 'heater'] as const;
export const SFX = ['valve-fail', 'heater-on', 'lock', 'page', 'bloom', 'crayons'] as const;

export function playSeat(_id: (typeof BED)[number] | (typeof SFX)[number]): void {
  /* placeholder */
}
