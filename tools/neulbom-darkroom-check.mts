/**
 * Answer table for 붉은 방. No DOM.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { MaskAccumulator } from '../src/engine/fx/MaskAccumulator.ts';
import { FaceDownDetector, screenUpness } from '../src/engine/sensors/FaceDownDetector.ts';
import { hintUsesByChannel } from '../src/engine/systems/Hints.ts';
import { resolveOnZero } from '../src/engine/systems/Timer.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { nearestSnap } from '../src/engine/widgets/DragSnap.ts';
import { allFound, markFound } from '../src/engine/widgets/FindTap.ts';
import { fingerForTarget, placeLoupe } from '../src/engine/widgets/Loupe.ts';
import { PathFollow, reelTolerance, spiralPath } from '../src/engine/widgets/PathFollow.ts';
import { BED_SRC, CLUE_SRC, ROOM_SRC, SFX_SRC } from '../src/themes/neulbom-darkroom/art.ts';
import { initialExtra } from '../src/themes/neulbom-darkroom/extra.ts';
import { themeDarkroom } from '../src/themes/neulbom-darkroom/index.ts';
import {
  DEVELOP_MS,
  DODGE_NEED,
  ENVELOPE,
  EXPOSE_OK,
  FACES,
  FINGER_R,
  LOCK,
  LOUPE_GAP,
  LOUPE_RADIUS,
  P6_ORDER,
  REEL_BOX,
  SLEEVE_H,
  SLEEVE_W,
  SPIRAL_TURNS,
  SPIRAL_TURNS_ONE_HAND,
  TEMP_C,
  WOMAN_CUTS,
  assertDarkroomAnswers,
  clipSlots,
  judgeChem,
  sleeveCells,
} from '../src/themes/neulbom-darkroom/puzzles/answers.ts';

assertDarkroomAnswers();

const order = themeDarkroom.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
assert.equal(themeDarkroom.gate.label, '암실에 들어가기');
assert.equal(themeDarkroom.gate.needs.includes('orientation'), true);
assert.equal(themeDarkroom.timer.skin, 'darkroom');
assert.equal(themeDarkroom.timer.durationMs, 30 * 60_000);
assert.equal(resolveOnZero(themeDarkroom.timer.onZero, {}), 'C');
assert.equal(themeDarkroom.endings.find((ending) => ending.id === 'A')?.title, '정착');
assert.equal(themeDarkroom.endings.find((ending) => ending.id === 'B')?.title, '감광');
assert.equal(themeDarkroom.endings.find((ending) => ending.id === 'C')?.title, '타이머 종료');

const uses = hintUsesByChannel({ P1: 1, P7: 2 }, order, 'rotary-phone', undefined);
assert.equal(uses['rotary-phone'], 3);

assert.deepEqual([...LOCK], [4, 1, 3]);

assert.equal(judgeChem('color', TEMP_C, true), 'ok');

const points = spiralPath(SPIRAL_TURNS, REEL_BOX);
const followed = new PathFollow({ path: points, tolerance: reelTolerance(REEL_BOX) });
for (const p of points) followed.move(p.x, p.y);
assert.equal(followed.progress, 1);
const short = spiralPath(SPIRAL_TURNS_ONE_HAND, REEL_BOX);
assert.ok(short.length < points.length);
let tangled = 0;
const rewind = new PathFollow({
  path: points,
  tolerance: reelTolerance(REEL_BOX),
  onStray: () => {
    tangled += 1;
  },
});
rewind.move(points[0]!.x, points[0]!.y);
for (let i = 1; i < 8; i++) rewind.move(points[i]!.x, points[i]!.y);
assert.ok(rewind.progress > 0);
rewind.move(-500, -500);
assert.equal(rewind.progress, 0);
assert.equal(tangled, 1);

const above = placeLoupe(100, 200, 560, 420, 72, 12);
assert.equal(above.flipped, false);
assert.ok(above.y < 200);
const top = placeLoupe(100, 10, 560, 420, 72, 12);
assert.equal(top.flipped, true);
assert.ok(top.y > 10);
for (const cell of sleeveCells()) {
  const finger = fingerForTarget(cell.x, cell.y, SLEEVE_W, SLEEVE_H, LOUPE_RADIUS, LOUPE_GAP);
  const glass = placeLoupe(finger.x, finger.y, SLEEVE_W, SLEEVE_H, LOUPE_RADIUS, LOUPE_GAP);
  assert.ok(
    Math.hypot(glass.x - cell.x, glass.y - cell.y) <= 1,
    cell.id,
  );
}

let marks = WOMAN_CUTS.map((id) => ({ id, found: false }));
for (const id of WOMAN_CUTS) marks = markFound(marks, id);
assert.equal(allFound(marks), true);

const clips = clipSlots();
assert.equal(nearestSnap(clips[0]!.x, clips[0]!.y, clips)?.id, '0');
assert.equal(nearestSnap(0, 0, clips), null);
assert.deepEqual([...P6_ORDER], ['maple', 'dol', 'window', 'family', 'id', 'snow']);

const mask = new MaskAccumulator();
mask.define(FACES.map((face) => ({ ...face })));
mask.dab(FACES[0]!.x, FACES[0]!.y, FINGER_R);
assert.ok(mask.ratio('left') >= DODGE_NEED);
assert.ok(mask.ratio('right') < DODGE_NEED);
mask.dab(FACES[1]!.x, FACES[1]!.y, FINGER_R);
assert.ok(mask.ratio('right') >= DODGE_NEED);
const plain = new MaskAccumulator();
plain.add(0.25);
assert.equal(plain.covered, 0.25);
mask.reset();
assert.equal(mask.ratio('left'), 0);

const face = new FaceDownDetector();
face.start();
assert.ok(screenUpness(180, 0) <= -0.8);
assert.ok(screenUpness(0, 0) >= 0.3);
face.push(180, 0, 0);
assert.equal(face.faceDown, false);
face.push(180, 0, 1000);
assert.equal(face.faceDown, true);
face.push(180, 0, 1000 + DEVELOP_MS);
face.push(0, 0, 1000 + DEVELOP_MS);
assert.equal(face.faceDown, true);
face.push(0, 0, 1000 + DEVELOP_MS + 500);
assert.equal(face.faceDown, false);
assert.ok(face.lastHeld >= DEVELOP_MS);
face.beginButton(0);
assert.equal(face.buttonHeld(DEVELOP_MS), DEVELOP_MS);
face.cancelButton();
assert.equal(face.faceDown, false);

const saved = withoutEphemeralExtra({
  ...initialExtra,
  radioFreq: 87.9,
  pressure: 1,
  beamDeg: 10,
});
assert.equal('radioFreq' in saved, false);
assert.equal('pressure' in saved, false);
assert.equal(saved.safelightOn, false);
assert.equal(saved.dodgeMask, null);
assert.deepEqual(Object.keys(initialExtra).sort(), [
  'clotheslineOrder',
  'dodgeMask',
  'faceDownFallback',
  'safelightOn',
]);
for (const key of ['radioFreq', 'txFreq', 'beamDeg', 'pressure', 'stitchProgress']) {
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}

const themeSrc = readFileSync(new URL('../src/themes/neulbom-darkroom/index.ts', import.meta.url), 'utf8');
for (const line of [
  '413. 약품장 자물쇠.',
  '불 끄고, 점을 따라 바깥부터 끝까지 감게.',
  '컬러 키트, 38도, 3분 15초.',
  'A5, B2, C6, D3, E1, F4.',
  '15초. 안전등 끄고, 넣고 나면 엎어 두고 기다리게.',
  '단풍놀이, 돌잔치, 쇼윈도, 가족사진, 증명사진, 첫눈.',
  "0741. 진열장 아래 '찾아가지 않은 사진' 서랍.",
  '두 얼굴을 끝까지 가리고, 다시 엎어 두게.',
  '천천히 하게. 시계는 내가 보고 있을 테니.',
]) {
  assert.ok(themeSrc.includes(line), line);
}

const flow = readFileSync(new URL('../src/themes/neulbom-darkroom/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('requestFullscreen'), false);
assert.equal(flow.includes('howler'), false);
assert.equal(flow.includes('playClue'), true);
const audio = readFileSync(new URL('../src/themes/neulbom-darkroom/audio.ts', import.meta.url), 'utf8');
assert.equal(audio.includes('playHtml5Clip'), true);
assert.equal(audio.includes('howler'), true);
for (const url of [...Object.values(ROOM_SRC), ...Object.values(BED_SRC), ...Object.values(CLUE_SRC), ...Object.values(SFX_SRC)]) {
  assert.ok(existsSync(new URL(`../public${url}`, import.meta.url)), url);
}
const props = readdirSync(new URL('../public/themes/neulbom-darkroom/props', import.meta.url));
for (const name of ['rules.svg', 'rules-safe.svg', 'slip-safe.svg', 'scarf.svg', 'mailbox.svg', 'photo-family.svg']) {
  assert.ok(props.includes(name), name);
}
const rulesSafe = readFileSync(new URL('../public/themes/neulbom-darkroom/props/rules-safe.svg', import.meta.url), 'utf8');
assert.equal(rulesSafe.includes('#2846A0'), true);
assert.equal(rulesSafe.includes('#E8D0C4'), true);
assert.equal(flow.includes('TANK_MS'), true);
assert.equal(flow.includes('DEVELOP_MS'), true);
assert.equal(flow.includes('DODGE_MS'), true);
assert.doesNotMatch(flow, /patchExtra\(\{[^}]*(crank|temp|spiral|exposure|heldMs|beta|gamma)/);
assert.equal(EXPOSE_OK, 15);
assert.equal(ENVELOPE, 741);

console.log('neulbom-darkroom-check ok');
