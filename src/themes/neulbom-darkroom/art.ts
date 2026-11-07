/**
 * Seats only. No production pictures or sound in the gray box.
 * Spec: docs/시리즈/늘봄/01_붉은방_설계_v1.md §9-7.
 */

export const BED = ['tick', 'wind', 'water', 'phone'] as const;
export const SFX = [
  'safelight',
  'crank',
  'burn',
  'tangle',
  'lock',
  'door',
  'shutter',
  'splash',
] as const;

export function playSeat(_id: (typeof BED)[number] | (typeof SFX)[number]): void {
  /* placeholder */
}
