import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useDarkroomStore } from '../store';

const FILL: Record<string, number> = {
  darkroom: 0x1a0505,
  shop: 0x241c18,
};

/** Flat night fill behind the DOM scene art. WebGL drops SVG textures. */
export const mountDarkroomRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useDarkroomStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x1a0505);
  };
  paint();
  const unsub = useDarkroomStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
