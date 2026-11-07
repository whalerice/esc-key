import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useAshStore } from '../store';

const FILL: Record<string, number> = {
  desk: 0x2a2e33,
  radio: 0x1c2830,
  archive: 0x242428,
  office: 0x2c2824,
  teletype: 0x1e2420,
};

/** Flat gray rooms. No stock art. Puzzles live in Flow. */
export const mountAshRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useAshStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x222222);
    bg.roundRect(120, 160, 1680, 760, 8).fill(0x3a4048);
    bg.rect(120, 160, 1680, 18).fill(0x6a727c);
  };
  paint();
  const unsub = useAshStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
