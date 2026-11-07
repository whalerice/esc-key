/**
 * Answer table for 1/12, gate through the doll ending. No DOM.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EPHEMERAL_EXTRA_KEYS, withoutEphemeralExtra } from '../src/engine/types.ts';
import { initialExtra } from '../src/themes/neulbom-112/extra.ts';
import { theme112 } from '../src/themes/neulbom-112/index.ts';
import { line } from '../src/themes/neulbom-112/data/script.ts';
import {
  P2_ANSWER,
  P3_ORDER,
  P4_ORDER,
  P8_ANSWER,
  PIECES,
  ZOOM,
  ZOOM_STEPS,
  assert112Answers,
  isP8Correct,
  judgeP4,
  nextPuzzle,
  piecesComplete,
  resultLines,
  stepZoom,
} from '../src/themes/neulbom-112/puzzles/answers.ts';

assert112Answers();

const order = theme112.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
assert.equal(theme112.gate.needs.length, 0);
assert.equal(theme112.gate.label, '공방 문 열기');
assert.equal(theme112.timer.skin, 'none');
assert.equal(theme112.hud.notebook, false);
assert.equal(theme112.endings[0]?.id, 'A');
assert.equal(theme112.endings[0]?.title, '1/12 — CLEAR');
assert.equal(nextPuzzle({}), 'P1');
assert.equal(isP8Correct(P8_ANSWER), true);

assert.equal(judgeP4([...P4_ORDER]), 'ok');
assert.equal(P2_ANSWER.join(''), '8136');
assert.deepEqual([...P3_ORDER], ['talk', 'walk', 'sleep', 'school']);
assert.equal(stepZoom(1, 1), ZOOM.p1);
assert.equal(ZOOM_STEPS.at(-1), ZOOM.p8);
assert.equal(piecesComplete(PIECES.map((piece) => piece.id)), true);
assert.deepEqual(resultLines({ elapsedMs: 65_000, hints: 2, pieces: 5 }).slice(0, 3), [
  '걸린 시간 01:05',
  '작가의 메모장 2번',
  '기억 조각 5/8',
]);
assert.equal(resultLines({ elapsedMs: 0, hints: 0, pieces: 8 }).includes(line('letter.hidden')), false);

const saved = withoutEphemeralExtra({
  ...initialExtra,
  zoomScale: 12,
  dialDigits: [1, 1, 2, 4],
  magnetOrder: ['wall'],
  sortOrder: ['talk'],
  tapeOnFrame: true,
  radioFreq: 87.9,
});
assert.equal('zoomScale' in saved, false);
assert.equal('dialDigits' in saved, false);
assert.equal('magnetOrder' in saved, false);
assert.equal('sortOrder' in saved, false);
assert.equal('tapeOnFrame' in saved, false);
assert.equal('radioFreq' in saved, false);
assert.deepEqual(saved.pieces, []);
for (const key of EPHEMERAL_EXTRA_KEYS) {
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}
assert.deepEqual(Object.keys(initialExtra), ['pieces']);

const themeSrc = readFileSync(new URL('../src/themes/neulbom-112/index.ts', import.meta.url), 'utf8');
for (const text of [
  '봉투 주소의 번지수가 정답이에요. (1124)',
  '어린 나이부터 키의 끝자리를 적어요.',
  '말 → 걸음 → 혼자 자기 → 학교.',
  '점이 큰 것부터 탭하면 집 안의 물건이 돼요.',
  '오래된 사진부터 시각을 이어 붙여요.',
  '침대 밑 틈을 최대로 확대해요.',
  '겨울 코트는 칼라에 털이 있어요.',
  '정답은 「우리집」이에요.',
]) {
  assert.ok(themeSrc.includes(text), text);
}

const flow = readFileSync(new URL('../src/themes/neulbom-112/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('new NumberDial'), true);
assert.equal(flow.includes('new LetterDial'), true);
assert.equal(flow.includes('new DragSort'), true);
assert.equal(flow.includes('requestFullscreen'), false);
assert.equal(flow.includes('patchExtra({ pieces'), true);
assert.equal(flow.includes('zoomScale'), false);
assert.equal(flow.includes('setFlag(\'endingA\')') || flow.includes('setFlag("endingA")'), true);
assert.equal(flow.includes('빈 받침대'), true);
assert.equal(readFileSync(new URL('../src/themes/neulbom-112/Play.tsx', import.meta.url), 'utf8').includes('requestFullscreen'), false);
assert.ok(line('narration.x12').includes('원래 크기'));
assert.ok(line('letter.hidden').includes('우리 애기'));
