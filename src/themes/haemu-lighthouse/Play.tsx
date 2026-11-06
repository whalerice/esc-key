'use client';

import { useRef } from 'react';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { openingLines } from './data/script';
import { LighthouseFlow } from './Flow';
import { themeHaemuLighthouse } from './index';
import { lighthouseResultLines } from './puzzles/answers';
import { mountLighthouseRooms } from './scenes/rooms';
import { initialSave, useLighthouseStore } from './store';

type FrozenStats = {
  hintsUsed: Record<string, number | undefined>;
  trapOldChart: boolean;
  trapBoat8: boolean;
  trapRedSignal: boolean;
  solvedAt: { P3: number; P6: number; P7: number };
};

/** Gate → watch clock → gray-box tower. Beam angle and morse stay off the save. */
export function HaemuLighthousePlay() {
  const pause = useLighthouseStore((s) => !!s.solved.P8);
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  const onUseRef = useRef<(itemId: string | null, targetId: string) => void>(() => undefined);
  const frozen = useRef<FrozenStats | null>(null);
  const order = themeHaemuLighthouse.puzzles.map((puzzle) => puzzle.id);

  return (
    <ThemePlay
      theme={themeHaemuLighthouse}
      useStore={useLighthouseStore as unknown as ThemePlayStore}
      mountScene={mountLighthouseRooms}
      openingLines={[...openingLines]}
      gateNote="소리는 분위기만. 단서는 화면과 자막."
      pauseWhen={pause}
      clearedEnding={pause ? 'A' : null}
      onClock={(ms) => clockRef.current(ms)}
      onUseItem={(itemId, targetId) => onUseRef.current(itemId, targetId)}
      onReplay={() => {
        if (!frozen.current) {
          const s = useLighthouseStore.getState();
          frozen.current = {
            hintsUsed: { ...s.hintsUsed },
            trapOldChart: s.extra.trapOldChart,
            trapBoat8: s.extra.trapBoat8,
            trapRedSignal: s.extra.trapRedSignal,
            solvedAt: { ...s.extra.solvedAt },
          };
        }
        useLighthouseStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useLighthouseStore.getState();
        const stats = frozen.current ?? {
          hintsUsed: live.hintsUsed,
          trapOldChart: live.extra.trapOldChart,
          trapBoat8: live.extra.trapBoat8,
          trapRedSignal: live.extra.trapRedSignal,
          solvedAt: live.extra.solvedAt,
        };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeHaemuLighthouse.hud.hintChannel,
          themeHaemuLighthouse.hintChannels,
        );
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={lighthouseResultLines({
              endingId: result.id,
              title: result.title,
              elapsedMs: result.elapsedMs,
              remainingMs: result.remainingMs,
              tube: uses['speaking-tube'] ?? 0,
              trapOldChart: stats.trapOldChart,
              trapBoat8: stats.trapBoat8,
              trapRedSignal: stats.trapRedSignal,
              solvedAt: stats.solvedAt,
            })}
            onReplay={result.id === 'A' ? undefined : () => window.location.reload()}
          />
        );
      }}
      overlay={({ say, selectedItem }) => (
        <LighthouseFlow
          say={say}
          clockRef={clockRef}
          selectedItem={selectedItem}
          onUseRef={onUseRef}
        />
      )}
    />
  );
}
