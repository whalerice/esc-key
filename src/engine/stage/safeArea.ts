/** Safe-area CSS vars for HUD inset. Spec: docs/공통엔진.md §6. */

export function applySafeAreaVars(root: HTMLElement = document.documentElement): void {
  root.style.setProperty('--safe-top', 'env(safe-area-inset-top, 0px)');
  root.style.setProperty('--safe-right', 'env(safe-area-inset-right, 0px)');
  root.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)');
  root.style.setProperty('--safe-left', 'env(safe-area-inset-left, 0px)');
}
