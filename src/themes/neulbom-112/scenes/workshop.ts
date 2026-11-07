/**
 * Rainy workshop fill behind the DOM scene art. WebGL drops SVG textures.
 * Zoom follows the unsaved UI scale (×1…×12). Puzzles live in Flow.
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

  const wash = new Graphics();
  world.addChild(wash);

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
    drawWash(wash, !!s.flags.doll);
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

function drawWash(body: Graphics, lights: boolean): void {
  body.clear();
  body.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT).fill(0x1a1510);
  body.roundRect(80, 70, 640, 420, 8).fill(0x243044);
  const drops = lights ? 8 : 22;
  for (let i = 0; i < drops; i += 1) {
    const x = 100 + ((i * 137) % 560);
    const y = 90 + ((i * 89) % 340);
    body.rect(x, y, 2, 26).fill({ color: 0x9bb0c4, alpha: lights ? 0.25 : 0.5 });
  }
  body.rect(0, 860, LOGICAL_WIDTH, 220).fill(0x3a2e22);
  body.rect(0, 820, LOGICAL_WIDTH, 48).fill(0x6b5344);
  body.circle(1680, 760, lights ? 90 : 36).fill(lights ? 0xe6c36a : 0x8a6a32);
}
