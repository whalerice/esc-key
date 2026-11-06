/**
 * Shutter signals. Tap = dot, hold = dash, gap commits the code string.
 * Theme decides what the code means. Spec: §19-5.
 */

export const MORSE_DASH_MS = 400;
export const MORSE_GAP_MS = 1200;
const DOT = '·';
const DASH = '−';

export type MorseInputOpts = {
  dashMs?: number;
  gapMs?: number;
  onChange?: (code: string) => void;
  /** Committed signal, e.g. `··−`. Not a judged letter. */
  onLetter?: (code: string) => void;
};

export class MorseInput {
  code = '';

  private downAt: number | null = null;
  private lastUp: number | null = null;
  private committed = false;
  private readonly dashMs: number;
  private readonly gapMs: number;
  private readonly opts: MorseInputOpts;
  private unlisten: (() => void) | null = null;

  constructor(opts: MorseInputOpts = {}) {
    this.opts = opts;
    this.dashMs = opts.dashMs ?? MORSE_DASH_MS;
    this.gapMs = opts.gapMs ?? MORSE_GAP_MS;
  }

  down(now: number): void {
    if (this.committed) {
      this.code = '';
      this.committed = false;
      this.opts.onChange?.(this.code);
    }
    this.downAt = now;
  }

  up(now: number): void {
    if (this.downAt == null) return;
    const held = now - this.downAt;
    this.downAt = null;
    this.lastUp = now;
    this.code += held >= this.dashMs ? DASH : DOT;
    this.opts.onChange?.(this.code);
  }

  /** Call on a clock. Gap after the last lift commits `code`. */
  tick(now: number): void {
    if (this.downAt != null || this.lastUp == null || this.committed || this.code === '') return;
    if (now - this.lastUp >= this.gapMs) {
      this.committed = true;
      this.opts.onLetter?.(this.code);
    }
  }

  clear(): void {
    this.code = '';
    this.downAt = null;
    this.lastUp = null;
    this.committed = false;
    this.opts.onChange?.(this.code);
  }

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
}
