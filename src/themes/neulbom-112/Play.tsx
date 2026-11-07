'use client';

import { useRef } from 'react';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay, type ThemePlayStore } from '@/engine/ui/ThemePlay';
import { openingLines } from './data/script';
import { Neulbom112Flow } from './Flow';
import { theme112 } from './index';
import { resultLines } from './puzzles/answers';
import { mountWorkshop } from './scenes/workshop';
import { initialSave, use112Store } from './store';

type Frozen = {
  hintsUsed: Record<string, number | undefined>;
  pieces: number;
};

/** Gate → dollhouse → ending. Zoom and dials stay off the save. */
export function Neulbom112Play() {
  const endingA = use112Store((s) => !!s.flags.endingA);
  const frozen = useRef<Frozen | null>(null);
  const order = theme112.puzzles.map((puzzle) => puzzle.id);

  return (
    <ThemePlay
      theme={theme112}
      useStore={use112Store as unknown as ThemePlayStore}
      mountScene={mountWorkshop}
      openingLines={[...openingLines]}
      gateNote="한 손가락. + 로 배율. 전체화면은 자동으로 열지 않는다."
      pauseWhen={endingA}
      clearedEnding={endingA ? 'A' : null}
      onReplay={() => {
        if (!frozen.current) {
          const s = use112Store.getState();
          frozen.current = { hintsUsed: { ...s.hintsUsed }, pieces: s.extra.pieces.length };
        }
        use112Store.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = use112Store.getState();
        const stats = frozen.current ?? {
          hintsUsed: live.hintsUsed,
          pieces: live.extra.pieces.length,
        };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          theme112.hud.hintChannel,
          theme112.hintChannels,
        );
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={resultLines({
              elapsedMs: result.elapsedMs,
              hints: uses['author-notebook'] ?? 0,
              pieces: stats.pieces,
            })}
          />
        );
      }}
      overlay={({ say }) => <Neulbom112Flow say={say} />}
    />
  );
}
