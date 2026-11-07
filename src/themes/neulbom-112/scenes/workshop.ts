/**
 * Dollhouse cross-section. Gray boxes. Puzzles live in Flow.
 * Zoom follows the unsaved UI scale (×1…×12).
 */
import { Container, Graphics, Text } from 'pixi.js';
import { ZoomCamera } from '@/engine/camera/ZoomCamera';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { ZOOM_STEPS } from '../puzzles/answers';
import { use112Store } from '../store';
import { use112Ui } from '../ui';

export const mountWorkshop: SceneMount = ({ app }) => {
  const stage = app.stage;
  stage.removeChildren();

  const world = new Container();
  stage.addChild(world);

  const bg = new Graphics().rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(0x1a1510);
  bg.roundRect(80, 820, 1760, 180, 4).fill(0x3a2e22);
  world.addChild(bg);

  const house = buildDollhouse();
  house.position.set(420, 120);
  world.addChild(house);

  const zoomLabel = new Text({
    text: '×1',
    style: { fill: 0xc4a574, fontSize: 28 },
  });
  zoomLabel.position.set(48, 760);
  stage.addChild(zoomLabel);

  const camera = new ZoomCamera({
    min: 1,
    max: 12,
    thresholds: [...ZOOM_STEPS],
  });
  camera.attach(world, stage);

  const paint = () => {
    const s = use112Store.getState();
    house.setState(!!s.solved.P1, !!s.solved.P5, !!s.solved.P7, !!s.flags.doll);
    const zoom = use112Ui.getState().zoom;
    if (camera.scale !== zoom) camera.setScale(zoom);
    zoomLabel.text = `×${zoom}`;
  };
  paint();
  const unsubSave = use112Store.subscribe(paint);
  const unsubZoom = use112Ui.subscribe(paint);

  return () => {
    unsubSave();
    unsubZoom();
    camera.detach();
    stage.removeChildren();
  };
};

type Dollhouse = Container & {
  setState: (open: boolean, floor2: boolean, attic: boolean, lights: boolean) => void;
};

function buildDollhouse(): Dollhouse {
  const root = new Container() as Dollhouse;
  const body = new Graphics();
  root.addChild(body);

  const labels = [
    { t: '현관', x: 120, y: 560 },
    { t: '부엌', x: 410, y: 560 },
    { t: '거실', x: 700, y: 560 },
    { t: '내 방', x: 180, y: 360 },
    { t: '안방', x: 620, y: 360 },
    { t: '다락', x: 420, y: 40 },
  ];
  for (const label of labels) {
    const text = new Text({ text: label.t, style: { fill: 0xe8dcc8, fontSize: 28 } });
    text.position.set(label.x, label.y);
    root.addChild(text);
  }

  const roofLayer = new Container();
  roofLayer.addChild(
    new Graphics().roundRect(400, 60, 100, 50, 4).fill(0x222222).stroke({ color: 0xc4a574, width: 2 }),
  );
  const lockText = new Text({ text: '잠김', style: { fill: 0xc4a574, fontSize: 24 } });
  lockText.position.set(418, 72);
  roofLayer.addChild(lockText);
  root.addChild(roofLayer);

  const openBadge = new Text({ text: '앞면 열림', style: { fill: 0xc4a574, fontSize: 24 } });
  openBadge.position.set(380, 90);
  openBadge.visible = false;
  root.addChild(openBadge);

  root.setState = (open, floor2, attic, lights) => {
    roofLayer.visible = !open;
    openBadge.visible = open;
    body.clear();
    drawHouse(body, open, floor2, attic, lights);
  };
  root.setState(false, false, false, false);
  return root;
}

function drawHouse(body: Graphics, open: boolean, floor2: boolean, attic: boolean, lights: boolean): void {
  body.roundRect(0, 80, 900, 620, 4).fill(0x5c4030).stroke({ color: 0x2a1c12, width: 4 });
  body.rect(20, 280, 860, 8).fill(0x2a1c12);
  body.rect(20, 480, 860, 8).fill(0x2a1c12);
  body.rect(30, 500, 270, 180).fill(open ? 0x6b5344 : 0x3a2e28);
  body.rect(320, 500, 270, 180).fill(open ? 0x715846 : 0x3a2e28);
  body.rect(610, 500, 270, 180).fill(open ? 0x6b5344 : 0x3a2e28);
  const upstairs = open && floor2 ? 0x6b5344 : 0x241810;
  body.rect(30, 300, 420, 170).fill(upstairs);
  body.rect(470, 300, 410, 170).fill(upstairs);
  body.moveTo(100, 80).lineTo(450, 0).lineTo(800, 80).fill(0x4a3428);
  if (attic) body.roundRect(400, 110, 120, 36, 4).fill(0xc4a574);
  if (lights) {
    for (const [x, y] of [
      [80, 540],
      [360, 540],
      [680, 540],
      [160, 340],
      [620, 340],
    ] as const) {
      body.rect(x, y, 36, 28).fill(0xe6c36a);
    }
  }
}
