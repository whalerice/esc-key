'use client';

import { useRef } from 'react';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay, type ThemeTimerApi } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { thermometerC } from '@/engine/systems/Timer';
import { openingLines } from './data/script';
import { GreenhouseFlow } from './Flow';
import { themeGreenhouse } from './index';
import { DURATION_MS, greenhouseResultLines } from './puzzles/answers';
import { mountGreenhouseRooms } from './scenes/rooms';
import { initialSave, useGreenhouseStore } from './store';

type FrozenStats = {
  hintsUsed: Record<string, number | undefined>;
  nameTag: string;
  drew: boolean;
  beforeReveal: boolean;
};

/** Gate → thermometer → gray rooms. Pressure, notches, and breath loudness stay off the save. */
export function GreenhousePlay() {
  const finale = useGreenhouseStore((s) => !!s.flags.finale);
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  const onUseRef = useRef<(itemId: string | null, targetId: string) => void>(() => undefined);
  const timerRef = useRef<ThemeTimerApi | null>(null);
  const notebookRef = useRef<() => void>(() => undefined);
  const frozen = useRef<FrozenStats | null>(null);
  const playedRef = useRef(0);
  const order = themeGreenhouse.puzzles.map((puzzle) => puzzle.id);

  return (
    <ThemePlay
      theme={themeGreenhouse}
      useStore={useGreenhouseStore as unknown as ThemePlayStore}
      mountScene={mountGreenhouseRooms}
      openingLines={[...openingLines]}
      gateNote="단서는 화면. 입김이 안 되면 유리를 길게 누른다."
      pauseWhen={finale}
      clearedEnding={finale ? 'A' : null}
      timerRef={timerRef}
      onNotebook={() => notebookRef.current()}
      onClock={(ms) => {
        playedRef.current = ms;
        clockRef.current(ms);
      }}
      onUseItem={(itemId, targetId) => onUseRef.current(itemId, targetId)}
      onReplay={() => {
        if (!frozen.current) {
          const s = useGreenhouseStore.getState();
          frozen.current = {
            hintsUsed: { ...s.hintsUsed },
            nameTag: s.extra.nameTag,
            drew: !!s.extra.finaleStrokes?.length,
            beforeReveal: !s.solved.P6,
          };
        }
        useGreenhouseStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useGreenhouseStore.getState();
        const stats = frozen.current ?? {
          hintsUsed: live.hintsUsed,
          nameTag: live.extra.nameTag,
          drew: !!live.extra.finaleStrokes?.length,
          beforeReveal: !live.solved.P6,
        };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeGreenhouse.hud.hintChannel,
          themeGreenhouse.hintChannels,
        );
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={greenhouseResultLines({
              endingId: result.id,
              title: result.title,
              elapsedMs: playedRef.current,
              remainingMs: result.remainingMs,
              tempLabel: `${thermometerC(result.remainingMs, DURATION_MS).toFixed(1)}°C`,
              hints: uses.radio ?? 0,
              nameTag: stats.nameTag,
              drew: stats.drew,
              beforeReveal: stats.beforeReveal,
            })}
            onReplay={result.id === 'A' ? undefined : () => window.location.reload()}
          />
        );
      }}
      overlay={({ say, selectedItem }) => (
        <GreenhouseFlow
          say={say}
          clockRef={clockRef}
          selectedItem={selectedItem}
          onUseRef={onUseRef}
          timerRef={timerRef}
          notebookRef={notebookRef}
        />
      )}
    />
  );
}
