'use client';

/**
 * Theme play shell: gate → layers → Pixi stage + theme store.
 * Spec: docs/개발/공통엔진_v1.md §4–§5, §12.
 */
import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
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
import { hudCollapsed } from '@/engine/ui/hudCollapse';
import { Narration } from '@/engine/ui/Narration';
import { asCaption, type CaptionInput, type CaptionLine, type SayFn } from '@/engine/ui/caption';
import { Banner } from '@/engine/ui/Banner';
import { RotateOverlay } from '@/engine/ui/RotateOverlay';
import { HintMemo } from '@/engine/ui/HintMemo';
import { remainingMs, resolveOnZero, TimerController, timerFace } from '@/engine/systems/Timer';
import type { TimerState } from '@/engine/systems/Timer';
import { TimerFace } from '@/engine/ui/TimerFace';
import { findEnding } from '@/engine/systems/Endings';
import {
  channelForPuzzle,
  hintText,
  nextHintStep,
  nextSmallTalkIndex,
  smallTalkLine,
} from '@/engine/systems/Hints';
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
  messenger: '메신저',
  walkie: '무전',
  'speaking-tube': '전성관',
  thimble: '골무',
};

export type ThemePlayProps = {
  theme: ThemeDefinition;
  useStore: ThemePlayStore;
  mountScene: SceneMount;
  openingLines?: CaptionInput[];
  /** Shown under the gate button. */
  gateNote?: string;
  /** Theme overlay once the gate has opened. `askHint` opens the HUD hint (sewing scenes hide that button). */
  overlay?:
    | ReactNode
    | ((api: {
        say: SayFn;
        selectedItem: string | null;
        askHint: () => void;
      }) => ReactNode);
  /** Fair clock. Theme syncs RadioBed here — frequencies stay out of the save. */
  onClock?: (elapsedMs: number) => void;
  /** Hold the clock (ending A). */
  pauseWhen?: boolean;
  /** Wipe the save when the clock hits zero. Pair with the 처음부터 button. */
  onReplay?: () => void;
  /** Clear ending (P8). Timer-zero still uses `onZero`. */
  clearedEnding?: string | null;
  renderResult?: (result: {
    id: string;
    title: string;
    elapsedMs: number;
    remainingMs: number;
  }) => ReactNode;
  /** Inventory drag onto `[data-use-target]`. */
  onUseItem?: (itemId: string, targetId: string) => void;
  /** Live clock. `pause(ms)` grants bonus time. `penalty(ms)` shortens it. */
  timerRef?: MutableRefObject<ThemeTimerApi | null>;
  /** HUD notebook button. Theme opens its own sheet. */
  onNotebook?: () => void;
};

export type ThemeTimerApi = {
  pause: (ms: number) => void;
  penalty: (ms: number) => void;
};

export function ThemePlay({
  theme,
  useStore,
  mountScene,
  openingLines = [],
  gateNote,
  overlay,
  onClock,
  pauseWhen = false,
  onReplay,
  clearedEnding = null,
  renderResult,
  onUseItem,
  timerRef,
  onNotebook,
}: ThemePlayProps) {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [muted, setMuted] = useState(false);
  const [maxBlink, setMaxBlink] = useState(false);
  const [queue, setQueue] = useState<CaptionLine[]>(() => openingLines.map(asCaption));
  const line = queue[0] ?? null;
  const [hintOpen, setHintOpen] = useState(false);
  const [hintBody, setHintBody] = useState<string | null>(null);
  const [hintStepLabel, setHintStepLabel] = useState<string | undefined>();
  const [hintIntro, setHintIntro] = useState<string | undefined>();
  const [snap, setSnap] = useState<TimerState>(() => useStore.getState().timer);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const talkRef = useRef<Partial<Record<string, number>>>({});
  const sound = useMemo(() => new SoundManager(), []);
  const unmountRef = useRef<(() => void) | null>(null);
  const ctrlRef = useRef<TimerController | null>(null);
  const portraitRef = useRef(portrait);
  const pauseRef = useRef(pauseWhen);
  const onClockRef = useRef(onClock);
  const onReplayRef = useRef(onReplay);
  const endedRef = useRef(false);
  portraitRef.current = portrait;
  pauseRef.current = pauseWhen;
  onClockRef.current = onClock;
  onReplayRef.current = onReplay;

  const items = useStore((s) => s.items);
  const scene = useStore((s) => s.scene);
  const hintsUsed = useStore((s) => s.hintsUsed);
  const solved = useStore((s) => s.solved);

  useEffect(() => {
    if (selectedItem && !items.includes(selectedItem)) setSelectedItem(null);
  }, [items, selectedItem]);

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

  useEffect(() => {
    if (!booted) return;
    const ctrl = new TimerController(theme.timer.durationMs, useStore.getState().timer);
    ctrlRef.current = ctrl;
    ctrl.start();
    setSnap(ctrl.snapshot());
    if (timerRef) {
      timerRef.current = {
        pause(ms: number) {
          ctrl.pause(ms);
          commit();
        },
        penalty(ms: number) {
          ctrl.penalty(ms);
          commit();
        },
      };
      function commit() {
        const next = ctrl.snapshot();
        setSnap(next);
        useStore.getState().patchTimer({
          elapsedMs: next.elapsedMs,
          bonusPausedMs: next.bonusPausedMs,
          penaltyMs: next.penaltyMs,
        });
      }
    }
    let firedZero = false;
    const id = window.setInterval(() => {
      if (pauseRef.current) ctrl.pause();
      const next = ctrl.snapshot();
      setSnap(next);
      onClockRef.current?.(next.elapsedMs);
      if (!firedZero && !pauseRef.current && ctrl.remaining() === 0) {
        firedZero = true;
        ctrl.pause();
        setEndingId(resolveOnZero(theme.timer.onZero, useStore.getState().solved));
        if (onReplayRef.current) {
          endedRef.current = true;
          onReplayRef.current();
        } else {
          useStore.getState().patchTimer({ elapsedMs: next.elapsedMs });
        }
      }
    }, 250);
    const onVis = () => {
      if (document.hidden) {
        ctrl.pause();
        if (!endedRef.current) useStore.getState().patchTimer({ elapsedMs: ctrl.elapsed() });
      } else if (!portraitRef.current && !pauseRef.current && ctrl.remaining() !== 0) {
        ctrl.resume();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      if (!endedRef.current) useStore.getState().patchTimer({ elapsedMs: ctrl.elapsed() });
      ctrlRef.current = null;
      if (timerRef) timerRef.current = null;
    };
  }, [booted, theme, useStore, timerRef]);

  useEffect(() => {
    const ctrl = ctrlRef.current;
    if (!ctrl || !booted) return;
    if (portrait || document.hidden || ctrl.remaining() === 0 || pauseWhen) ctrl.pause();
    else ctrl.resume();
  }, [portrait, booted, pauseWhen]);

  const face = timerFace({
    skin: theme.timer.skin,
    durationMs: theme.timer.durationMs,
    elapsedMs: snap.elapsedMs,
    bonusPausedMs: snap.bonusPausedMs,
    penaltyMs: snap.penaltyMs,
    startClock: theme.timer.startClock,
    displayOverride: theme.timer.displayOverride,
  });
  const showTimer =
    theme.timer.skin !== 'none' &&
    (theme.timer.durationMs != null ||
      theme.timer.startClock != null ||
      theme.timer.displayOverride != null);
  const ending = endingId ? findEnding(theme.endings, endingId) : undefined;
  const shownId = clearedEnding ?? endingId;
  const shown = shownId ? findEnding(theme.endings, shownId) : undefined;
  const duration = theme.timer.durationMs;
  const remain = duration == null ? 0 : remainingMs(duration, snap);
  const used = duration == null ? snap.elapsedMs : Math.max(0, duration - remain);

  const say = useCallback((input: CaptionInput) => {
    setQueue((q) => [...q, asCaption(input)]);
  }, []);

  const activePuzzle = useMemo((): PuzzleId | null => {
    for (const p of theme.puzzles) {
      if (!solved[p.id]) return p.id;
    }
    return theme.puzzles[theme.puzzles.length - 1]?.id ?? null;
  }, [theme.puzzles, solved]);

  const hintChannel = channelForPuzzle(
    theme.hud.hintChannel,
    theme.hintChannels,
    activePuzzle,
    theme.puzzles.map((p) => p.id),
  );

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
      const lines = theme.smallTalk?.[hintChannel];
      const at = talkRef.current[hintChannel] ?? 0;
      const chat = smallTalkLine(lines, at);
      if (chat) {
        talkRef.current[hintChannel] = nextSmallTalkIndex(lines?.length ?? 0, at);
        setHintBody(chat);
        setHintStepLabel('잡담');
        setHintIntro(undefined);
        setHintOpen(true);
        return;
      }
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
  }, [activePuzzle, hintChannel, hintsUsed, theme.hints, theme.smallTalk, useStore]);

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

      {booted &&
        (typeof overlay === 'function' ? overlay({ say, selectedItem, askHint: onHint }) : overlay)}

      {booted && (
        <Narration line={line} onAdvance={() => setQueue((q) => q.slice(1))} />
      )}

      {booted && (
        <Hud
          collapsed={hudCollapsed(scene, theme.hud.collapsibleIn)}
          inventoryName={theme.hud.inventoryName}
          itemCount={items.length}
          itemLabels={items}
          timerLabel={showTimer ? <TimerFace model={face} /> : null}
          muted={muted}
          maxModeBlink={maxBlink}
          notebook={theme.hud.notebook}
          onBack={() =>
            router.push(
              theme.world === 'haemu'
                ? '/haemu'
                : theme.world === 'neulbom'
                  ? '/neulbom'
                  : theme.world === 'standalone'
                    ? '/standalone'
                    : '/',
            )
          }
          onHint={onHint}
          selectedItem={selectedItem}
          onSelectItem={
            onUseItem ? (id) => setSelectedItem((cur) => (cur === id ? null : id)) : undefined
          }
          onUseItem={onUseItem}
          onNotebook={onNotebook}
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
          channelLabel={CHANNEL_LABEL[hintChannel]}
          intro={hintIntro}
          stepLabel={hintStepLabel}
          body={hintBody}
          onClose={() => setHintOpen(false)}
        />
      )}

      {booted && shown && renderResult && (
        <div className="engine-overlay ending-lock" role="status" data-ending={shown.id}>
          {renderResult({
            id: shown.id,
            title: shown.title,
            elapsedMs: used,
            remainingMs: remain,
          })}
        </div>
      )}

      {booted && ending && !renderResult && (
        <div className="engine-overlay ending-lock" role="status" data-ending={ending.id}>
          <div className="gate-choices">
            <p>
              시간 종료 · {ending.title} ({ending.id})
            </p>
            {onReplay && (
              <button type="button" className="gate-btn" onClick={() => window.location.reload()}>
                처음부터
              </button>
            )}
          </div>
        </div>
      )}

      <RotateOverlay show={booted && portrait && !shown} />
      {!booted && (
        <Gate
          label={theme.gate.label}
          needs={theme.gate.needs}
          note={gateNote}
          onStart={onStart}
        />
      )}
    </div>
  );
}
