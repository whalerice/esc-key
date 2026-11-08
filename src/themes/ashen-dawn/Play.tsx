'use client';

import { useRef } from 'react';
import { hintUsesByChannel } from '@/engine/systems/Hints';
import { ResultCard } from '@/engine/ui/ResultCard';
import { ThemePlay, type ThemePlayStore } from '@/engine/ui/ThemePlay';
import { openingLines } from './data/script';
import { AshDawnFlow } from './Flow';
import { themeAshDawn } from './index';
import { resultLines } from './puzzles/answers';
import { mountAshRooms } from './scenes/rooms';
import { initialSave, useAshStore } from './store';
import styles from './art.module.css';

type Frozen = {
  hintsUsed: Record<string, number | undefined>;
  epilogue: 'write' | 'blank' | null;
};

/** Gate → wall clock → rooms. Dials, frequency, and morse stay off the save. */
export function AshDawnPlay() {
  const endingA = useAshStore((s) => !!s.flags.endingA);
  const endingB = useAshStore((s) => !!s.flags.endingB);
  const cleared = endingA ? 'A' : endingB ? 'B' : null;
  const onUseRef = useRef<(itemId: string, targetId: string) => void>(() => undefined);
  const notebookRef = useRef<() => void>(() => undefined);
  const frozen = useRef<Frozen | null>(null);
  const order = themeAshDawn.puzzles.map((puzzle) => puzzle.id);

  return (
    <div className={styles.shell}>
    <ThemePlay
      theme={themeAshDawn}
      useStore={useAshStore as unknown as ThemePlayStore}
      mountScene={mountAshRooms}
      openingLines={[...openingLines]}
      gateNote="소리 단서가 있어요. 무음이어도 들리게 재생하지만, 볼륨을 올려 주세요."
      pauseWhen={!!cleared}
      clearedEnding={cleared}
      onNotebook={() => notebookRef.current()}
      onUseItem={(itemId, targetId) => onUseRef.current(itemId, targetId)}
      onReplay={() => {
        if (!frozen.current) {
          const s = useAshStore.getState();
          frozen.current = {
            hintsUsed: { ...s.hintsUsed },
            epilogue: s.extra.epilogueChoice,
          };
        }
        useAshStore.getState().reset(initialSave());
      }}
      renderResult={(result) => {
        const live = useAshStore.getState();
        const stats = frozen.current ?? {
          hintsUsed: live.hintsUsed,
          epilogue: live.extra.epilogueChoice,
        };
        const uses = hintUsesByChannel(
          stats.hintsUsed,
          order,
          themeAshDawn.hud.hintChannel,
          themeAshDawn.hintChannels,
        );
        return (
          <ResultCard
            open
            title={result.title}
            endingId={result.id}
            lines={resultLines({
              endingId: result.id,
              elapsedMs: result.elapsedMs,
              remainingMs: result.remainingMs,
              hints: uses['guard-phone'] ?? 0,
              epilogue: stats.epilogue,
            })}
            onReplay={
              result.id === 'A'
                ? undefined
                : () => {
                    useAshStore.getState().reset(initialSave());
                    window.location.reload();
                  }
            }
          />
        );
      }}
      overlay={({ say, selectedItem }) => (
        <AshDawnFlow
          say={say}
          selectedItem={selectedItem}
          onUseRef={onUseRef}
          notebookRef={notebookRef}
        />
      )}
    />
    </div>
  );
}
