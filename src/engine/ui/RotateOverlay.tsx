'use client';

/** Portrait rotate guide — system overlay (layer 1). Spec: §5-3. */

export function RotateOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="engine-overlay rotate" data-layer="system" role="alert">
      <p>기기를 가로로 돌려 주세요</p>
    </div>
  );
}
