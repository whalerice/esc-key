'use client';

/**
 * Theme play shell: gate → layers → Pixi stage.
 * Spec: docs/공통엔진.md §4–§5. Themes plug scenes/puzzles later.
 */
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ThemeDefinition } from '@/engine/types';
import { Gate } from '@/engine/boot/Gate';
import { isSuppressed, watchOrientation } from '@/engine/boot/orientation';
import { requestFullscreen, onFullscreenChange, isFullscreen } from '@/engine/boot/fullscreen';
import { applySafeAreaVars } from '@/engine/stage/safeArea';
import { Hud } from '@/engine/ui/Hud';
import { Narration } from '@/engine/ui/Narration';
import { Banner } from '@/engine/ui/Banner';
import { RotateOverlay } from '@/engine/ui/RotateOverlay';
import { formatMmSs, remainingMs } from '@/engine/systems/Timer';
import { SoundManager } from '@/engine/audio/SoundManager';

const PixiStage = dynamic(() => import('@/engine/stage/PixiStage'), {
  ssr: false,
  loading: () => <div className="pixi-stage pixi-stage--loading" />,
});

export function ThemePlay({ theme }: { theme: ThemeDefinition }) {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [muted, setMuted] = useState(false);
  const [maxBlink, setMaxBlink] = useState(false);
  const [line, setLine] = useState<string | null>(
    '엔진 스텁 — 테마 장면은 아직 없음. 탭해서 넘기기.',
  );
  const sound = useMemo(() => new SoundManager(), []);

  useEffect(() => {
    applySafeAreaVars();
    const offOrient = watchOrientation((landscape) => {
      if (isSuppressed()) return;
      setPortrait(!landscape);
    });
    const offFs = onFullscreenChange(() => {
      setMaxBlink(!isFullscreen());
    });
    return () => {
      offOrient();
      offFs();
      sound.dispose();
    };
  }, [sound]);

  const timerLabel = useMemo(() => {
    if (theme.timer.skin === 'none' || theme.timer.durationMs == null) {
      return null;
    }
    const left = remainingMs(theme.timer.durationMs, {
      elapsedMs: 0,
      bonusPausedMs: 0,
      penaltyMs: 0,
    });
    return formatMmSs(left);
  }, [theme]);

  const onStart = useCallback(() => setBooted(true), []);

  return (
    <div className="theme-play" data-theme={theme.id}>
      <div className="theme-stage-wrap">
        {booted && (
          <PixiStage background={theme.scenes[0]?.background ?? '#0a0a0a'} />
        )}
      </div>

      {/* layer 5 — narration */}
      {booted && (
        <Narration line={line} onAdvance={() => setLine(null)} />
      )}

      {/* layer 4 — HUD */}
      {booted && (
        <Hud
          inventoryName={theme.hud.inventoryName}
          timerLabel={timerLabel}
          muted={muted}
          maxModeBlink={maxBlink}
          notebook={theme.hud.notebook}
          onBack={() => router.push('/neulbom')}
          onHint={() => setLine('힌트 스텁 — 길게 누르기 연동 예정')}
          onMute={() => {
            const next = !muted;
            setMuted(next);
            sound.mute(next);
          }}
          onMaxMode={() => {
            void requestFullscreen();
            setMaxBlink(false);
          }}
        />
      )}

      {/* layer 3 — banner (idle stub) */}
      <Banner text={null} />

      {/* layer 1 — system */}
      <RotateOverlay show={booted && portrait} />
      {!booted && (
        <Gate
          label={theme.gate.label}
          needs={theme.gate.needs}
          onStart={onStart}
        />
      )}
    </div>
  );
}
