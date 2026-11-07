'use client';

import { useRef } from 'react';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay, type ThemePlayStore, type ThemeTimerApi } from '@/engine/ui/ThemePlay';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { batteryPercent } from '@/engine/systems/Timer';
import { openingLines } from './data/script';
import { LasttrainFlow } from './Flow';
import { themeLasttrain } from './index';
import { DURATION_MS, lasttrainResultLines } from './puzzles/answers';
import { mountLasttrainRooms } from './scenes/rooms';
import { initialSave, useLasttrainStore } from './store';

type FrozenStats = {
  hintsUsed: Record<string, number | undefined>;
};

/** Gate → battery → gray counter. Drafts and the viewfinder stay off the save. */
export function LasttrainPlay() {
  const endingA = useLasttrainStore((s) => !!s.flags.endingA);
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  const timerRef = useRef<ThemeTimerApi | null>(null);
  const notebookRef = useRef<() => void>(() => undefined);
  const frozen = useRef<FrozenStats | null>(null);
  const playedRef = useRef(0);
  const order = themeLasttrain.puzzles.map((puzzle) => puzzle.id);

  return (
    <ThemePlay
      theme={themeLasttrain}
      useStore={useLasttrainStore as unknown as ThemePlayStore}
      mountScene={mountLasttrainRooms}
      openingLines={[...openingLines]}
      gateNote="단서는 화면. 한 손가락. 권한 없음."
      pauseWhen={endingA}
      clearedEnding={endingA ? 'A' : null}
      timerRef={timerRef}
      onNotebook={() => notebookRef.current()}
      onClock={(ms) => {
        playedRef.current = ms;
        clockRef.current(ms);
      }}
      onReplay={() => {
        if (!frozen.current) {
          frozen.current = { hintsUsed: { ...useLasttrainStore.getState().hintsUsed } };
        }
        useLasttrainStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useLasttrainStore.getState();
        const stats = frozen.current ?? { hintsUsed: live.hintsUsed };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeLasttrain.hud.hintChannel,
          themeLasttrain.hintChannels,
        );
        const battery = `${batteryPercent(result.remainingMs, DURATION_MS)}%`;
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={lasttrainResultLines({
              endingId: result.id,
              title: result.title,
              elapsedMs: result.id === 'B' ? playedRef.current : result.elapsedMs,
              remainingMs: result.remainingMs,
              battery,
              hints: uses.extension ?? 0,
            })}
            onReplay={
              result.id === 'A'
                ? undefined
                : () => {
                    useLasttrainStore.getState().reset(initialSave());
                    window.location.reload();
                  }
            }
          />
        );
      }}
      overlay={({ say }) => (
        <LasttrainFlow say={say} clockRef={clockRef} timerRef={timerRef} notebookRef={notebookRef} />
      )}
    />
  );
}
