import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useTailorStore } from '../store';

const FILL: Record<string, number> = {
  shop: 0x2a2620,
  door: 0x241e18,
  ledger: 0x2c2822,
  warehouse: 0x1a221c,
  shelf: 0x161c18,
  bench: 0x241f18,
  'sewing-straight': 0x1c1814,
  'sewing-curve': 0x1c1814,
};

/**
 * Flat night fill behind the DOM scene art.
 * SVG rooms are <img> in the flow — WebGL drops SVG textures.
 */
export const mountTailorRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);

  const paint = () => {
    const scene = useTailorStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x2a2620);
  };
  paint();
  const unsub = useTailorStore.subscribe(paint);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
