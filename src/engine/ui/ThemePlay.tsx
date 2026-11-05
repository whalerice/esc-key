'use client';

/**
 * Theme play shell: gate → layers → Pixi stage + theme store.
 * Spec: docs/공통엔진.md §4–§5, §12.
 */
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Application } from 'pixi.js';
import type { PuzzleId, ThemeDefinition } from '@/engine/types';
import type { ThemeStoreApi } from '@/engine/save/createThemeStore';
import type { SceneMount } from '@/engine/ui/SceneMount';

/** Zustand hook + getState — persist mutators vary; keep structural. */
export type ThemePlayStore = {
  <U>(selector: (state: ThemeStoreApi<unknown>) => U): U;
  getState: () => ThemeStoreApi<unknown>;
};
import { Gate } from '@/engine/boot/Gate';
import { isSuppressed, watchOrientation } from '@/engine/boot/orientation';
import { requestFullscreen, onFullscreenChange, isFullscreen } from '@/engine/boot/fullscreen';
import { applySafeAreaVars } from '@/engine/stage/safeArea';
import { Hud } from '@/engine/ui/Hud';
import { Narration } from '@/engine/ui/Narration';
import { Banner } from '@/engine/ui/Banner';
import { RotateOverlay } from '@/engine/ui/RotateOverlay';
import { HintMemo } from '@/engine/ui/HintMemo';
import { formatMmSs, remainingMs } from '@/engine/systems/Timer';
import { hintText, nextHintStep } from '@/engine/systems/Hints';
import { SoundManager } from '@/engine/audio/SoundManager';

const PixiStage = dynamic(() => import('@/engine/stage/PixiStage'), {
  ssr: false,
  loading: () => <div className="pixi-stage pixi-stage--loading" />,
});

const CHANNEL_LABEL: Record<ThemeDefinition['hud']['hintChannel'], string> = {
  'author-notebook': '작가의 메모장',
  radio: '무전기',
  'rotary-phone': '다이얼 전화',
  extension: '내선 전화',
  'guard-phone': '경비실 전화',
};

export type ThemePlayProps = {
  theme: ThemeDefinition;
  useStore: ThemePlayStore;
  mountScene: SceneMount;
  openingLines?: string[];
};

export function ThemePlay({
  theme,
  useStore,
  mountScene,
  openingLines = [],
}: ThemePlayProps) {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [muted, setMuted] = useState(false);
  const [maxBlink, setMaxBlink] = useState(false);
  const [queue, setQueue] = useState<string[]>(openingLines);
  const line = queue[0] ?? null;
  const [hintOpen, setHintOpen] = useState(false);
  const [hintBody, setHintBody] = useState<string | null>(null);
  const [hintStepLabel, setHintStepLabel] = useState<string | undefined>();
  const [hintIntro, setHintIntro] = useState<string | undefined>();
  const sound = useMemo(() => new SoundManager(), []);
  const unmountRef = useRef<(() => void) | null>(null);

  const items = useStore((s) => s.items);
  const hintsUsed = useStore((s) => s.hintsUsed);
  const solved = useStore((s) => s.solved);

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
      unmountRef.current?.();
      unmountRef.current = null;
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

  const say = useCallback((text: string) => {
    setQueue((q) => [...q, text]);
  }, []);

  const activePuzzle = useMemo((): PuzzleId | null => {
    for (const p of theme.puzzles) {
      if (!solved[p.id]) return p.id;
    }
    return theme.puzzles[theme.puzzles.length - 1]?.id ?? null;
  }, [theme.puzzles, solved]);

  const onStageReady = useCallback(
    (app: Application) => {
      unmountRef.current?.();
      const dispose = mountScene({
        app,
        theme,
        store: useStore.getState(),
        getState: () => useStore.getState(),
        say,
        openPuzzle: () => undefined,
        closePuzzle: () => undefined,
        onSolved: (id) => {
          useStore.getState().markSolved(id);
        },
      });
      unmountRef.current = dispose;
    },
    [theme, useStore, mountScene, say],
  );

  const onStart = useCallback(() => setBooted(true), []);

  const onHint = useCallback(() => {
    if (!activePuzzle) {
      setHintBody('더 이상 열 힌트가 없어요.');
      setHintStepLabel(undefined);
      setHintIntro(undefined);
      setHintOpen(true);
      return;
    }
    const current = (hintsUsed[activePuzzle] ?? 0) as 0 | 1 | 2 | 3;
    if (current >= 3) {
      setHintBody(hintText(theme.hints, activePuzzle, 3) ?? '힌트가 없습니다.');
      setHintStepLabel('힌트 3/3');
    } else {
      const step = nextHintStep(current);
      useStore.getState().setHintStep(activePuzzle, step);
      setHintBody(
        hintText(theme.hints, activePuzzle, step as 1 | 2 | 3) ?? '힌트가 없습니다.',
      );
      setHintStepLabel(`힌트 ${step}/3`);
    }
    setHintIntro(theme.hints[activePuzzle]?.intro);
    setHintOpen(true);
  }, [activePuzzle, hintsUsed, theme.hints, useStore]);

  return (
    <div className="theme-play" data-theme={theme.id}>
      <div className="theme-stage-wrap">
        {booted && (
          <PixiStage
            background={theme.scenes[0]?.background ?? '#0a0a0a'}
            onReady={onStageReady}
          />
        )}
      </div>

      {booted && (
        <Narration line={line} onAdvance={() => setQueue((q) => q.slice(1))} />
      )}

      {booted && (
        <Hud
          inventoryName={theme.hud.inventoryName}
          itemCount={items.length}
          itemLabels={items}
          timerLabel={timerLabel}
          muted={muted}
          maxModeBlink={maxBlink}
          notebook={theme.hud.notebook}
          onBack={() => router.push('/neulbom')}
          onHint={onHint}
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

      <Banner text={null} />

      {booted && (
        <HintMemo
          open={hintOpen}
          channelLabel={CHANNEL_LABEL[theme.hud.hintChannel]}
          intro={hintIntro}
          stepLabel={hintStepLabel}
          body={hintBody}
          onClose={() => setHintOpen(false)}
        />
      )}

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
