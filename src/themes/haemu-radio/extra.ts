/** Saved progress. Frequencies stay out — scene values, not `extra`. Spec §9-7, §12-2. */

export type RadioExtra = {
  heardFragments: string[];
  cartQueue: (string | null)[];
  scriptBoard: (string | null)[];
  tapeCounter: number;
  radioCallStep: number;
  trapPostit: boolean;
  trapRedKey: boolean;
  deckStopped: boolean;
  txLocked: boolean;
  letterPlaced: boolean;
};

export const initialExtra: RadioExtra = {
  heardFragments: [],
  cartQueue: [null, null, null, null, null],
  scriptBoard: [null, null, null, null],
  tapeCounter: 873,
  radioCallStep: 0,
  trapPostit: false,
  trapRedKey: false,
  deckStopped: false,
  txLocked: false,
  letterPlaced: false,
};
