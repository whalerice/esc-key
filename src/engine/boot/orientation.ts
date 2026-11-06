/** Landscape lock + portrait pause. Spec: docs/개발/공통엔진_v1.md §5-3, §9. */

let suppressed = false;

export function suppress(on = true): void {
  suppressed = on;
}

export function isSuppressed(): boolean {
  return suppressed;
}

/** Best-effort screen orientation lock (Android fullscreen only). */
export async function lockLandscape(): Promise<boolean> {
  try {
    const orient = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    if (orient?.lock) {
      await orient.lock('landscape');
      return true;
    }
  } catch {
    /* iOS / unsupported */
  }
  return false;
}

export type OrientationListener = (landscape: boolean) => void;

export function watchOrientation(cb: OrientationListener): () => void {
  const fire = () => {
    if (suppressed) return;
    cb(window.innerWidth >= window.innerHeight);
  };
  window.addEventListener('resize', fire);
  window.addEventListener('orientationchange', fire);
  fire();
  return () => {
    window.removeEventListener('resize', fire);
    window.removeEventListener('orientationchange', fire);
  };
}
