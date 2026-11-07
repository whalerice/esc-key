import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useLasttrainStore } from '../store';

const FILL: Record<string, number> = {
  counter: 0x12141a,
  warehouse: 0x1a1814,
};

/** Flat night fill behind the DOM scene art. WebGL drops SVG textures. */
export const mountLasttrainRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useLasttrainStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x1c1e22);
  };
  paint();
  const unsub = useLasttrainStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
