import { Container, Graphics, Text } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useRadioStore } from '../store';

const FILL: Record<string, number> = {
  control: 0x140c0c,
  booth: 0x101418,
  desk: 0x16120e,
  archive: 0x12100e,
  roof: 0x0e1418,
};

const TITLE: Record<string, string> = {
  control: '부조정실',
  booth: '부스',
  desk: '작가석',
  archive: '아카이브실',
  roof: '옥상',
};

/** Gray-box rooms. Hotspots live in the DOM flow. */
export const mountRadioRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  const label = new Text({
    text: '',
    style: { fill: 0xd9473a, fontSize: 48 },
  });
  label.position.set(80, 72);
  world.addChild(bg, label);

  const draw = () => {
    const scene = useRadioStore.getState().scene;
    const fill = FILL[scene] ?? 0x140c0c;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(fill);
    bg.roundRect(100, 200, 1720, 700, 8).fill(0x1a1a1a);
    bg.rect(140, 250, 500, 300).fill(0x2a2424);
    bg.rect(700, 250, 500, 300).fill(0x242a28);
    bg.rect(1260, 250, 500, 300).fill(0x26262c);
    label.text = TITLE[scene] ?? scene;
  };
  draw();
  const unsub = useRadioStore.subscribe(draw);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
