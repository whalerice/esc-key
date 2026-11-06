/**
 * Broadcast bed synced to the game clock.
 * Program + distance filter + noise use Howler's Web Audio graph.
 * Clues are not played here — use `playHtml5Clip`. Spec: §11, §19-6.
 * ponytail: cues loop the whole file until the next cue. Per-file loop points when assets exist.
 */
import { Howl, Howler } from 'howler';
import type { RadioBedDef } from '@/engine/types';
import { cueOffsetMs } from '@/engine/systems/Timer';
import { isAudioUnlocked } from '@/engine/audio/SoundManager';

export type DistancePreset = { cutoffHz: number; volume: number };

export const DISTANCE = {
  clear: { cutoffHz: 16000, volume: 1 },
  near: { cutoffHz: 5000, volume: 0.75 },
  far: { cutoffHz: 1200, volume: 0.4 },
  buried: { cutoffHz: 450, volume: 0.15 },
} as const;

type Cue = { soundId: string; offsetMs: number };

export class RadioBed {
  private readonly urls: Record<string, string>;
  private readonly startClock: string;
  private readonly howls = new Map<string, Howl>();
  private playing: Howl | null = null;
  private playingId: number | null = null;
  private activeIndex = -1;
  private token = 0;
  private filter: BiquadFilterNode | null = null;
  private program: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private distance: DistancePreset = DISTANCE.clear;
  private signal = 1;
  private paused = false;
  private clockMs = 0;
  private routed = new WeakSet<AudioNode>();

  constructor(
    public def: RadioBedDef = { cues: [] },
    opts: { sounds?: Record<string, string>; startClock?: string } = {},
  ) {
    this.urls = opts.sounds ?? {};
    this.startClock = opts.startClock ?? '00:00';
  }

  activeSoundId(): string | null {
    return this.cues()[this.activeIndex]?.soundId ?? null;
  }

  /** Elapsed ms since `startClock`. Seeks the matching cue. */
  sync(elapsedMs: number): void {
    this.clockMs = Math.max(0, elapsedMs);
    if (this.paused) return;
    this.follow();
  }

  /** Scene distance. 0.5s fade. Spec §19-6. */
  setDistance(preset: DistancePreset): void {
    this.distance = preset;
    this.ramp(true);
  }

  /** 1 = on a station (program up, noise down). */
  setSignal(signal: number): void {
    this.signal = clamp01(signal);
    this.ramp(false);
  }

  pause(): void {
    this.paused = true;
    if (this.playing && this.playingId != null) this.playing.pause(this.playingId);
    this.ramp(false);
  }

  /** After background / pause, pass the game clock again. */
  resume(elapsedMs = this.clockMs): void {
    this.paused = false;
    this.sync(elapsedMs);
  }

  dispose(): void {
    this.token += 1;
    this.pause();
    try {
      this.noise?.stop();
    } catch {
      /* already stopped */
    }
    this.noise = null;
    for (const howl of this.howls.values()) howl.unload();
    this.howls.clear();
    this.playing = null;
    this.playingId = null;
    this.filter?.disconnect();
    this.program?.disconnect();
    this.noiseGain?.disconnect();
    this.filter = null;
    this.program = null;
    this.noiseGain = null;
  }

  private cues(): Cue[] {
    const out: Cue[] = [];
    for (const cue of this.def.cues) {
      const offsetMs = cueOffsetMs(cue.at, this.startClock);
      if (offsetMs == null) continue;
      out.push({ soundId: cue.soundId, offsetMs });
    }
    return out;
  }

  private follow(): void {
    if (!isAudioUnlocked()) return;
    const cues = this.cues();
    let index = -1;
    for (let i = 0; i < cues.length; i++) {
      if (cues[i]!.offsetMs <= this.clockMs) index = i;
    }
    this.ensureGraph();
    if (index < 0) {
      this.token += 1;
      this.stopProgram();
      this.activeIndex = -1;
      return;
    }
    const cue = cues[index]!;
    const intoMs = this.clockMs - cue.offsetMs;
    if (this.activeIndex === index) {
      if (this.playing && this.playingId != null) {
        if (!this.playing.playing(this.playingId)) this.playing.play(this.playingId);
        this.seek(this.playing, this.playingId, intoMs);
      }
      return;
    }
    this.activeIndex = index;
    this.startCue(cue.soundId, intoMs);
  }

  private startCue(soundId: string, intoMs: number): void {
    const token = ++this.token;
    this.stopProgram();
    const url = this.urls[soundId];
    if (!url) return;
    const howl = this.howlFor(soundId, url);
    const begin = (id: number) => {
      if (token !== this.token || this.paused) {
        howl.stop(id);
        return;
      }
      this.playing = howl;
      this.playingId = id;
      this.seek(howl, id, intoMs);
      this.route(howl, id);
      this.ramp(false);
    };
    if (howl.state() === 'loaded') {
      begin(howl.play());
      return;
    }
    howl.once('load', () => {
      if (token !== this.token) return;
      begin(howl.play());
    });
    howl.load();
  }

  private howlFor(soundId: string, url: string): Howl {
    const cached = this.howls.get(soundId);
    if (cached) return cached;
    const howl = new Howl({
      src: [url],
      format: formatOf(url),
      html5: false,
      loop: true,
      preload: true,
    });
    this.howls.set(soundId, howl);
    return howl;
  }

  private seek(howl: Howl, id: number, intoMs: number): void {
    const dur = howl.duration(id) || howl.duration();
    const sec = Math.max(0, intoMs / 1000);
    const wrapped = dur > 0.05 ? sec % dur : sec;
    const cur = howl.seek(id);
    if (Math.abs(cur - wrapped) > 0.75) howl.seek(wrapped, id);
  }

  private stopProgram(): void {
    if (this.playing && this.playingId != null) this.playing.stop(this.playingId);
    this.playing = null;
    this.playingId = null;
  }

  private ensureGraph(): void {
    const ctx = Howler.ctx;
    if (!ctx || this.filter) return;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.distance.cutoffHz;
    this.program = ctx.createGain();
    this.program.gain.value = 0;
    this.filter.connect(Howler.masterGain);
    this.program.connect(this.filter);
    const seconds = 1;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0;
    src.connect(this.noiseGain);
    this.noiseGain.connect(Howler.masterGain);
    src.start();
    this.noise = src;
    this.ramp(false);
  }

  /** Howler private gain node → our filter. Program audio stays on the Web Audio path. */
  private route(howl: Howl, id: number): void {
    this.ensureGraph();
    const sound = (
      howl as unknown as { _soundById: (id: number) => { _node?: AudioNode } }
    )._soundById(id);
    const node = sound?._node;
    if (!node || !this.program || this.routed.has(node)) return;
    try {
      node.disconnect();
    } catch {
      /* not yet connected */
    }
    node.connect(this.program);
    this.routed.add(node);
  }

  private ramp(distanceFade: boolean): void {
    const ctx = Howler.ctx;
    if (!ctx || !this.program || !this.noiseGain || !this.filter) return;
    const t = ctx.currentTime;
    const fade = distanceFade ? 0.5 : 0.03;
    const programVol = this.paused ? 0 : this.distance.volume * this.signal;
    const noiseVol = this.paused ? 0 : (1 - this.signal) * 0.35;
    rampParam(this.program.gain, programVol, t, fade);
    rampParam(this.noiseGain.gain, noiseVol, t, fade);
    if (distanceFade) rampParam(this.filter.frequency, this.distance.cutoffHz, t, fade);
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function rampParam(param: AudioParam, value: number, time: number, fade: number): void {
  param.cancelScheduledValues(time);
  param.setValueAtTime(param.value, time);
  param.linearRampToValueAtTime(value, time + fade);
}

function formatOf(url: string): string[] {
  const m = /\.(mp3|wav|ogg|m4a|aac)(\?|#|$)/i.exec(url);
  return [m ? m[1]!.toLowerCase() : 'wav'];
}
