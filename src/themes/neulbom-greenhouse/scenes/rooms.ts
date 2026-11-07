import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useGreenhouseStore } from '../store';

const FILL: Record<string, number> = {
  foyer: 0x2a2e2c,
  boiler: 0x323232,
  hall: 0x2e3230,
  glass: 0x343836,
  nursery: 0x303430,
};

/** Flat gray fill. Puzzle boxes are DOM. */
export const mountGreenhouseRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useGreenhouseStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x2a2e2c);
  };
  paint();
  const unsub = useGreenhouseStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
