/** Saved progress. Needle, cloth, and pedal stay off this object. Spec §8-1, §12-2. */

export type TailorExtra = {
  shelfFound: boolean;
  stubTried: string[];
  ripped: number;
  gauge: Record<string, number>;
  buttonStep: number;
  sewScore: { P3: number; P8: number };
  trapReverseTape: boolean;
  trapShelfFromBottom: boolean;
  trapBrownGlass: boolean;
};

export const initialExtra: TailorExtra = {
  shelfFound: false,
  stubTried: [],
  ripped: 0,
  gauge: {},
  buttonStep: 0,
  sewScore: { P3: 0, P8: 0 },
  trapReverseTape: false,
  trapShelfFromBottom: false,
  trapBrownGlass: false,
};
