'use client';

/**
 * Start gate — one tap starts fullscreen → landscape lock → Howler unlock → wake lock → optional perms.
 * Spec: docs/공통엔진.md §5.
 */
import { useCallback, useState } from 'react';
import type { GateNeed } from '@/engine/types';
import { requestFullscreen } from './fullscreen';
import { lockLandscape } from './orientation';
import { requestWakeLock } from './wakeLock';
import { unlockAudio } from '@/engine/audio/SoundManager';

export type GateProps = {
  label: string;
  needs?: GateNeed[];
  loading?: boolean;
  progress?: number;
  onStart: () => void;
};

export function Gate({
  label,
  needs = [],
  loading = false,
  progress = 0,
  onStart,
}: GateProps) {
  const [started, setStarted] = useState(false);

  const handleTap = useCallback(() => {
    if (loading || started) return;
    setStarted(true);

    // Sync start inside the user gesture; do not await permission results.
    void requestFullscreen();
    void lockLandscape();
    unlockAudio();
    void requestWakeLock();

    if (needs.includes('mic')) {
      void navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then((stream) => stream.getTracks().forEach((t) => t.stop()))
        .catch(() => undefined);
    }
    if (needs.includes('orientation')) {
      const Doe = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      void Doe.requestPermission?.().catch(() => undefined);
    }

    onStart();
  }, [loading, started, needs, onStart]);

  if (started) return null;

  return (
    <div className="engine-overlay gate" role="dialog" aria-label="시작 게이트">
      {loading ? (
        <div className="gate-loading">
          <div className="gate-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
          <p>불러오는 중…</p>
        </div>
      ) : (
        <button type="button" className="gate-btn" onClick={handleTap}>
          {label}
        </button>
      )}
    </div>
  );
}
