'use client';

import { useRef } from 'react';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { openingLines } from './data/script';
import { RadioFlow } from './Flow';
import { themeHaemuRadio } from './index';
import { radioResultLines } from './puzzles/answers';
import { mountRadioRooms } from './scenes/rooms';
import { initialSave, useRadioStore } from './store';

type FrozenStats = {
  hintsUsed: Record<string, number | undefined>;
  heard: number;
  trapPostit: boolean;
  trapRedKey: boolean;
};

/** Gate → on-air clock → gray-box rooms. Frequencies never enter the store. */
export function HaemuRadioPlay() {
  const pause = useRadioStore((s) => !!s.solved.P8);
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  const onUseRef = useRef<(itemId: string | null, targetId: string) => void>(() => undefined);
  const frozen = useRef<FrozenStats | null>(null);
  const order = themeHaemuRadio.puzzles.map((p) => p.id);

  return (
    <ThemePlay
      theme={themeHaemuRadio}
      useStore={useRadioStore as unknown as ThemePlayStore}
      mountScene={mountRadioRooms}
      openingLines={[...openingLines]}
      gateNote="이어폰을 권장합니다"
      pauseWhen={pause}
      clearedEnding={pause ? 'A' : null}
      onClock={(ms) => clockRef.current(ms)}
      onUseItem={(itemId, targetId) => onUseRef.current(itemId, targetId)}
      onReplay={() => {
        if (!frozen.current) {
          const s = useRadioStore.getState();
          frozen.current = {
            hintsUsed: { ...s.hintsUsed },
            heard: s.extra.heardFragments.length,
            trapPostit: s.extra.trapPostit,
            trapRedKey: s.extra.trapRedKey,
          };
        }
        useRadioStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useRadioStore.getState();
        const stats = frozen.current ?? {
          hintsUsed: live.hintsUsed,
          heard: live.extra.heardFragments.length,
          trapPostit: live.extra.trapPostit,
          trapRedKey: live.extra.trapRedKey,
        };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeHaemuRadio.hud.hintChannel,
          themeHaemuRadio.hintChannels,
        );
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={radioResultLines({
              endingId: result.id,
              title: result.title,
              elapsedMs: result.elapsedMs,
              remainingMs: result.remainingMs,
              messenger: uses.messenger ?? 0,
              walkie: uses.walkie ?? 0,
              heard: stats.heard,
              trapPostit: stats.trapPostit,
              trapRedKey: stats.trapRedKey,
            })}
            onReplay={result.id === 'B' ? () => window.location.reload() : undefined}
          />
        );
      }}
      overlay={({ say, selectedItem }) => (
        <RadioFlow
          say={say}
          clockRef={clockRef}
          selectedItem={selectedItem}
          onUseRef={onUseRef}
        />
      )}
    />
  );
}
