/** Saved progress. Beam bearing, morse buffer, and horn pressure stay out. Spec §9-1, §12-2. */

export type LighthouseExtra = {
  breakerUp: string[];
  changerSlot: number;
  focus: { x: number; y: number };
  tabsOpened: string[];
  hornStep: number;
  logBlanks: (string | null)[];
  solvedAt: { P3: number; P6: number; P7: number };
  trapOldChart: boolean;
  trapBoat8: boolean;
  trapRedSignal: boolean;
};

export const initialExtra: LighthouseExtra = {
  breakerUp: [],
  changerSlot: 1,
  focus: { x: 0.6, y: -0.45 },
  tabsOpened: [],
  hornStep: 0,
  logBlanks: [null, null, null, null],
  solvedAt: { P3: 0, P6: 0, P7: 0 },
  trapOldChart: false,
  trapBoat8: false,
  trapRedSignal: false,
};
