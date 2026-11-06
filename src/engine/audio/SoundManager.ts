/**
 * Howler shell. Spec: docs/개발/공통엔진_v1.md §11.
 * Gate tap calls unlockAudio(); pre-unlock play() is dropped.
 */
import { Howl, Howler } from 'howler';
import { setHtml5Muted } from '@/engine/audio/html5Clip';

let unlocked = false;

export function isAudioUnlocked(): boolean {
  return unlocked;
}

export function unlockAudio(): void {
  unlocked = true;
  if (typeof navigator !== 'undefined') {
    const session = (navigator as Navigator & { audioSession?: { type: string } })
      .audioSession;
    try {
      if (session) session.type = 'playback';
    } catch {
      /* ignore */
    }
  }
  try {
    Howler.ctx?.resume?.();
  } catch {
    /* ignore */
  }
}

export type SoundManagerOpts = {
  spriteUrl?: string;
  bgmUrls?: string[];
};

export class SoundManager {
  private sprite: Howl | null = null;
  private bgm: Howl | null = null;

  constructor(private opts: SoundManagerOpts = {}) {}

  /** Load stubs — real sprite maps come from theme asset defs. */
  load(): void {
    if (this.opts.spriteUrl) {
      this.sprite = new Howl({ src: [this.opts.spriteUrl], preload: true });
    }
  }

  playSfx(_id: string): void {
    if (!unlocked) return;
    // ponytail: sprite id map filled when theme assets land
  }

  playBgm(url?: string): void {
    if (!unlocked) return;
    const src = url ?? this.opts.bgmUrls?.[0];
    if (!src) return;
    this.bgm?.stop();
    this.bgm = new Howl({ src: [src], loop: true, volume: 0.6 });
    this.bgm.play();
  }

  duck(factor = 0.4): void {
    if (this.bgm) this.bgm.volume(0.6 * factor);
  }

  unduck(): void {
    if (this.bgm) this.bgm.volume(0.6);
  }

  mute(on: boolean): void {
    Howler.mute(on);
    setHtml5Muted(on);
  }

  dispose(): void {
    this.sprite?.unload();
    this.bgm?.unload();
    this.sprite = null;
    this.bgm = null;
  }
}
