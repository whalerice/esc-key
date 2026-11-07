import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useLighthouseStore } from '../store';

const FILL: Record<string, number> = {
  f1: 0x16140f,
  panel: 0x14110e,
  f2: 0x10140f,
  f3: 0x141414,
  f4: 0x16140f,
  f5: 0x14120e,
  f6: 0x121418,
  rail: 0x1e2a33,
};

/**
 * Flat night fill behind the DOM scene art.
 * SVG rooms are <img> in the flow — WebGL drops SVG textures.
 */
export const mountLighthouseRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useLighthouseStore.getState().scene;
    const solved = useLighthouseStore.getState().solved.P3;
    bg.clear();
    const fill = scene === 'f6' && solved ? 0x1a1814 : (FILL[scene] ?? 0x16140f);
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(fill);
  };
  paint();
  const unsub = useLighthouseStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
