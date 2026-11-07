/**
 * Breath loudness. Emits accumulated milliseconds. Does not judge a puzzle.
 * Spec: docs/개발/공통엔진_v1.md §10-1.
 * Broadband noise at or above `BREATH_LOUD` for `BREATH_NEED_MS` is a blow.
 * Silence clears the accumulator unless `hold` is set (finger standing in for breath).
 */

export const BREATH_NEED_MS = 1500;
export const BREATH_LOUD = 0.2;

export class BreathDetector {
  active = false;
  /** Finger is standing in for a blow. Mic silence must not clear `loudMs`. */
  hold = false;
  loudMs = 0;
  fails = 0;
  fallback = false;
  micOn = false;

  private last: number | null = null;
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private timer = 0;
  private unlisten: (() => void) | null = null;

  start(): void {
    this.active = true;
    this.loudMs = 0;
    this.last = null;
  }

  stop(): void {
    this.active = false;
    this.hold = false;
    this.loudMs = 0;
    this.last = null;
  }

  /**
   * `level` is 0–1. Returns accumulated loud milliseconds while active.
   * A quiet sample clears the run unless `hold` is set.
   */
  push(now: number, level: number): number {
    if (!this.active) return 0;
    const heard = this.hold ? 1 : level;
    if (this.last == null) {
      this.last = now;
      return this.loudMs;
    }
    const dt = Math.max(0, Math.min(200, now - this.last));
    this.last = now;
    if (heard >= BREATH_LOUD) this.loudMs += dt;
    else this.loudMs = 0;
    return this.loudMs;
  }

  /** Early release counts as a miss. The third miss raises `fallback`. */
  release(succeeded: boolean): boolean {
    if (succeeded) {
      this.fails = 0;
      return this.fallback;
    }
    this.fails += 1;
    if (this.fails >= 3) this.fallback = true;
    return this.fallback;
  }

  /**
   * Open the mic and feed `push`. Resolves false when permission is denied or
   * there is no input. Caller stops the track with `disarmMic`.
   */
  async armMic(onLoud?: (ms: number) => void): Promise<boolean> {
    this.disarmMic();
    this.start();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.micOn = false;
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext;
      const ctx = new Ctx();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      this.stream = stream;
      this.ctx = ctx;
      this.micOn = true;
      this.timer = window.setInterval(() => {
        if (this.hold) return;
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] ?? 0;
        const level = buf.length === 0 ? 0 : sum / buf.length / 255;
        onLoud?.(this.push(performance.now(), level));
      }, 100);
      return true;
    } catch {
      this.micOn = false;
      return false;
    }
  }

  /** Stop the mic track. Does not clear fail counts. */
  disarmMic(): void {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    const ctx = this.ctx;
    this.ctx = null;
    this.micOn = false;
    if (ctx) void ctx.close();
  }

  /** One-finger hold. Sets `hold` for as long as the pointer is down. */
  attachHold(el: HTMLElement, onLoud?: (ms: number) => void): () => void {
    this.detachHold();
    el.style.touchAction = 'none';
    const down = (event: PointerEvent) => {
      if (event.button != null && event.button !== 0) return;
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        /* pointer already gone */
      }
      if (!this.active) this.start();
      this.hold = true;
      onLoud?.(this.push(performance.now(), 1));
    };
    const move = (event: PointerEvent) => {
      if (!this.hold) return;
      onLoud?.(this.push(performance.now(), 1));
    };
    const up = () => {
      this.hold = false;
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
    return () => this.detachHold();
  }

  detachHold(): void {
    this.unlisten?.();
    this.unlisten = null;
    this.hold = false;
  }
}
