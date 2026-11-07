import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useRadioStore } from '../store';

const FILL: Record<string, number> = {
  control: 0x12191f,
  booth: 0x101418,
  desk: 0x16120e,
  archive: 0x12100e,
  roof: 0x1e2a33,
};

/**
 * Flat night fill behind the DOM scene art.
 * SVG rooms are <img> in the flow — WebGL drops SVG textures.
 */
export const mountRadioRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useRadioStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x12191f);
  };
  paint();
  const unsub = useRadioStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
