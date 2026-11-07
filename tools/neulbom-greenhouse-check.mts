/**
 * Answer table for 겨울 온실. No DOM.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BreathDetector, BREATH_NEED_MS } from '../src/engine/sensors/BreathDetector.ts';
import { thermometerC, timerFace } from '../src/engine/systems/Timer.ts';
import { resolveOnZero } from '../src/engine/systems/Timer.ts';
import { hintUsesByChannel } from '../src/engine/systems/Hints.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { applyHangulKey } from '../src/engine/widgets/hangul.ts';
import { nearestSnap } from '../src/engine/widgets/DragSnap.ts';
import { DragSort } from '../src/engine/widgets/DragSort.ts';
import { SequenceTap } from '../src/engine/widgets/SequenceTap.ts';
import { SafeDial } from '../src/engine/widgets/SafeDial.ts';
import { StrokePad } from '../src/engine/widgets/StrokePad.ts';
import { initialExtra } from '../src/themes/neulbom-greenhouse/extra.ts';
import { themeGreenhouse } from '../src/themes/neulbom-greenhouse/index.ts';
import {
  MAT_NOTCHES,
  MAT_SCALE,
  P2_ORDER,
  P3_CODE,
  P4_CODE,
  assertGreenhouseAnswers,
  judgeDate,
  judgeSpecies,
  judgeValves,
  monthSlots,
  potSlots,
} from '../src/themes/neulbom-greenhouse/puzzles/answers.ts';

assertGreenhouseAnswers();

const order = themeGreenhouse.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
assert.equal(themeGreenhouse.gate.label, '문 열기');
assert.equal(themeGreenhouse.gate.needs.includes('mic'), true);
assert.equal(themeGreenhouse.timer.skin, 'thermometer');
assert.equal(resolveOnZero(themeGreenhouse.timer.onZero, {}), 'B');
assert.equal(themeGreenhouse.endings.find((ending) => ending.id === 'A')?.title, '봄이네');
assert.equal(themeGreenhouse.endings.find((ending) => ending.id === 'B')?.title, '씨앗은 얼지 않는다');

const uses = hintUsesByChannel({ P1: 1, P4: 2 }, order, 'radio', undefined);
assert.equal(uses.radio, 3);

assert.equal(new SequenceTap([...P2_ORDER]).check([...P2_ORDER]), judgeValves([...P2_ORDER]) === 'ok');
assert.equal(judgeSpecies(P3_CODE.toLowerCase()), 'ok');
assert.equal(judgeDate(P4_CODE), 'ok');

const pots = potSlots();
assert.equal(nearestSnap(pots[0]!.x, pots[0]!.y, pots)?.id, 'cyclamen');
assert.equal(nearestSnap(0, 0, pots), null);
const months = monthSlots();
assert.equal(nearestSnap(months[0]!.x, months[0]!.y, months)?.id, '1');

const sort = new DragSort(['paper', 'coat', 'sides', 'water']);
sort.move(3, 0);
assert.deepEqual(sort.order, ['water', 'paper', 'coat', 'sides']);

const dial = new SafeDial(MAT_SCALE);
dial.set(MAT_NOTCHES);
assert.equal(dial.position, MAT_NOTCHES);
dial.set(MAT_NOTCHES + 1);
assert.equal(dial.position, MAT_NOTCHES + 1);

const breath = new BreathDetector();
breath.start();
let loud = 0;
for (let t = 0; t <= BREATH_NEED_MS; t += 100) loud = breath.push(t, 1);
assert.equal(loud >= BREATH_NEED_MS, true);
breath.loudMs = 0;
breath.push(0, 0.01);
assert.equal(breath.release(false), false);
assert.equal(breath.release(false), false);
assert.equal(breath.release(false), true);

const pad = new StrokePad();
pad.begin(0.1, 0.2);
pad.extend(0.4, 0.5);
pad.end();
assert.equal(pad.strokes.length, 1);
assert.equal(pad.strokes[0]?.length, 2);

assert.equal(applyHangulKey('', 'ㅂ'), 'ㅂ');
assert.equal(applyHangulKey('ㅂ', 'ㅗ'), '보');
assert.equal(applyHangulKey('보', 'ㅁ'), '봄');
assert.equal(applyHangulKey('아', 'ㅃ'), '아ㅃ');
assert.equal(applyHangulKey('아ㅃ', 'ㅏ'), '아빠');

const saved = withoutEphemeralExtra({ ...initialExtra, pressure: 0.8, radioFreq: 87.9 });
assert.equal('pressure' in saved, false);
assert.equal('radioFreq' in saved, false);
assert.equal(saved.bloomStage, 0);
for (const key of ['pressure', 'radioFreq', 'txFreq', 'beamDeg', 'morseCode']) {
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}
assert.deepEqual(Object.keys(initialExtra).sort(), ['bloomStage', 'breathFallback', 'finaleStrokes', 'nameTag']);

const duration = 30 * 60_000;
assert.equal(timerFace({ skin: 'thermometer', durationMs: duration, elapsedMs: 0 }).label, '14.0°C');
assert.equal(timerFace({ skin: 'thermometer', durationMs: duration, elapsedMs: duration / 2 }).label, '7.0°C');
assert.equal(
  timerFace({ skin: 'thermometer', durationMs: duration, elapsedMs: duration / 2 }).warn,
  true,
);
assert.equal(timerFace({ skin: 'thermometer', durationMs: duration, elapsedMs: duration }).label, '0.0°C');
assert.equal(
  timerFace({
    skin: 'thermometer',
    durationMs: duration,
    elapsedMs: 180_000,
    bonusPausedMs: 180_000,
  }).label,
  '14.0°C',
);
assert.equal(thermometerC(duration, duration), 14);
assert.equal(
  timerFace({ skin: 'thermometer', durationMs: duration, elapsedMs: 0, bonusPausedMs: 180_000 }).label,
  '14.0°C',
);

const themeSrc = readFileSync(new URL('../src/themes/neulbom-greenhouse/index.ts', import.meta.url), 'utf8');
for (const line of [
  '노란 비상 콘센트예요.',
  '파랑, 노랑, 초록, 빨강.',
  'H, A, Y, U, N, A, E.',
  '1214.',
  '바늘 씨 코스모스.',
  '10월 코스모스.',
  '물주머니 채우기, 상자 양옆, 외투, 신문.',
  '문틀 아래 왼쪽 틈에 신문, 다이얼 여덟 칸 더, 그리고 불 끄기.',
  '여기 있어요. 천천히 해요.',
]) {
  assert.ok(themeSrc.includes(line), line);
}

const flow = readFileSync(new URL('../src/themes/neulbom-greenhouse/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('requestFullscreen'), false);
assert.equal(flow.includes('howler'), false);
assert.equal(flow.includes('HEATER_PAUSE_MS'), true);
assert.equal(flow.includes('BLOOM_OPEN_MS'), true);
assert.doesNotMatch(flow, /patchExtra\(\{[^}]*pressure/);
assert.doesNotMatch(flow, /patchExtra\(\{[^}]*notch/);
assert.doesNotMatch(flow, /radioFreq|beamDeg|txFreq/);

const script = readFileSync(new URL('../src/themes/neulbom-greenhouse/data/script.ts', import.meta.url), 'utf8');
assert.ok(script.includes('온수로 물주머니 둘을 채워 상자 양옆에 넣고'));
assert.ok(script.includes('96.12.14'));
