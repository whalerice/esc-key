/**
 * Press and rest lengths. Emits the span list. Theme judges. Spec: §19-4.
 */

export type RhythmSpan = {
  kind: 'press' | 'rest';
  ms: number;
};

export type RhythmPressOpts = {
  onChange?: (spans: RhythmSpan[]) => void;
};

export class RhythmPress {
  spans: RhythmSpan[] = [];

  private downAt: number | null = null;
  private lastUp: number | null = null;
  private readonly opts: RhythmPressOpts;
  private unlisten: (() => void) | null = null;

  constructor(opts: RhythmPressOpts = {}) {
    this.opts = opts;
  }

  down(now: number): void {
    if (this.downAt != null) return;
    if (this.lastUp != null) {
      this.spans.push({ kind: 'rest', ms: Math.max(0, now - this.lastUp) });
      this.emit();
    }
    this.downAt = now;
  }

  up(now: number): void {
    if (this.downAt == null) return;
    this.spans.push({ kind: 'press', ms: Math.max(0, now - this.downAt) });
    this.downAt = null;
    this.lastUp = now;
    this.emit();
  }

  /** Open press, for the bar while the finger is down. */
  holding(now: number): number | null {
    return this.downAt == null ? null : Math.max(0, now - this.downAt);
  }

  clear(): void {
    this.spans = [];
    this.downAt = null;
    this.lastUp = null;
    this.emit();
  }

  /** Pad or button. Pointer down/up only — no answer check. */
  attach(el: HTMLElement): () => void {
    this.detach();
    el.style.touchAction = 'none';
    const down = (e: PointerEvent) => {
      if (e.button != null && e.button !== 0) return;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      this.down(performance.now());
    };
    const up = (e: PointerEvent) => {
      this.up(performance.now());
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    this.unlisten = () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
    return () => this.detach();
  }

  detach(): void {
    this.unlisten?.();
    this.unlisten = null;
  }

  private emit(): void {
    this.opts.onChange?.(this.spans);
  }
}
