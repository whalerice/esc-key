/**
 * Answer table for 한 땀. No DOM.
 * The 20% seam rule lives here, not in SewingMachine.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nearestSnap } from '../src/engine/widgets/DragSnap.ts';
import { SequenceTap } from '../src/engine/widgets/SequenceTap.ts';
import { SewingMachine } from '../src/engine/widgets/SewingMachine.ts';
import { resolveOnZero } from '../src/engine/systems/Timer.ts';
import { hintUsesByChannel } from '../src/engine/systems/Hints.ts';
import { EPHEMERAL_EXTRA_KEYS, withoutEphemeralExtra } from '../src/engine/types.ts';
import { initialExtra } from '../src/themes/haemu-tailor/extra.ts';
import { themeHaemuTailor } from '../src/themes/haemu-tailor/index.ts';
import {
  CURVE_AMP,
  HOLE_ORDER,
  SEW_PASS,
  STRAIGHT_PATH,
  THREAD_TIP,
  assertTailorAnswers,
  clothPark,
  curvePath,
  eyeTarget,
  judgeHoles,
  judgeSew,
} from '../src/themes/haemu-tailor/puzzles/answers.ts';

assertTailorAnswers();

const order = themeHaemuTailor.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
assert.equal(resolveOnZero(themeHaemuTailor.timer.onZero, {}), 'B1');
assert.equal(resolveOnZero(themeHaemuTailor.timer.onZero, { P5: true }), 'B2');
assert.equal(themeHaemuTailor.endings.find((ending) => ending.id === 'A')?.title, '찾아가신 옷');
assert.deepEqual(themeHaemuTailor.hud.collapsibleIn, ['sewing-straight', 'sewing-curve']);
assert.equal(themeHaemuTailor.timer.displayOverride, undefined);

const uses = hintUsesByChannel({ P1: 2, P4: 1 }, order, 'thimble', undefined);
assert.equal(uses.thimble, 3);

assert.equal(new SequenceTap([...HOLE_ORDER]).check([...HOLE_ORDER]), judgeHoles([...HOLE_ORDER]) === 'ok');
assert.equal(judgeSew(SEW_PASS), 'ok');
assert.equal('passed' in new SewingMachine(), false);

let eyeMoved = false;
for (let t = 0; t < 8000; t += 40) {
  const eye = eyeTarget(t);
  assert.ok(nearestSnap(THREAD_TIP.x, THREAD_TIP.y, [eye]), `eye ${t}`);
  if (Math.abs(eye.x - THREAD_TIP.x) > 1) eyeMoved = true;
}
assert.equal(eyeMoved, true);

const straightRatios: number[] = [];
const straight = new SewingMachine({
  path: STRAIGHT_PATH,
  oneHand: true,
  feed: [0, 4000, 4000, 4000],
  onReachEnd: (ratio) => straightRatios.push(ratio),
});
straight.nudgeCloth(0, 0, 0);
for (let now = 0; now < 2000 && straight.progress < 1; now += 40) straight.tick(now);
assert.equal(straight.progress, 1);
assert.equal(judgeSew(straightRatios[0] ?? 1), 'ok');

const path = curvePath();
assert.ok(CURVE_AMP > 28);
const parked: number[] = [];
const good = new SewingMachine({
  path,
  curve: true,
  oneHand: true,
  feed: [0, 4000, 4000, 4000],
  onReachEnd: (ratio) => parked.push(ratio),
});
good.nudgeCloth(0, 0, 0);
for (let now = 0; now < 5000 && good.progress < 1; now += 20) {
  good.clothAngle = 0;
  good.clothX = clothPark(path, good.progressPx);
  good.tick(now);
}
assert.equal(good.progress, 1, 'parked curve should finish');
assert.equal(judgeSew(parked[0] ?? 1), 'ok');

const wild = new SewingMachine({
  path,
  curve: true,
  oneHand: true,
  feed: [0, 4000, 4000, 4000],
});
wild.nudgeCloth(0, 0, 0);
for (let now = 0; now < 5000 && wild.progress < 1; now += 20) wild.tick(now);
assert.ok(wild.progress < 1 || judgeSew(wild.crookedRatio) === 'again');

const saved = withoutEphemeralExtra({
  ...initialExtra,
  stitchProgress: 0.4,
  needlePos: { x: 1, y: 2 },
  activeStitches: 3,
  threadTension: 1,
  pedalSpeed: 2,
  clothX: 4,
  clothAngle: 90,
});
for (const key of EPHEMERAL_EXTRA_KEYS) {
  assert.equal(key in saved, false, key);
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}
assert.equal(saved.ripped, 0);

const themeSrc = readFileSync(new URL('../src/themes/haemu-tailor/index.ts', import.meta.url), 'utf8');
for (const line of [
  '0731. …네 번호표랑 같지? 우연이야.',
  '남색 선반 위에서 셋째. 철망은 열쇠 있어야 돼.',
  '왼쪽 엄지 누르고 있고, 오른쪽 엄지로 선 따라가. 끝까지.',
  '도장이 동그랗게 되는 거. 그게 네 거야.',
  '실뜯개를 안감 주머니에 대고, 빨간 땀 일곱 개.',
  '초록 바다유리. 갈색은 작아.',
  '구멍1 위로, 구멍2 아래로, 네 번. 세 바퀴 감고 꾹 눌러 매듭.',
  '페달 살살, 오른손으로 천 돌리면서 선 따라 끝까지.',
  '마지막 방송엔 우리 광고 안 나갔대. 누가 뺐나 봐. 섭섭하게.',
]) {
  assert.ok(themeSrc.includes(line), line);
}

const flow = readFileSync(new URL('../src/themes/haemu-tailor/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('requestFullscreen'), false);
const patches = flow.match(/patchExtra\(\{[\s\S]*?\}\)/g) ?? [];
assert.ok(patches.length > 0);
for (const call of patches) {
  for (const key of ['stitchProgress', 'needlePos', 'activeStitches', 'threadTension', 'pedalSpeed', 'clothX', 'clothAngle']) {
    assert.equal(call.includes(key), false, call);
  }
}

const radio = readFileSync(new URL('../src/themes/haemu-radio/index.ts', import.meta.url), 'utf8');
const light = readFileSync(new URL('../src/themes/haemu-lighthouse/index.ts', import.meta.url), 'utf8');
assert.equal(radio.includes('collapsibleIn'), false);
assert.equal(light.includes('collapsibleIn'), false);
