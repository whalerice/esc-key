/**
 * Pointer gesture thresholds. Spec: docs/개발/공통엔진_v1.md §7-2.
 * Full recognizer wiring deferred — themes/widgets plug in later.
 */
export const GESTURE = {
  tapMovePx: 10,
  tapMs: 300,
  doubleTapMs: 280,
  longPressMs: 600,
  dragMovePx: 10,
} as const;

export type GestureKind =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'drag'
  | 'snap-drag'
  | 'rotate-drag'
  | 'pinch';
