/**
 * Answer table for 막차 이후. No DOM.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  fingerForViewfinder,
  placeViewfinder,
  rectContains,
} from '../src/engine/fx/Viewfinder.ts';
import { hintUsesByChannel } from '../src/engine/systems/Hints.ts';
import { batteryPercent, resolveOnZero, timerFace } from '../src/engine/systems/Timer.ts';
import { EPHEMERAL_EXTRA_KEYS, withoutEphemeralExtra } from '../src/engine/types.ts';
import { replayCheonjiin } from '../src/engine/widgets/cheonjiin.ts';
import { nearestSnap } from '../src/engine/widgets/DragSnap.ts';
import { allFound, markFound } from '../src/engine/widgets/FindTap.ts';
import { initialExtra } from '../src/themes/neulbom-lasttrain/extra.ts';
import { themeLasttrain } from '../src/themes/neulbom-lasttrain/index.ts';
import {
  ANSWER_BOX,
  BOX_PENALTY_MS,
  DRAFT_DIGITS,
  EUNGOK_DIGITS,
  FINDER_PAD,
  FOLDER,
  LEDGER,
  PIN,
  PORT,
  RECEIPT,
  REPLY_FULL,
  REPLY_PENALTY_MS,
  REPLY_SHORT,
  SPOTS,
  assertLasttrainAnswers,
  judgeBox,
  judgeCharger,
  judgeDraft,
  judgeReply,
  spotCenter,
  warehouseBoxes,
} from '../src/themes/neulbom-lasttrain/puzzles/answers.ts';

assertLasttrainAnswers();

const order = themeLasttrain.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
assert.equal(themeLasttrain.gate.label, '센터 불 켜기');
assert.deepEqual(themeLasttrain.gate.needs, []);
assert.equal(themeLasttrain.timer.skin, 'battery');
assert.equal(resolveOnZero(themeLasttrain.timer.onZero, {}), 'B');
assert.equal(themeLasttrain.endings.find((ending) => ending.id === 'A')?.title, '받았어');
assert.equal(themeLasttrain.endings.find((ending) => ending.id === 'B')?.title, '다음 해');
assert.equal(themeLasttrain.hud.hintChannel, 'extension');
assert.equal(themeLasttrain.hud.inventoryName, '서랍');

const uses = hintUsesByChannel({ P1: 1, P7: 2 }, order, 'extension', undefined);
assert.equal(uses.extension, 3);

assert.equal(replayCheonjiin('8215003255'), '선물');
assert.equal(replayCheonjiin('5325812551200'), '눈사람');
assert.equal(replayCheonjiin(DRAFT_DIGITS), '선물 눈사람');
assert.equal(judgeDraft(replayCheonjiin(DRAFT_DIGITS)), true);
assert.equal(replayCheonjiin(REPLY_FULL), '새말역');
assert.equal(replayCheonjiin(REPLY_SHORT), '새말');
assert.equal(replayCheonjiin(EUNGOK_DIGITS), '은곡');
assert.equal(judgeReply('digit', REPLY_FULL), 'ok');
assert.equal(judgeReply('hangul', '새말역'), 'ourWay');

assert.equal(nearestSnap(PORT.x, PORT.y, [PORT])?.id, 'port');
assert.equal(nearestSnap(0, 0, [PORT]), null);
assert.equal(judgeCharger('B'), true);
const right = RECEIPT[1]!;
assert.equal(nearestSnap(right.x, right.y, [...RECEIPT])?.id, 'right');

const boxes = warehouseBoxes();
assert.equal(boxes.length, 24);
assert.equal(boxes.filter((box) => box.tape === 'X' && box.dent).length, 1);
assert.equal(judgeBox(ANSWER_BOX), 'ok');
const found = markFound([{ id: ANSWER_BOX, found: false }], ANSWER_BOX);
assert.equal(allFound(found), true);
assert.equal(LEDGER.find((row) => row.answer)?.text.includes('상자 24'), true);
assert.equal(LEDGER.find((row) => row.id === 'film')?.text.includes('찾아감'), true);

for (const id of ['ledger', 'timetable', 'glass', 'shelf'] as const) {
  const center = spotCenter(id);
  const finger = fingerForViewfinder(center.x, center.y, FINDER_PAD.w, FINDER_PAD.h);
  const rect = placeViewfinder(finger.x, finger.y, FINDER_PAD.w, FINDER_PAD.h);
  assert.equal(rectContains(rect, center.x, center.y), true, id);
  assert.equal(rectContains(rect, finger.x, finger.y), false, id);
}

const saved = withoutEphemeralExtra({
  ...initialExtra,
  phoneOpen: true,
  radioFreq: 87.9,
  pressure: 0.4,
});
assert.equal('phoneOpen' in saved, false);
assert.equal('radioFreq' in saved, false);
assert.equal('pressure' in saved, false);
assert.deepEqual(saved.readMessages, []);
assert.equal(saved.secretFolderOpen, false);
for (const key of EPHEMERAL_EXTRA_KEYS) {
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}
assert.equal(Object.hasOwn(initialExtra, 'phoneOpen'), false);
assert.deepEqual(Object.keys(initialExtra).sort(), ['readMessages', 'secretFolderOpen', 'sentAnswers']);

const duration = 30 * 60_000;
assert.equal(batteryPercent(duration, duration), 100);
assert.equal(timerFace({ skin: 'battery', durationMs: duration, elapsedMs: 0 }).label, '100%');
assert.equal(timerFace({ skin: 'battery', durationMs: duration, elapsedMs: duration * 0.9 }).label, '10%');
assert.equal(timerFace({ skin: 'battery', durationMs: duration, elapsedMs: duration * 0.9 }).warn, true);
assert.equal(timerFace({ skin: 'battery', durationMs: duration, elapsedMs: duration * 0.95 }).label, '5%');
assert.equal(timerFace({ skin: 'battery', durationMs: duration, elapsedMs: duration * 0.95 }).blink, true);
assert.equal(timerFace({ skin: 'battery', durationMs: duration, elapsedMs: duration }).label, '0%');
assert.equal(BOX_PENALTY_MS, 20_000);
assert.equal(REPLY_PENALTY_MS, 60_000);
assert.equal(PIN, '1225');
assert.equal(FOLDER, '2247');

const themeSrc = readFileSync(new URL('../src/themes/neulbom-lasttrain/index.ts', import.meta.url), 'utf8');
for (const line of ['B. 20핀짜리.', '1225.', '선물 눈사람.', '쇼핑백. 상자 24.', '맨 아랫줄 왼쪽 끝.', '2247.', '은곡.', '812100125502214.']) {
  assert.ok(themeSrc.includes(line), line);
}

const flow = readFileSync(new URL('../src/themes/neulbom-lasttrain/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('requestFullscreen'), false);
assert.equal(flow.includes('howler'), false);
assert.equal(flow.includes('BOX_PENALTY_MS'), true);
assert.equal(flow.includes('REPLY_PENALTY_MS'), true);
assert.doesNotMatch(flow, /patchExtra\(\{[^}]*phoneOpen/);
assert.doesNotMatch(flow, /radioFreq|beamDeg|txFreq|pressure/);

const script = readFileSync(new URL('../src/themes/neulbom-lasttrain/data/script.ts', import.meta.url), 'utf8');
assert.ok(script.includes('서비스 지역이 아닙니다'));
assert.ok(script.includes('한결대 식물원 유리온실'));
assert.ok(script.includes('올해도 왔구나'));

console.log('neulbom-lasttrain-check ok');
