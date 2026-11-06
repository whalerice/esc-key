/**
 * Logic check for 19-13 step 5. No DOM.
 * Widgets emit values. They do not grade the seam.
 */
import assert from 'node:assert/strict';
import { activeTwoFingerMode, claimTwoFinger, releaseTwoFinger } from '../src/engine/input/gestures.ts';
import { hudCollapsed } from '../src/engine/ui/hudCollapse.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { SeamRip } from '../src/engine/widgets/SeamRip.ts';
import { SewingMachine } from '../src/engine/widgets/SewingMachine.ts';

const speeds: number[] = [];
const straight = new SewingMachine({
  onSpeed: (stage) => speeds.push(stage),
});
straight.setPedal(true, 0);
assert.equal(straight.speedAt(0), 1);
assert.equal(straight.speedAt(500), 2);
assert.equal(straight.speedAt(1000), 3);
assert.equal(straight.speed, 1);
straight.setPedal(false, 1100);
assert.equal(straight.speed, 0);
assert.equal(straight.speedAt(1100), 0);

straight.pointerDown(1, 10, 90, 300, 100, 2000);
straight.pointerMove(1, 40, 90, 2010);
assert.equal(straight.clothX, 0);
straight.pointerDown(2, 200, 10, 300, 100, 2020);
straight.pointerMove(2, 230, 16, 2030);
assert.equal(straight.clothX, 30);
assert.equal(activeTwoFingerMode(), null);
const pinch = {};
claimTwoFinger(pinch, 'pinch');
releaseTwoFinger(pinch);

const line = [
  { x: 0, y: 0 },
  { x: 0, y: 400 },
];
const stitches: number[] = [];
const misses: number[] = [];
const sew = new SewingMachine({
  path: line,
  feed: [0, 1000, 1000, 1000],
  stitchEvery: 50,
  tolerance: 10,
  onStitch: (offset) => stitches.push(offset),
  onBigMiss: (offset) => misses.push(offset),
});
sew.setPedal(true, 0);
sew.nudgeCloth(0, 0, 0);
sew.tick(0);
sew.tick(120);
assert.equal(sew.stitches.length, 2);
assert.ok(Math.abs(sew.stitches[0]!.offset) < 1);
assert.ok(sew.progress > 0 && sew.progress < 1);

sew.nudgeCloth(12, 0, 120);
sew.tick(180);
assert.equal(misses.length, 0);
assert.equal(sew.stitches.length, 3);
assert.ok(Math.abs(sew.stitches[2]!.offset) > 10);
assert.ok(Math.abs(sew.stitches[2]!.angle - sew.stitches[0]!.angle) > 1);

sew.nudgeCloth(28, 0, 180);
sew.tick(240);
assert.equal(misses.length, 1);
assert.ok(Math.abs(misses[0]!) >= 30);
assert.equal(sew.stitches.length, 2);
sew.tick(300);
assert.equal(misses.length, 1);

const bunches: string[] = [];
const bunch = new SewingMachine({
  path: line,
  feed: [0, 100, 100, 100],
  bunchMs: 1000,
  onBunch: () => bunches.push('bunch'),
});
bunch.setPedal(true, 0);
bunch.tick(0);
bunch.tick(1000);
assert.deepEqual(bunches, ['bunch']);
assert.equal(bunch.speed, 0);
assert.equal(bunch.stitches.length, 0);

const ratios: number[] = [];
const done = new SewingMachine({
  path: [
    { x: 0, y: 0 },
    { x: 0, y: 200 },
  ],
  feed: [0, 1000, 1000, 1000],
  stitchEvery: 50,
  tolerance: 10,
  onReachEnd: (ratio) => ratios.push(ratio),
});
done.setPedal(true, 0);
done.nudgeCloth(0, 0, 0);
done.tick(0);
done.tick(250);
assert.equal(done.progress, 1);
assert.equal(ratios.length, 1);
assert.ok(ratios[0]! >= 0 && ratios[0]! <= 1);
assert.equal('passed' in done, false);

const curve = new SewingMachine({ curve: true });
curve.nudgeCloth(0, 10, 0);
assert.ok(Math.abs(curve.clothAngle - 90) < 0.01);
curve.setCurve(false);
assert.equal(curve.clothAngle, 0);

const handSpeeds: number[] = [];
const hand = new SewingMachine({
  oneHand: true,
  feed: [0, 500, 500, 500],
  onSpeed: (stage) => handSpeeds.push(stage),
});
hand.nudgeCloth(1, 0, 0);
assert.equal(hand.speed, 1);
hand.tick(0);
hand.tick(40);
assert.ok(hand.progressPx > 0);
hand.endCloth(50);
assert.equal(hand.speed, 0);

const saved = withoutEphemeralExtra({
  stitchProgress: 0.4,
  needlePos: { x: 1, y: 2 },
  activeStitches: 4,
  threadTension: 0.8,
  pedalSpeed: 2,
  clothX: 12,
  clothAngle: 30,
  sewScore: { P3: 0.9, P8: 0.8 },
  ripped: 3,
});
assert.deepEqual(saved, { sewScore: { P3: 0.9, P8: 0.8 }, ripped: 3 });

const ripped: number[] = [];
let stray = 0;
let complete = 0;
const rip = new SeamRip({
  count: 7,
  onRipped: (index) => ripped.push(index),
  onStray: () => stray++,
  onComplete: () => complete++,
});
assert.equal(rip.left, 7);
const first = rip.stitches[0]!;
rip.move(first.x, first.y);
assert.deepEqual(ripped, [0]);
assert.equal(rip.left, 6);
rip.move(first.x, first.y + 200);
assert.equal(stray, 1);
assert.equal(rip.left, 6);
rip.move(first.x, first.y + 200);
assert.equal(stray, 1);
const second = rip.stitches[1]!;
rip.move(second.x, second.y);
rip.move(first.x, first.y + 200);
assert.equal(stray, 2);
for (let i = 1; i < 7; i++) {
  if (!rip.stitches[i]!.ripped) rip.rip(i);
}
const swept = new SeamRip({ count: 7 });
const head = swept.stitches[0]!;
const tail = swept.stitches[6]!;
swept.move(head.x, head.y);
swept.move(tail.x, tail.y);
assert.equal(swept.left, 0);

assert.equal(rip.left, 0);
assert.equal(complete, 1);
assert.equal(rip.rip(0), false);
assert.equal(complete, 1);

assert.equal(hudCollapsed('shop', ['sewing-straight', 'sewing-curve']), false);
assert.equal(hudCollapsed('sewing-straight', ['sewing-straight', 'sewing-curve']), true);
assert.equal(hudCollapsed('sewing-curve', undefined), false);

assert.ok(speeds.includes(1));
assert.ok(handSpeeds.includes(1));
assert.ok(handSpeeds.includes(0));

console.log('tailor-widgets-check ok');
