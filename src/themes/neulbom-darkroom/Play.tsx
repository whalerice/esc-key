'use client';

import { useRef } from 'react';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay, type ThemePlayStore, type ThemeTimerApi } from '@/engine/ui/ThemePlay';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { openingLines } from './data/script';
import { DarkroomFlow } from './Flow';
import { themeDarkroom } from './index';
import { DURATION_MS, darkroomResultLines } from './puzzles/answers';
import { mountDarkroomRooms } from './scenes/rooms';
import { initialSave, useDarkroomStore } from './store';

type FrozenStats = {
  hintsUsed: Record<string, number | undefined>;
  solved: Record<string, boolean>;
};

/** Gate → darkroom timer → gray rooms. Crank, bath, spiral, and face-down time stay off the save. */
export function DarkroomPlay() {
  const endingA = useDarkroomStore((s) => !!s.flags.endingA);
  const endingB = useDarkroomStore((s) => !!s.flags.endingB);
  const cleared = endingA ? 'A' : endingB ? 'B' : null;
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  const timerRef = useRef<ThemeTimerApi | null>(null);
  const notebookRef = useRef<() => void>(() => undefined);
  const frozen = useRef<FrozenStats | null>(null);
  const playedRef = useRef(0);
  const order = themeDarkroom.puzzles.map((puzzle) => puzzle.id);

  return (
    <ThemePlay
      theme={themeDarkroom}
      useStore={useDarkroomStore as unknown as ThemePlayStore}
      mountScene={mountDarkroomRooms}
      openingLines={[...openingLines]}
      gateNote="단서는 화면. 기울기가 안 되면 엎어두기 버튼."
      pauseWhen={!!cleared}
      clearedEnding={cleared}
      timerRef={timerRef}
      onNotebook={() => notebookRef.current()}
      onClock={(ms) => {
        playedRef.current = ms;
        clockRef.current(ms);
      }}
      onReplay={() => {
        if (!frozen.current) {
          const s = useDarkroomStore.getState();
          frozen.current = { hintsUsed: { ...s.hintsUsed }, solved: { ...s.solved } };
        }
        useDarkroomStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useDarkroomStore.getState();
        const stats = frozen.current ?? { hintsUsed: live.hintsUsed, solved: live.solved };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeDarkroom.hud.hintChannel,
          themeDarkroom.hintChannels,
        );
        const elapsed = result.id === 'C' ? playedRef.current : result.elapsedMs;
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={darkroomResultLines({
              endingId: result.id,
              title: result.title,
              elapsedMs: elapsed,
              remainingMs: result.remainingMs,
              hints: uses['rotary-phone'] ?? 0,
              solved: stats.solved,
            })}
            onReplay={
              result.id === 'A'
                ? undefined
                : () => {
                    useDarkroomStore.getState().reset(initialSave());
                    window.location.reload();
                  }
            }
          />
        );
      }}
      overlay={({ say }) => (
        <DarkroomFlow say={say} clockRef={clockRef} timerRef={timerRef} notebookRef={notebookRef} />
      )}
    />
  );
}
