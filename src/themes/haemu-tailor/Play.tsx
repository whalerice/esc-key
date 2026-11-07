'use client';

import { useRef, useState } from 'react';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { openingLines } from './data/script';
import { TailorFlow } from './Flow';
import { themeHaemuTailor } from './index';
import { tailorResultLines } from './puzzles/answers';
import { mountTailorRooms } from './scenes/rooms';
import { initialSave, useTailorStore } from './store';

type FrozenStats = {
  hintsUsed: Record<string, number | undefined>;
  trapReverseTape: boolean;
  trapShelfFromBottom: boolean;
  trapBrownGlass: boolean;
  sewScore: { P3: number; P8: number };
};

/** Gate → spool clock → illustrated shop. Needle and cloth stay off the save. */
export function HaemuTailorPlay() {
  const pauseSolved = useTailorStore((s) => !!s.solved.P8);
  const [hold, setHold] = useState(false);
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  const onUseRef = useRef<(itemId: string | null, targetId: string) => void>(() => undefined);
  const frozen = useRef<FrozenStats | null>(null);
  const order = themeHaemuTailor.puzzles.map((puzzle) => puzzle.id);

  return (
    <ThemePlay
      theme={themeHaemuTailor}
      useStore={useTailorStore as unknown as ThemePlayStore}
      mountScene={mountTailorRooms}
      openingLines={[...openingLines]}
      gateNote="소리는 분위기만. 단서는 화면과 자막. 한 손가락으로 진행한다."
      pauseWhen={pauseSolved || hold}
      clearedEnding={pauseSolved ? 'A' : null}
      onClock={(ms) => clockRef.current(ms)}
      onUseItem={(itemId, targetId) => onUseRef.current(itemId, targetId)}
      onReplay={() => {
        if (!frozen.current) {
          const s = useTailorStore.getState();
          frozen.current = {
            hintsUsed: { ...s.hintsUsed },
            trapReverseTape: s.extra.trapReverseTape,
            trapShelfFromBottom: s.extra.trapShelfFromBottom,
            trapBrownGlass: s.extra.trapBrownGlass,
            sewScore: { ...s.extra.sewScore },
          };
        }
        useTailorStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useTailorStore.getState();
        const stats = frozen.current ?? {
          hintsUsed: live.hintsUsed,
          trapReverseTape: live.extra.trapReverseTape,
          trapShelfFromBottom: live.extra.trapShelfFromBottom,
          trapBrownGlass: live.extra.trapBrownGlass,
          sewScore: live.extra.sewScore,
        };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeHaemuTailor.hud.hintChannel,
          themeHaemuTailor.hintChannels,
        );
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={tailorResultLines({
              endingId: result.id,
              title: result.title,
              elapsedMs: result.elapsedMs,
              remainingMs: result.remainingMs,
              thimble: uses.thimble ?? 0,
              trapReverseTape: stats.trapReverseTape,
              trapShelfFromBottom: stats.trapShelfFromBottom,
              trapBrownGlass: stats.trapBrownGlass,
              sewScore: stats.sewScore,
            })}
            onReplay={result.id === 'A' ? undefined : () => window.location.reload()}
          />
        );
      }}
      overlay={({ say, selectedItem, askHint }) => (
        <TailorFlow
          say={say}
          askHint={askHint}
          clockRef={clockRef}
          selectedItem={selectedItem}
          onUseRef={onUseRef}
          onHold={setHold}
        />
      )}
    />
  );
}
