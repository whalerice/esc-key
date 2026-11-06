'use client';

import { useRef } from 'react';
import { ThemePlay } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import { openingLines } from './data/script';
import { RadioFlow } from './Flow';
import { themeHaemuRadio } from './index';
import { mountRadioRooms } from './scenes/rooms';
import { initialSave, useRadioStore } from './store';

/** Gate → on-air clock → gray-box rooms. Frequencies never enter the store. */
export function HaemuRadioPlay() {
  const pause = useRadioStore((s) => !!s.solved.P8);
  const clockRef = useRef<(ms: number) => void>(() => undefined);
  return (
    <ThemePlay
      theme={themeHaemuRadio}
      useStore={useRadioStore as unknown as ThemePlayStore}
      mountScene={mountRadioRooms}
      openingLines={[...openingLines]}
      gateNote="이어폰을 권장합니다"
      pauseWhen={pause}
      onClock={(ms) => clockRef.current(ms)}
      onReplay={() => useRadioStore.getState().reset(initialSave())}
      overlay={({ say }) => <RadioFlow say={say} clockRef={clockRef} />}
    />
  );
}
