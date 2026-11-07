/**
 * Seats only. No production pictures or sound in the gray box.
 * Spec: docs/시리즈/늘봄/07_막차이후_설계_v1.md §9-5.
 */

export const BED = ['fluorescent', 'station', 'rail'] as const;
export const SFX = ['boot', 'shutter', 'sms', 'hangup', 'poweroff'] as const;

export function playSeat(_id: (typeof BED)[number] | (typeof SFX)[number]): void {
  /* placeholder */
}
