/** Device / browser helpers. Spec: docs/개발/공통엔진_v1.md §5-2. */

export type PlatformKind =
  | 'android-chrome'
  | 'iphone-safari'
  | 'iphone-homescreen'
  | 'ipad'
  | 'desktop'
  | 'other';

export function detectPlatform(): PlatformKind {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  const isIpad =
    /iPad/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIpad) return 'ipad';
  if (/iPhone|iPod/.test(ua)) {
    const standalone =
      ('standalone' in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone)) ||
      window.matchMedia('(display-mode: standalone)').matches;
    return standalone ? 'iphone-homescreen' : 'iphone-safari';
  }
  if (/Android/.test(ua)) return 'android-chrome';
  if (!('ontouchstart' in window)) return 'desktop';
  return 'other';
}

export function isLandscape(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= window.innerHeight;
}
