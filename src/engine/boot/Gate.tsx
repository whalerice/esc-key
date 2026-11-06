'use client';

/**
 * Start gate. Does not enter fullscreen on its own.
 * Mobile asks first; fullscreen only after agree. PC never expands here.
 * Spec: docs/개발/공통엔진_v1.md §5.
 */
import { useCallback, useEffect, useState } from 'react';
import type { GateNeed } from '@/engine/types';
import { requestFullscreen } from './fullscreen';
import { lockLandscape } from './orientation';
import { requestWakeLock } from './wakeLock';
import { unlockAudio } from '@/engine/audio/SoundManager';
import { detectPlatform, type PlatformKind } from './platform';

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
  const [platform, setPlatform] = useState<PlatformKind | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const begin = useCallback(
    (wantFullscreen: boolean) => {
      if (loading || started) return;
      setStarted(true);

      const desktop = detectPlatform() === 'desktop';
      if (wantFullscreen && !desktop) {
        void requestFullscreen();
      }

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
    },
    [loading, started, needs, onStart],
  );

  if (started) return null;

  const askFullscreen = platform != null && platform !== 'desktop';

  return (
    <div className="engine-overlay gate" role="dialog" aria-label="시작 게이트">
      {loading ? (
        <div className="gate-loading">
          <div className="gate-bar" style={{ width: `${Math.round(progress * 100)}%` }} />
          <p>불러오는 중…</p>
        </div>
      ) : platform == null ? (
        <button type="button" className="gate-btn" disabled>
          {label}
        </button>
      ) : askFullscreen ? (
        <div className="gate-choices">
          <p className="gate-ask">화면을 크게 볼까요?</p>
          <button type="button" className="gate-btn" onClick={() => begin(true)}>
            크게 보기
          </button>
          <button type="button" className="gate-btn" onClick={() => begin(false)}>
            {label}
          </button>
        </div>
      ) : (
        <button type="button" className="gate-btn" onClick={() => begin(false)}>
          {label}
        </button>
      )}
    </div>
  );
}
