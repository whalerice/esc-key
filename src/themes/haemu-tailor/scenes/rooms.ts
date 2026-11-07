import { Container, Graphics, Text } from 'pixi.js';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { useTailorStore } from '../store';

const FILL: Record<string, number> = {
  shop: 0x1a1814,
  door: 0x161410,
  ledger: 0x1c1a16,
  warehouse: 0x141614,
  shelf: 0x121614,
  bench: 0x1a1812,
  'sewing-straight': 0x221e16,
  'sewing-curve': 0x221e16,
};

const TITLE: Record<string, string> = {
  shop: '가게',
  door: '창고 문',
  ledger: '재봉틀 자리',
  warehouse: '창고',
  shelf: '철망 선반',
  bench: '작업대',
  'sewing-straight': '재봉틀 · 직선',
  'sewing-curve': '재봉틀 · 곡선',
};

/** Placeholder rectangles. Hotspots live in the DOM flow. */
export const mountTailorRooms: SceneMount = ({ app }) => {
  app.stage.removeChildren();
  const world = new Container();
  app.stage.addChild(world);
  const bg = new Graphics();
  const label = new Text({
    text: '',
    style: { fill: 0xede6c8, fontSize: 48 },
  });
  label.position.set(80, 72);
  world.addChild(bg, label);

  const draw = () => {
    const scene = useTailorStore.getState().scene;
    bg.clear();
    bg.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(FILL[scene] ?? 0x1a1814);
    bg.roundRect(100, 200, 1720, 700, 8).fill(0x242018);
    bg.rect(140, 250, 500, 300).fill(0x3a3428);
    bg.rect(700, 250, 500, 300).fill(0x2e342c);
    bg.rect(1260, 250, 500, 300).fill(0x34302a);
    label.text = TITLE[scene] ?? scene;
  };
  draw();
  const unsub = useTailorStore.subscribe(draw);
  return () => {
    unsub();
    world.destroy({ children: true });
  };
};
