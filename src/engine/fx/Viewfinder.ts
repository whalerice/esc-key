/**
 * Draggable rectangle. The glass sits off the finger so the thumb does not
 * cover the inside. Emits a rect. Does not know what year is under it.
 * Spec: docs/개발/공통엔진_v1.md §8-8. docs/시리즈/늘봄/07_막차이후_설계_v1.md §9-3.
 */

export type ViewRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** True when the glass flipped below the finger. */
  flipped: boolean;
};

export function viewfinderSize(
  boundsW: number,
  boundsH: number,
  heightRatio = 0.55,
): { w: number; h: number } {
  const h = Math.max(44, boundsH * heightRatio);
  const w = Math.max(44, Math.min(boundsW * 0.46, h * 1.2));
  return {
    w: Math.min(w, boundsW),
    h: Math.min(h, boundsH),
  };
}

/**
 * Window off the finger. Prefers above. Uses below when above would cover
 * the finger after clamping into the pad.
 */
export function placeViewfinder(
  fingerX: number,
  fingerY: number,
  boundsW: number,
  boundsH: number,
  heightRatio = 0.55,
  gap = 16,
): ViewRect {
  const { w, h } = viewfinderSize(boundsW, boundsH, heightRatio);
  const x = clamp(fingerX - w / 2, 0, Math.max(0, boundsW - w));
  const tops = [
    { y: fingerY - h - gap, flipped: false },
    { y: fingerY + gap, flipped: true },
  ];
  let picked = tops[0]!;
  let best = Infinity;
  for (const cand of tops) {
    const y = clamp(cand.y, 0, Math.max(0, boundsH - h));
    const coversFinger = rectContains({ x, y, w, h }, fingerX, fingerY);
    const score = (coversFinger ? 1000 : 0) + Math.abs(y - cand.y);
    if (score < best) {
      best = score;
      picked = { y, flipped: cand.flipped };
    }
  }
  return { x, y: picked.y, w, h, flipped: picked.flipped };
}

export function rectContains(rect: Pick<ViewRect, 'x' | 'y' | 'w' | 'h'>, px: number, py: number): boolean {
  return px >= rect.x && py >= rect.y && px < rect.x + rect.w && py < rect.y + rect.h;
}

/**
 * A finger whose glass covers `tx,ty`.
 * Prefers the finger below the glass. Falls back to above.
 */
export function fingerForViewfinder(
  tx: number,
  ty: number,
  boundsW: number,
  boundsH: number,
  heightRatio = 0.55,
  gap = 16,
): { x: number; y: number } {
  const { h } = viewfinderSize(boundsW, boundsH, heightRatio);
  const tries = [
    { x: tx, y: ty + h / 2 + gap },
    { x: tx, y: ty - h / 2 - gap },
    { x: tx, y: boundsH - 4 },
    { x: tx, y: 4 },
  ];
  for (const finger of tries) {
    const rect = placeViewfinder(finger.x, finger.y, boundsW, boundsH, heightRatio, gap);
    if (rectContains(rect, tx, ty) && !rectContains(rect, finger.x, finger.y)) return finger;
  }
  return tries[0]!;
}

export class Viewfinder {
  rect: ViewRect = { x: 0, y: 0, w: 0, h: 0, flipped: false };

  place(
    fingerX: number,
    fingerY: number,
    boundsW: number,
    boundsH: number,
    heightRatio = 0.55,
    gap = 16,
  ): ViewRect {
    this.rect = placeViewfinder(fingerX, fingerY, boundsW, boundsH, heightRatio, gap);
    return this.rect;
  }

  covers(px: number, py: number): boolean {
    return rectContains(this.rect, px, py);
  }

  /** One pointer. Local px of `el`. Does not open a shutter. */
  attach(
    el: HTMLElement,
    onPlace: (rect: ViewRect) => void,
    heightRatio = 0.55,
  ): () => void {
    el.style.touchAction = 'none';
    let active: number | null = null;
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      if (active != null) return;
      if (e.button != null && e.button !== 0) return;
      active = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      const p = local(e);
      const box = el.getBoundingClientRect();
      onPlace(this.place(p.x, p.y, box.width, box.height, heightRatio));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      const p = local(e);
      const box = el.getBoundingClientRect();
      onPlace(this.place(p.x, p.y, box.width, box.height, heightRatio));
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      active = null;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
