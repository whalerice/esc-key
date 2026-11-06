/**
 * Logic check for 19-13 steps 1–3. No DOM.
 */
import assert from 'node:assert/strict';
import {
  cueOffsetMs,
  resolveOnZero,
  timerFace,
} from '../src/engine/systems/Timer.ts';
import {
  TwoFingerRotate,
  claimTwoFinger,
  releaseTwoFinger,
} from '../src/engine/input/gestures.ts';
import { MultiPointerRoles, roleAt } from '../src/engine/input/multiPointerRoles.ts';
import { TuningKnob, stationSignal } from '../src/engine/widgets/TuningKnob.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';

const duration = 30 * 60_000;

const start = timerFace({
  skin: 'onair-clock',
  durationMs: duration,
  elapsedMs: 0,
  startClock: '02:00',
});
assert.equal(start.label, '02:00:00');
assert.equal(start.lamp, 'on');
assert.equal(start.warn, false);

const tenLeft = timerFace({
  skin: 'watch-clock',
  durationMs: duration,
  elapsedMs: 20 * 60_000,
  startClock: '02:00',
});
assert.equal(tenLeft.label, '02:20:00');
assert.equal(tenLeft.warn, true);
assert.equal(tenLeft.blink, false);

const oneLeft = timerFace({
  skin: 'onair-clock',
  durationMs: duration,
  elapsedMs: 29 * 60_000,
  startClock: '02:00',
});
assert.equal(oneLeft.label, '02:29:00');
assert.equal(oneLeft.blink, true);
assert.equal(oneLeft.lamp, 'blink');

const zero = timerFace({
  skin: 'onair-clock',
  durationMs: duration,
  elapsedMs: duration,
  startClock: '02:00',
});
assert.equal(zero.label, '02:30:00');
assert.equal(zero.lamp, 'off');

const frozen = timerFace({
  skin: 'onair-clock',
  durationMs: duration,
  elapsedMs: 0,
  startClock: '02:00',
  displayOverride: '02:27',
});
assert.equal(frozen.label, '02:27:00');

const penalized = timerFace({
  skin: 'onair-clock',
  durationMs: duration,
  elapsedMs: 0,
  penaltyMs: 60_000,
  startClock: '02:00',
});
assert.equal(penalized.label, '02:01:00');

const spool = timerFace({
  skin: 'thread-spool',
  durationMs: duration,
  elapsedMs: 15 * 60_000,
  startClock: '21:00',
});
assert.equal(spool.label, '21:15:00');
assert.equal(spool.step, 3);
assert.equal(spool.redCore, false);

const spoolLate = timerFace({
  skin: 'thread-spool',
  durationMs: duration,
  elapsedMs: 20 * 60_000,
  startClock: '21:00',
});
assert.equal(spoolLate.redCore, true);
assert.equal(spoolLate.step, 2);

const spoolFreeze = timerFace({
  skin: 'thread-spool',
  durationMs: duration,
  elapsedMs: 0,
  startClock: '21:00',
  displayOverride: '21:30',
});
assert.equal(spoolFreeze.label, '21:30:00');
assert.equal(spoolFreeze.step, 6);

assert.equal(resolveOnZero('B', {}), 'B');
assert.equal(
  resolveOnZero(
    [
      { if: { solved: 'P7' }, ending: 'B2' },
      { ending: 'B1' },
    ],
    {},
  ),
  'B1',
);
assert.equal(
  resolveOnZero(
    [
      { if: { solved: 'P7' }, ending: 'B2' },
      { ending: 'B1' },
    ],
    { P7: true },
  ),
  'B2',
);
assert.equal(resolveOnZero(undefined, {}), null);

assert.equal(cueOffsetMs('02:03', '02:00'), 180_000);
assert.equal(cueOffsetMs('02:00:08', '02:00'), 8_000);

assert.equal(roleAt(10, 250, 300, 300), 'pedal');
assert.equal(roleAt(200, 10, 300, 300), 'cloth');
assert.equal(roleAt(10, 10, 300, 300), null);
assert.equal(roleAt(100, 250, 300, 300), 'cloth');

const hands = new MultiPointerRoles();
assert.equal(hands.down(1, 10, 250, 300, 300), 'pedal');
assert.equal(hands.down(2, 200, 40, 300, 300), 'cloth');
assert.equal(hands.roleOf(1), 'pedal');
hands.up(2);
assert.deepEqual(hands.ids('cloth'), []);
assert.deepEqual(hands.ids('pedal'), [1]);

const deltas: number[] = [];
const rotate = new TwoFingerRotate((delta) => deltas.push(delta));
rotate.down(1, 0, 0);
rotate.down(2, 10, 0);
rotate.move(2, 10, 10);
assert.ok(Math.abs(deltas[0]! - 45) < 0.01);
const before = deltas.length;
rotate.move(2, 20, 20);
assert.equal(deltas.length, before);

const a = {};
const b = {};
const extra = { extra: true };
claimTwoFinger(a, 'rotate');
assert.throws(
  () => claimTwoFinger(b, 'pinch'),
  /pinch and two-finger rotate cannot be active on the same surface/,
);
claimTwoFinger(extra, 'rotate');
releaseTwoFinger(a);
releaseTwoFinger(extra);
claimTwoFinger(b, 'pinch');
releaseTwoFinger(b);

assert.equal(stationSignal(87.9, { freq: 87.9, width: 0.15, soundId: 'x' }), 1);
assert.equal(stationSignal(88.2, { freq: 87.9, width: 0.15, soundId: 'x' }), 0);
const mid = stationSignal(87.9 + 0.075, { freq: 87.9, width: 0.15, soundId: 'x' });
assert.ok(mid > 0 && mid < 1);

const locks: string[] = [];
const hits: string[] = [];
const knob = new TuningKnob({
  min: 87,
  max: 89,
  stations: [{ freq: 87.9, width: 0.15, soundId: 'old-broadcast' }],
  lockHoldMs: 1000,
  onLock: (s) => locks.push(s.soundId),
  onFirstHit: (s) => hits.push(s.soundId),
});
knob.set(87.9);
assert.equal(hits.length, 1);
const t = performance.now();
knob.checkLock(t + 400);
assert.equal(locks.length, 0);
knob.checkLock(t + 1500);
assert.deepEqual(locks, ['old-broadcast']);
knob.set(87);
knob.set(87.9);
assert.equal(hits.length, 1);

const saved = withoutEphemeralExtra({
  radioFreq: 87.9,
  txFreq: 87.9,
  heardFragments: ['a'],
});
assert.deepEqual(saved, { heardFragments: ['a'] });

console.log('foundations-check ok');
