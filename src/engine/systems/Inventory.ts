import type { ItemId } from '@/engine/types';

/** Inventory model stub — 5 vertical slots. Spec: §8-3. */
export const INVENTORY_SLOTS = 5;

export type InventoryItem = {
  id: ItemId;
  name: string;
  icon?: string;
};

export function slotCount(items: ItemId[]): number {
  return Math.max(INVENTORY_SLOTS, items.length);
}
