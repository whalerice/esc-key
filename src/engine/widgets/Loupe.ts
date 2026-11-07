/**
 * Circular glass that sits off the finger so the thumb does not cover it.
 * Near the top edge the glass flips below the finger.
 * Emits a center. Does not know what is under the glass.
 * Spec: docs/시리즈/늘봄/01_붉은방_설계_v1.md §9-4.
 */

export type LoupePlace = { x: number; y: number; flipped: boolean };

export function placeLoupe(
  fingerX: number,
  fingerY: number,
  width: number,
  height: number,
  radius: number,
  gap = 12,
): LoupePlace {
  let flipped = false;
  let y = fingerY - radius - gap;
  if (y - radius < 0) {
    flipped = true;
    y = fingerY + radius + gap;
  }
  const x = Math.min(Math.max(radius, fingerX), Math.max(radius, width - radius));
  y = Math.min(Math.max(radius, y), Math.max(radius, height - radius));
  return { x, y, flipped };
}

/** Finger point whose glass center lands on the target, including the top flip. */
export function fingerForTarget(
  tx: number,
  ty: number,
  width: number,
  height: number,
  radius: number,
  gap = 12,
): { x: number; y: number } {
  const below = { x: tx, y: ty + radius + gap };
  const viaBelow = placeLoupe(below.x, below.y, width, height, radius, gap);
  if (Math.hypot(viaBelow.x - tx, viaBelow.y - ty) <= 1) return below;
  return { x: tx, y: ty - radius - gap };
}

export class Loupe {
  x = 0;
  y = 0;
  flipped = false;
  radius = 0;

  place(
    fingerX: number,
    fingerY: number,
    width: number,
    height: number,
    radius: number,
    gap = 12,
  ): LoupePlace {
    const next = placeLoupe(fingerX, fingerY, width, height, radius, gap);
    this.x = next.x;
    this.y = next.y;
    this.flipped = next.flipped;
    this.radius = radius;
    return next;
  }

  covers(tx: number, ty: number): boolean {
    return Math.hypot(this.x - tx, this.y - ty) <= this.radius;
  }

  /** One pointer. Local px. Radius is the glass, not a puzzle. */
  attach(
    el: HTMLElement,
    radius: number,
    onPlace: (place: LoupePlace) => void,
    gap = 12,
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
      onPlace(this.place(p.x, p.y, box.width, box.height, radius, gap));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== active) return;
      const p = local(e);
      const box = el.getBoundingClientRect();
      onPlace(this.place(p.x, p.y, box.width, box.height, radius, gap));
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
