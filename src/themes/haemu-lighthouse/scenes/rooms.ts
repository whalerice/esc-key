import { Container, Graphics, Text } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useLighthouseStore } from '../store';

const FILL: Record<string, number> = {
  f1: 0x12100c,
  panel: 0x14110e,
  f2: 0x10140f,
  f3: 0x141414,
  f4: 0x16140f,
  f5: 0x14120e,
  f6: 0x121418,
  rail: 0x0e1418,
};

const TITLE: Record<string, string> = {
  f1: '당직실',
  panel: '계단 배전반',
  f2: '무적실',
  f3: '창고',
  f4: '위 당직실',
  f5: '기계실',
  f6: '등실',
  rail: '난간',
};

/** Placeholder rectangles. Hotspots live in the DOM flow. */
export const mountLighthouseRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  const label = new Text({
    text: '',
    style: { fill: 0xd8d4cc, fontSize: 48 },
  });
  label.position.set(80, 72);
  world.addChild(bg, label);

  const draw = () => {
    const scene = useLighthouseStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x12100c);
    bg.roundRect(100, 200, 1720, 700, 8).fill(0x1a1a1a);
    bg.rect(140, 250, 500, 300).fill(0x2a2824);
    bg.rect(700, 250, 500, 300).fill(0x242a28);
    bg.rect(1260, 250, 500, 300).fill(0x26262c);
    label.text = TITLE[scene] ?? scene;
  };
  draw();
  const unsub = useLighthouseStore.subscribe(draw);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
