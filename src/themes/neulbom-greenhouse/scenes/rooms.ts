import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useGreenhouseStore } from '../store';

const FILL: Record<string, number> = {
  foyer: 0x163038,
  boiler: 0x1a2428,
  hall: 0x1c2824,
  glass: 0x142830,
  nursery: 0x1a2820,
};

/** Flat night fill behind the DOM scene art. WebGL drops SVG textures. */
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
