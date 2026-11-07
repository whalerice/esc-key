'use client';

import { create } from 'zustand';

/** Zoom is not persisted. Design §6-3 does not save it. */
type Ui112 = {
  zoom: number;
  setZoom: (zoom: number) => void;
};

export const use112Ui = create<Ui112>((set) => ({
  zoom: 1,
  setZoom: (zoom) => set({ zoom }),
}));
