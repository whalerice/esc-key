/**
 * Saved progress. Crank angle, bath temperature, spiral progress, loupe
 * position, tank time, and face-down hold stay off this object.
 * Spec: docs/시리즈/늘봄/01_붉은방_설계_v1.md §9-1, §9-8. docs/개발/공통엔진_v1.md §12-2.
 */

export type DodgeMask = { left: number; right: number };

export type DarkroomExtra = {
  safelightOn: boolean;
  faceDownFallback: boolean;
  /** Clip slots. Empty until the first hang. */
  clotheslineOrder: string[];
  dodgeMask: DodgeMask | null;
};

export const initialExtra: DarkroomExtra = {
  safelightOn: false,
  faceDownFallback: false,
  clotheslineOrder: [],
  dodgeMask: null,
};
