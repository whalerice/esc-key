'use client';

import { ThemePlay } from '@/engine/ui/ThemePlay';
import type { ThemePlayStore } from '@/engine/ui/ThemePlay';
import {
  theme112,
  use112Store,
  mountWorkshop,
  openingLines,
} from '@/themes/neulbom-112';

/** Client entry — wires persist store + workshop mount into ThemePlay. */
export function Neulbom112Play() {
  return (
    <ThemePlay
      theme={theme112}
      useStore={use112Store as unknown as ThemePlayStore}
      mountScene={mountWorkshop}
      openingLines={[...openingLines]}
    />
  );
}
