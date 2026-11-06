import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';

/** Contain 1920×1080 into a CSS box. Spec: docs/개발/공통엔진_v1.md §6. */
export type ViewportLayout = {
  scale: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

export function layoutContain(
  cssW: number,
  cssH: number,
  logicalW = LOGICAL_WIDTH,
  logicalH = LOGICAL_HEIGHT,
): ViewportLayout {
  const scale = Math.min(cssW / logicalW, cssH / logicalH);
  const width = logicalW * scale;
  const height = logicalH * scale;
  return {
    scale,
    width,
    height,
    offsetX: (cssW - width) / 2,
    offsetY: (cssH - height) / 2,
  };
}

export function maxDpr(lowEnd = false): number {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.min(dpr, lowEnd ? 1.5 : 2);
}
