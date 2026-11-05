/**
 * Workshop + dollhouse cross-section (placeholder art).
 * Zoom ×1…×4 slice path (×2 mailbox clue); full ×12 deferred.
 */
import {
  Container,
  FederatedPointerEvent,
  Graphics,
  Text,
} from 'pixi.js';
import gsap from 'gsap';
import { ZoomCamera } from '@/engine/camera/ZoomCamera';
import { NumberDial } from '@/engine/widgets/NumberDial';
import { LetterDial } from '@/engine/widgets/LetterDial';
import type { SceneMount } from '@/engine/ui/SceneMount';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '@/engine/types';
import { isP1Correct, isP8Correct, P8_SLOTS } from '../puzzles/answers';
import { line } from '../data/script';
import type { Extra112 } from '../store';

export const mountWorkshop: SceneMount = (ctx) => {
  const { app, getState, say, onSolved } = ctx;
  const stage = app.stage;
  stage.removeChildren();

  const world = new Container();
  const panel = new Container();
  stage.addChild(world, panel);

  const bg = new Graphics()
    .rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)
    .fill(0x1a1510);
  bg.roundRect(80, 820, 1760, 180, 4).fill(0x3a2e22);
  world.addChild(bg);

  const house = buildDollhouse();
  house.position.set(420, 120);
  world.addChild(house);

  const mailbox = hitBox(1180, 700, 120, 100, '우편함');
  world.addChild(mailbox);

  const atticHot = hitBox(860, 160, 200, 100, '다락');
  atticHot.visible = false;
  world.addChild(atticHot);

  const zoomLabel = new Text({
    text: '×1.0',
    style: { fill: 0xc4a574, fontSize: 28 },
  });
  zoomLabel.position.set(40, 40);
  stage.addChild(zoomLabel);

  let panelOpen: Container | null = null;

  const camera = new ZoomCamera({
    min: 1,
    max: 4,
    thresholds: [2],
  });

  const zoomBtns = buildZoomButtons(
    () => {
      camera.zoomIn(0.5);
      syncZoomLabel();
    },
    () => {
      camera.zoomOut(0.5);
      syncZoomLabel();
    },
  );
  stage.addChild(zoomBtns);

  const syncZoomLabel = () => {
    zoomLabel.text = `×${camera.scale.toFixed(1)}`;
  };

  const closePanel = () => {
    if (panelOpen) {
      panel.removeChild(panelOpen);
      panelOpen.destroy({ children: true });
      panelOpen = null;
    }
  };

  const solveP1 = () => {
    const s = getState();
    if (s.solved.P1) return;
    s.addItem('봉투');
    s.patchExtra({ roofOpen: true, atticReachable: true });
    onSolved('P1');
    house.setRoofOpen(true);
    atticHot.visible = true;
    mailbox.visible = false;
    say(line('acquire.envelope'));
    say(line('narration.p1.solved'));
  };

  const solveP8 = () => {
    if (getState().solved.P8) return;
    onSolved('P8');
    atticHot.visible = false;
    say(line('narration.p8.solved'));
  };

  const lockZoom = () => camera.detach();
  const unlockZoom = () => {
    camera.attach(world, stage);
    syncZoomLabel();
  };

  const openP1 = () => {
    closePanel();
    lockZoom();
    const dial = new NumberDial(4, (values) => {
      if (!isP1Correct(values)) return;
      closePanel();
      unlockZoom();
      solveP1();
    });
    const root = dial.mount(panel);
    root.addChild(
      makeConfirm(() => {
        if (isP1Correct(dial.values)) {
          closePanel();
          unlockZoom();
          solveP1();
        } else {
          say(line('system.wrong'));
          shakePixi(root);
        }
      }),
    );
    root.addChild(
      makeClose(() => {
        closePanel();
        unlockZoom();
      }),
    );
    panelOpen = root;
  };

  const openP8 = () => {
    closePanel();
    lockZoom();
    const dial = new LetterDial(
      P8_SLOTS,
      P8_SLOTS.map(() => 0),
      (value) => {
        if (!isP8Correct(value)) return;
        closePanel();
        unlockZoom();
        solveP8();
      },
    );
    const root = dial.mount(panel, { title: '다락 상자' });
    root.addChild(
      makeConfirm(() => {
        if (isP8Correct(dial.value())) {
          closePanel();
          unlockZoom();
          solveP8();
        } else {
          say(line('system.wrong'));
          shakePixi(root);
        }
      }),
    );
    root.addChild(
      makeClose(() => {
        closePanel();
        unlockZoom();
      }),
    );
    panelOpen = root;
  };

  mailbox.eventMode = 'static';
  mailbox.cursor = 'pointer';
  mailbox.on('pointertap', () => {
    if (getState().solved.P1) return;
    if (camera.scale < 2) {
      say(line('inspect.mailbox.far'));
      return;
    }
    say(line('inspect.mailbox.near'));
    openP1();
  });

  atticHot.eventMode = 'static';
  atticHot.cursor = 'pointer';
  atticHot.on('pointertap', () => {
    if (getState().solved.P8) return;
    if (!getState().solved.P1) return;
    say(line('inspect.attic'));
    openP8();
  });

  house.eventMode = 'static';
  house.on('pointertap', () => {
    if (!getState().solved.P1) say(line('inspect.house.locked'));
  });

  camera.attach(world, stage);

  const zoomTick = setInterval(syncZoomLabel, 200);

  const s0 = getState();
  const extra = s0.extra as Extra112;
  house.setRoofOpen(!!(extra.roofOpen || s0.solved.P1));
  atticHot.visible = !!(extra.atticReachable || s0.solved.P1) && !s0.solved.P8;
  mailbox.visible = !s0.solved.P1;

  return () => {
    clearInterval(zoomTick);
    closePanel();
    camera.detach();
    stage.removeChildren();
  };
};

type Dollhouse = Container & { setRoofOpen: (open: boolean) => void };

function buildDollhouse(): Dollhouse {
  const root = new Container() as Dollhouse;
  const body = new Graphics();
  drawHouse(body, false);
  root.addChild(body);

  const labels = [
    { t: '현관', x: 120, y: 560 },
    { t: '부엌', x: 410, y: 560 },
    { t: '거실', x: 700, y: 560 },
    { t: '내 방', x: 180, y: 360 },
    { t: '안방', x: 620, y: 360 },
    { t: '다락', x: 420, y: 40 },
  ];
  for (const L of labels) {
    const tx = new Text({
      text: L.t,
      style: { fill: 0xe8dcc8, fontSize: 28 },
    });
    tx.position.set(L.x, L.y);
    root.addChild(tx);
  }

  const roofLayer = new Container();
  roofLayer.addChild(
    new Graphics()
      .roundRect(400, 60, 100, 50, 4)
      .fill(0x222222)
      .stroke({ color: 0xc4a574, width: 2 }),
  );
  const lockText = new Text({
    text: '잠김',
    style: { fill: 0xc4a574, fontSize: 24 },
  });
  lockText.position.set(418, 72);
  roofLayer.addChild(lockText);
  root.addChild(roofLayer);

  const openBadge = new Text({
    text: '앞면 열림',
    style: { fill: 0xc4a574, fontSize: 24 },
  });
  openBadge.position.set(380, 90);
  openBadge.visible = false;
  root.addChild(openBadge);

  root.setRoofOpen = (open: boolean) => {
    roofLayer.visible = !open;
    openBadge.visible = open;
    body.clear();
    drawHouse(body, open);
  };

  return root;
}

function drawHouse(body: Graphics, open: boolean): void {
  body.roundRect(0, 80, 900, 620, 4).fill(0x5c4030).stroke({ color: 0x2a1c12, width: 4 });
  body.rect(20, 280, 860, 8).fill(0x2a1c12);
  body.rect(20, 480, 860, 8).fill(0x2a1c12);
  body.rect(30, 500, 270, 180).fill(0x6b5344);
  body.rect(320, 500, 270, 180).fill(0x715846);
  body.rect(610, 500, 270, 180).fill(0x6b5344);
  const c2 = open ? 0x6b5344 : 0x3a2e28;
  body.rect(30, 300, 420, 170).fill(c2);
  body.rect(470, 300, 410, 170).fill(c2);
  body.moveTo(100, 80).lineTo(450, 0).lineTo(800, 80).fill(0x4a3428);
}

function hitBox(x: number, y: number, w: number, h: number, label: string): Container {
  const c = new Container();
  c.position.set(x, y);
  const g = new Graphics()
    .roundRect(0, 0, w, h, 4)
    .fill({ color: 0xc4a574, alpha: 0.2 })
    .stroke({ color: 0xc4a574, width: 1 });
  const t = new Text({
    text: label,
    style: { fill: 0xf2efe8, fontSize: 22 },
  });
  t.position.set(8, h / 2 - 12);
  c.addChild(g, t);
  c.hitArea = {
    contains: (lx: number, ly: number) =>
      lx >= 0 && ly >= 0 && lx <= w && ly <= h,
  };
  return c;
}

function buildZoomButtons(zoomIn: () => void, zoomOut: () => void): Container {
  const root = new Container();
  root.position.set(LOGICAL_WIDTH - 220, LOGICAL_HEIGHT - 120);
  const mk = (label: string, x: number, fn: () => void) => {
    const b = new Container();
    b.position.set(x, 0);
    b.eventMode = 'static';
    b.cursor = 'pointer';
    b.addChild(
      new Graphics()
        .roundRect(0, 0, 72, 72, 4)
        .fill(0x000000)
        .stroke({ color: 0xc4a574, width: 1 }),
    );
    const t = new Text({ text: label, style: { fill: 0xf2efe8, fontSize: 36 } });
    t.position.set(22, 14);
    b.addChild(t);
    b.on('pointertap', (e: FederatedPointerEvent) => {
      e.stopPropagation();
      fn();
    });
    return b;
  };
  root.addChild(mk('−', 0, zoomOut), mk('+', 90, zoomIn));
  return root;
}

function makeConfirm(onConfirm: () => void): Container {
  const b = new Container();
  b.position.set(320, 340);
  b.eventMode = 'static';
  b.cursor = 'pointer';
  b.addChild(new Graphics().roundRect(0, 0, 160, 56, 4).fill(0xc4a574));
  const t = new Text({
    text: '확인',
    style: { fill: 0x1a1510, fontSize: 28 },
  });
  t.position.set(52, 12);
  b.addChild(t);
  b.on('pointertap', (e: FederatedPointerEvent) => {
    e.stopPropagation();
    onConfirm();
  });
  return b;
}

function makeClose(onClose: () => void): Container {
  const b = new Container();
  b.position.set(700, 16);
  b.eventMode = 'static';
  b.cursor = 'pointer';
  b.addChild(
    new Text({ text: '닫기', style: { fill: 0xc4a574, fontSize: 24 } }),
  );
  b.on('pointertap', (e: FederatedPointerEvent) => {
    e.stopPropagation();
    onClose();
  });
  return b;
}

function shakePixi(target: Container): void {
  const base = target.x;
  gsap.fromTo(
    target,
    { x: base - 8 },
    { x: base + 8, duration: 0.05, yoyo: true, repeat: 5, onComplete: () => {
      target.x = base;
    } },
  );
}
