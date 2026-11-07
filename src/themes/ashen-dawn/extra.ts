/** Saved progress. Live dials, frequency, morse buffer, and pin rows stay out. */

export type AshExtra = {
  /** Safe combination stage 0–3. The wheel position is not saved. */
  lockStage: number;
  /** Winning send only. A wrong reply leaves this null. */
  sent: 'A' | 'B' | null;
  epilogueChoice: 'write' | 'blank' | null;
};

export const initialExtra: AshExtra = {
  lockStage: 0,
  sent: null,
  epilogueChoice: null,
};
