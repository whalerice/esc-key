/**
 * Logic check for 19-13 step 4. No DOM. Widgets emit values; they do not judge.
 */
import assert from 'node:assert/strict';
import { BeamMask } from '../src/engine/fx/BeamMask.ts';
import { MorseInput } from '../src/engine/widgets/MorseInput.ts';
import { RhythmPress } from '../src/engine/widgets/RhythmPress.ts';
import { floorCanGo, floorTravelMs } from '../src/engine/ui/floorNav.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';

const beam = new BeamMask({
  min: 40,
  max: 180,
  widthDeg: 20,
  holdMs: 2000,
  targets: [
    { id: 'buoy', deg: 70 },
    { id: 'ship', deg: 110 },
  ],
});
beam.set(110);
assert.equal(beam.deg, 110);
assert.equal(beam.covers(110), true);
assert.equal(beam.covers(70), false);
assert.deepEqual(beam.inside(), ['ship']);

const entered: string[] = [];
const held: string[] = [];
const aimed = new BeamMask({
  min: 40,
  max: 180,
  widthDeg: 20,
  holdMs: 2000,
  targets: [{ id: 'ship', deg: 110 }],
  onInBeam: (id) => entered.push(id),
  onHeld: (id, ms) => held.push(`${id}:${ms}`),
});
aimed.set(110);
aimed.sample(1000);
assert.deepEqual(entered, ['ship']);
aimed.sample(2999);
assert.deepEqual(held, []);
aimed.sample(3000);
assert.deepEqual(held, ['ship:2000']);
aimed.sample(4000);
assert.deepEqual(held, ['ship:2000']);
aimed.set(40);
aimed.sample(5000);
aimed.set(110);
aimed.sample(5000);
assert.deepEqual(entered, ['ship', 'ship']);

const moving = new BeamMask({
  widthDeg: 10,
  targets: [{ id: 'ship', deg: 90 }],
});
moving.set(90);
assert.deepEqual(moving.inside(), ['ship']);
moving.setTarget('ship', 140);
assert.deepEqual(moving.inside(), []);

const fog = new BeamMask({ particles: true });
assert.equal(fog.showParticles(), true);
fog.reduceEffects = true;
assert.equal(fog.showParticles(), false);

const nudged = new BeamMask({ min: 40, max: 180 });
nudged.set(100);
nudged.nudge(15);
assert.equal(nudged.deg, 115);
nudged.nudge(100);
assert.equal(nudged.deg, 180);
nudged.nudge(-200);
assert.equal(nudged.deg, 40);

const saved = withoutEphemeralExtra({
  beamDeg: 110,
  morseCode: '··−',
  hornStep: 2,
});
assert.deepEqual(saved, { hornStep: 2 });

const spans: string[] = [];
const rhythm = new RhythmPress({
  onChange: (next) => spans.push(next.map((s) => `${s.kind}:${s.ms}`).join(',')),
});
rhythm.down(0);
rhythm.up(2000);
rhythm.down(4000);
rhythm.up(6000);
assert.deepEqual(rhythm.spans, [
  { kind: 'press', ms: 2000 },
  { kind: 'rest', ms: 2000 },
  { kind: 'press', ms: 2000 },
]);
assert.equal(spans.at(-1), 'press:2000,rest:2000,press:2000');

const letters: string[] = [];
const morse = new MorseInput({
  onLetter: (code) => letters.push(code),
});
morse.down(0);
morse.up(100);
morse.down(200);
morse.up(200 + 500);
assert.equal(morse.code, '·−');
morse.tick(700 + 1199);
assert.deepEqual(letters, []);
morse.tick(700 + 1200);
assert.deepEqual(letters, ['·−']);
morse.tick(9000);
assert.deepEqual(letters, ['·−']);
morse.clear();
assert.equal(morse.code, '');

assert.equal(floorCanGo('2', ['1']), false);
assert.equal(floorCanGo('1', ['1', '2']), true);
assert.equal(floorTravelMs(false), 2000);
assert.equal(floorTravelMs(true), 400);

console.log('lighthouse-widgets-check ok');
