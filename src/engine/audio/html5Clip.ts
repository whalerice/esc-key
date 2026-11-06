/**
 * Clue / old-broadcast playback. HTML5 Audio only — not Web Audio.
 * iPhone silent switch must still hear these. Spec: docs/개발/공통엔진_v1.md §11, §19-6.
 */

const live = new Set<HTMLAudioElement>();
let muted = false;
let volume = 1;

export function setHtml5Muted(on: boolean): void {
  muted = on;
  for (const audio of live) audio.muted = on;
}

export function setHtml5Volume(v: number): void {
  volume = Math.min(1, Math.max(0, v));
  for (const audio of live) audio.volume = volume;
}

export function playHtml5Clip(url: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  audio.volume = volume;
  audio.muted = muted;
  live.add(audio);
  const drop = () => live.delete(audio);
  audio.addEventListener('ended', drop);
  audio.addEventListener('error', drop);
  void audio.play().catch(() => undefined);
  return audio;
}

export function stopHtml5Clips(): void {
  for (const audio of live) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
  live.clear();
}
