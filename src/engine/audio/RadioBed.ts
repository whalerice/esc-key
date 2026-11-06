import type { RadioBedDef } from '@/engine/types';

/** BGM cue bed stub. Clue audio stays HTML5. Spec: docs/개발/공통엔진_v1.md §19-6. */
export class RadioBed {
  constructor(public def: RadioBedDef = { cues: [] }) {}
}
