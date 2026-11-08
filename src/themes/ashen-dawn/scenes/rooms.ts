/**
 * Dark wash under the DOM room SVG. WebGL drops SVG textures.
 * Puzzles live in Flow.
 */
import { Container, Graphics } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';

export const mountAshRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  world.addChild(bg);
  bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(0x121418);
  return () => {
    world.destroy({ children: true });
  };
};
