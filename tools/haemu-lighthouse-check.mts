/**
 * Answer table for 등대지기. No DOM.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BeamMask } from '../src/engine/fx/BeamMask.ts';
import { nearestSnap } from '../src/engine/widgets/DragSnap.ts';
import { SequenceTap } from '../src/engine/widgets/SequenceTap.ts';
import { MorseInput } from '../src/engine/widgets/MorseInput.ts';
import { RhythmPress } from '../src/engine/widgets/RhythmPress.ts';
import { resolveOnZero } from '../src/engine/systems/Timer.ts';
import { hintUsesByChannel } from '../src/engine/systems/Hints.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { BED_SRC, CLUE_SRC, ROOM_SRC, SFX_SRC } from '../src/themes/haemu-lighthouse/art.ts';
import { initialExtra } from '../src/themes/haemu-lighthouse/extra.ts';
import { themeHaemuLighthouse } from '../src/themes/haemu-lighthouse/index.ts';
import {
  BEAM_HOLD_MS,
  BEAM_WIDTH,
  MORSE_U,
  P2_ORDER,
  P8_ANSWER,
  P8_SLOTS,
  RHYTHM_HI,
  RHYTHM_LO,
  assertLighthouseAnswers,
  judgeBlank,
  judgeLevers,
  judgeRhythm,
} from '../src/themes/haemu-lighthouse/puzzles/answers.ts';

assertLighthouseAnswers();

const order = themeHaemuLighthouse.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
assert.equal(resolveOnZero(themeHaemuLighthouse.timer.onZero, {}), 'B1');
assert.equal(resolveOnZero(themeHaemuLighthouse.timer.onZero, { P7: true }), 'B2');
assert.equal(themeHaemuLighthouse.endings.find((ending) => ending.id === 'A')?.title, '다음 사람에게');

const uses = hintUsesByChannel({ P1: 3, P4: 1 }, order, 'speaking-tube', undefined);
assert.equal(uses['speaking-tube'], 4);

assert.equal(new SequenceTap([...P2_ORDER]).check([...P2_ORDER]), judgeLevers([...P2_ORDER]) === 'ok');
assert.equal(judgeLevers(['red', 'yellow', 'green']), 'ok');

const morse = new MorseInput();
morse.down(0);
morse.up(100);
morse.down(200);
morse.up(300);
morse.down(400);
morse.up(900);
assert.equal(morse.code, MORSE_U);
morse.tick(900 + 1200);
assert.equal(morse.code, MORSE_U);

const rhythm = new RhythmPress();
rhythm.down(0);
rhythm.up(RHYTHM_LO);
rhythm.down(RHYTHM_LO + RHYTHM_HI);
rhythm.up(RHYTHM_LO + RHYTHM_HI + 2000);
assert.equal(judgeRhythm(rhythm.spans), 'ok');

const hit = nearestSnap(40, 40, P8_SLOTS);
assert.equal(hit?.id, '0');
assert.equal(judgeBlank(Number(hit?.id), P8_ANSWER[0]), 'ok');
assert.equal(nearestSnap(0, 0, P8_SLOTS), null);

const saved = withoutEphemeralExtra({ ...initialExtra, beamDeg: 110, morseCode: MORSE_U });
assert.equal('beamDeg' in saved, false);
assert.equal('morseCode' in saved, false);
assert.equal(saved.hornStep, 0);
for (const key of ['beamDeg', 'morseCode', 'pressure', 'radioFreq', 'txFreq']) {
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}

const themeSrc = readFileSync(new URL('../src/themes/haemu-lighthouse/index.ts', import.meta.url), 'utf8');
for (const line of [
  '1418이요. 141계단, 8초.',
  '빨강, 노랑, 초록. 등실, 기계실, 무적실.',
  '3번 전구. 그림자를 반대로 움직여서 십자 가운데.',
  '부표 3번 바로 옆, 불 두 개. 110도쯤. 빛을 대고 가만히.',
  '2016년 권 첫 파란 띠지. 7월 15일.',
  '길게, 쉬고, 길게. 2초씩. 그리고 쐐기 박아요.',
  'U. 짧게, 짧게, 길게. 135도쯤 배에.',
  '3번, 30초 2회, 제3해진호, 87.9.',
  '천천히 해요. 배는 아직 기다려요.',
]) {
  assert.ok(themeSrc.includes(line), line);
}

const flow = readFileSync(new URL('../src/themes/haemu-lighthouse/Flow.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(flow, /beamDeg|morseCode|radioFreq|txFreq/);
assert.doesNotMatch(flow, /patchExtra\(\{[^}]*pressure/);
assert.equal(flow.includes('requestFullscreen'), false);
assert.equal(flow.includes('toneWav'), false);
assert.equal(flow.includes('playHtml5Clip'), true);
for (const url of [...Object.values(ROOM_SRC), ...Object.values(BED_SRC), ...Object.values(CLUE_SRC), ...Object.values(SFX_SRC)]) {
  assert.ok(existsSync(new URL(`../public${url}`, import.meta.url)), url);
}

// Slow sweep keeps 해진 8호 inside the wedge for >2s. That is not a hold.
const swept: string[] = [];
const sweep = new BeamMask({
  min: 40,
  max: 180,
  widthDeg: BEAM_WIDTH,
  holdMs: BEAM_HOLD_MS,
  targets: [
    { id: 'boatA', deg: 80 },
    { id: 'boatB', deg: 110 },
  ],
  onHeld: (id) => swept.push(id),
});
for (let i = 0; i <= 24; i++) {
  sweep.set(72 + i * 0.5);
  sweep.sample(i * 100);
}
assert.deepEqual(swept, []);

const parked: string[] = [];
const trap = new BeamMask({
  min: 40,
  max: 180,
  widthDeg: BEAM_WIDTH,
  holdMs: BEAM_HOLD_MS,
  targets: [{ id: 'boatA', deg: 80 }],
  onHeld: (id) => parked.push(id),
});
trap.set(80);
trap.sample(0);
trap.sample(BEAM_HOLD_MS - 1);
assert.deepEqual(parked, []);
trap.sample(BEAM_HOLD_MS);
assert.deepEqual(parked, ['boatA']);

const answered: string[] = [];
const answer = new BeamMask({
  min: 40,
  max: 180,
  widthDeg: BEAM_WIDTH,
  holdMs: BEAM_HOLD_MS,
  targets: [{ id: 'boatB', deg: 110 }],
  onHeld: (id) => answered.push(id),
});
answer.set(110);
answer.sample(0);
answer.sample(BEAM_HOLD_MS);
assert.deepEqual(answered, ['boatB']);
