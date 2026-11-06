/**
 * Answer table for 등대지기. No DOM.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nearestSnap } from '../src/engine/widgets/DragSnap.ts';
import { SequenceTap } from '../src/engine/widgets/SequenceTap.ts';
import { MorseInput } from '../src/engine/widgets/MorseInput.ts';
import { RhythmPress } from '../src/engine/widgets/RhythmPress.ts';
import { resolveOnZero } from '../src/engine/systems/Timer.ts';
import { hintUsesByChannel } from '../src/engine/systems/Hints.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { initialExtra } from '../src/themes/haemu-lighthouse/extra.ts';
import { themeHaemuLighthouse } from '../src/themes/haemu-lighthouse/index.ts';
import {
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
