/**
 * Finger drawing. Emits strokes. Does not read the writing.
 * One pointer. Coordinates are 0–1 inside the pad.
 * ponytail: 24 strokes × 48 points. Raise the cap if a name needs a denser line.
 */

export type StrokePoint = { x: number; y: number };
export type Stroke = StrokePoint[];

const MAX_STROKES = 24;
const MAX_POINTS = 48;

export class StrokePad {
  strokes: Stroke[] = [];

  private current: Stroke | null = null;
  private pointer: number | null = null;
  private unlisten: (() => void) | null = null;

  constructor(private onChange?: (strokes: Stroke[]) => void) {}

  clear(): void {
    this.strokes = [];
    this.current = null;
    this.pointer = null;
    this.emit();
  }

  begin(x: number, y: number): void {
    if (this.strokes.length >= MAX_STROKES) return;
    this.current = [clamp(x, y)];
    this.strokes = [...this.strokes, this.current];
    this.emit();
  }

  extend(x: number, y: number): void {
    if (!this.current || this.current.length >= MAX_POINTS) return;
    this.current.push(clamp(x, y));
    this.emit();
  }

  end(): void {
    this.current = null;
    this.pointer = null;
  }

  /** One finger. A second pointer is ignored. */
  attach(el: HTMLElement): () => void {
    this.detach();
    el.style.touchAction = 'none';
    const down = (event: PointerEvent) => {
      if (event.button != null && event.button !== 0) return;
      if (this.pointer != null) return;
      this.pointer = event.pointerId;
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        /* pointer already gone */
      }
      const point = local(el, event);
      this.begin(point.x, point.y);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== this.pointer) return;
      const point = local(el, event);
      this.extend(point.x, point.y);
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== this.pointer) return;
      this.end();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    this.unlisten = () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    return () => this.detach();
  }

  detach(): void {
    this.unlisten?.();
    this.unlisten = null;
    this.end();
  }

  private emit(): void {
    this.onChange?.(this.strokes.map((stroke) => stroke.map((point) => ({ ...point }))));
  }
}

function clamp(x: number, y: number): StrokePoint {
  return {
    x: Math.round(Math.min(1, Math.max(0, x)) * 1000) / 1000,
    y: Math.round(Math.min(1, Math.max(0, y)) * 1000) / 1000,
  };
}

function local(el: HTMLElement, event: PointerEvent): StrokePoint {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
}
