/** Saved progress. Valve pressure, mat notches, and breath loudness stay out. Spec §10-1, §12-2. */

export type GreenhouseExtra = {
  bloomStage: number;
  /** Normalized 0–1 strokes. Null until the player draws. */
  finaleStrokes: { x: number; y: number }[][] | null;
  breathFallback: boolean;
  /** Hangul keypad path. Design extra lists strokes only — typed text is kept so the card survives refresh. */
  nameTag: string;
};

export const initialExtra: GreenhouseExtra = {
  bloomStage: 0,
  finaleStrokes: null,
  breathFallback: false,
  nameTag: '',
};
