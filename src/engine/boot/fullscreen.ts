/** Fullscreen / max-mode entry. Spec: docs/개발/공통엔진_v1.md §5. */

export async function requestFullscreen(el: HTMLElement = document.documentElement): Promise<boolean> {
  try {
    if (document.fullscreenElement) return true;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    // iOS Safari: element fullscreen unsupported — caller uses 100dvh / homescreen tip.
    return false;
  } catch {
    return false;
  }
}

export function exitFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  }
}

export function isFullscreen(): boolean {
  return Boolean(document.fullscreenElement);
}

export function onFullscreenChange(cb: () => void): () => void {
  document.addEventListener('fullscreenchange', cb);
  return () => document.removeEventListener('fullscreenchange', cb);
}
