/**
 * Answer table for 잿빛 새벽, gate through an ending. No DOM.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { EPHEMERAL_EXTRA_KEYS, withoutEphemeralExtra } from '../src/engine/types.ts';
import { BED_SRC, CLUE_SRC, PROP_SRC, ROOM_SRC, SFX_SRC } from '../src/themes/ashen-dawn/art.ts';
import { initialExtra } from '../src/themes/ashen-dawn/extra.ts';
import { themeAshDawn } from '../src/themes/ashen-dawn/index.ts';
import { line } from '../src/themes/ashen-dawn/data/script.ts';
import {
  CALLSIGN,
  CANCEL_CODE,
  CIPHER,
  OP_NAME,
  ORDER,
  PIN_HUM,
  STATION_DIGITS,
  assertAshDawn,
  decodeMorse,
  fFileLetters,
  judgeCall,
  judgeDrawer,
  judgeFreq,
  judgePairs,
  judgeSafeStop,
  judgeSend,
  nameToDial,
  nextPuzzle,
  punchedColumn,
  resultLines,
  scarfCodes,
} from '../src/themes/ashen-dawn/puzzles/answers.ts';

assertAshDawn();

const order = themeAshDawn.puzzles.map((puzzle) => puzzle.id);
assert.deepEqual(order, [...ORDER]);
assert.equal(themeAshDawn.id, 'ashen-dawn');
assert.equal(themeAshDawn.world, 'standalone');
assert.equal(themeAshDawn.gate.needs.length, 0);
assert.equal(themeAshDawn.gate.label, '이어폰을 끼고 시작');
assert.equal(themeAshDawn.timer.skin, 'wallclock');
assert.equal(themeAshDawn.timer.durationMs, 60 * 60_000);
assert.equal(themeAshDawn.timer.startClock, '03:00');
assert.equal(themeAshDawn.timer.onZero, 'C');
assert.equal(themeAshDawn.hud.notebook, true);
assert.equal(themeAshDawn.hud.hintChannel, 'guard-phone');
assert.equal(themeAshDawn.hud.inventoryName, '소지품 서랍');
assert.equal(themeAshDawn.endings[0]?.id, 'A');
assert.equal(themeAshDawn.endings[0]?.title, '새벽은 오지 않았다');
assert.equal(themeAshDawn.endings[2]?.id, 'C');
assert.equal(nextPuzzle({}), 'P1');
assert.equal(judgeDrawer([9, 2, 6]), 'ok');
assert.equal(judgeCall(nameToDial('JOSEF')), 'josef');
assert.equal(fFileLetters(), OP_NAME);
assert.equal(punchedColumn(), 'GBVFVJVRS');
assert.equal(CIPHER.length, 64);
assert.equal(judgeFreq(7.11), 'hit');
assert.equal(judgeFreq(11.7), 'trap');
assert.equal(judgePairs('0308051919'), 'ok');
assert.equal(decodeMorse(scarfCodes()), CALLSIGN);
assert.equal(judgeSafeStop(2, 'R', 27), 'open');
assert.equal(judgeSend(['GLASHAUS ABBRUCH', CANCEL_CODE, CALLSIGN], 'D'), 'A');
assert.equal(judgeSend(['GLASHAUS ABBRUCH', CANCEL_CODE, CALLSIGN], 'B'), 'B');
assert.equal(STATION_DIGITS, '4027116947');
assert.equal(PIN_HUM.join(''), '6214752');

assert.deepEqual(
  resultLines({ endingId: 'A', elapsedMs: 65_000, remainingMs: 3_535_000, hints: 3, epilogue: 'blank' }).slice(0, 4),
  ['걸린 시간 01:05', '남은 시간 58:55', '요제프에게 3번 전화했다', '새벽은 오지 않았다'],
);
assert.equal(
  resultLines({ endingId: 'A', elapsedMs: 0, hints: 0, remainingMs: 0, epilogue: null }).some((row) => row.includes(CALLSIGN)),
  false,
);

const saved = withoutEphemeralExtra({
  ...initialExtra,
  radioFreq: 7.11,
  morseInput: '·',
  cylinderPins: [6, 2, 1],
  lockStage: 2,
});
assert.equal('radioFreq' in saved, false);
assert.equal('morseInput' in initialExtra, false);
assert.equal('cylinderPins' in initialExtra, false);
assert.equal(saved.lockStage, 2);
assert.deepEqual(Object.keys(initialExtra), ['lockStage', 'sent', 'epilogueChoice']);
for (const key of EPHEMERAL_EXTRA_KEYS) {
  assert.equal(Object.hasOwn(initialExtra, key), false, key);
}

const themeSrc = readFileSync(new URL('../src/themes/ashen-dawn/index.ts', import.meta.url), 'utf8');
for (const text of [
  '926. 아홉 시 이십육 분.',
  '렌츠 양반은 종이도 판 위에서 읽었지.',
  '7.11 메가헤르츠. 숫자 두 묶음을 적게. 40271, 16947.',
  '03 08 05 19 19. CHESS.',
  'VOGEL3. 전신기에 넣어 보게.',
  'R32, L15, R27.',
  '6172. 코드는 52086172. GLASHAUS ABBRUCH, VOGEL3, 채널 D.',
]) {
  assert.ok(themeSrc.includes(text), text);
}

const flow = readFileSync(new URL('../src/themes/ashen-dawn/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('new NumberDial'), true);
assert.equal(flow.includes('new RotaryDial'), true);
assert.equal(flow.includes('new SafeDial'), true);
assert.equal(flow.includes('new TuningKnob'), true);
assert.equal(flow.includes('nearestSnap'), true);
assert.equal(flow.includes('requestFullscreen'), false);
assert.equal(flow.includes('howler'), false);
assert.equal(flow.includes('unsplash'), false);
assert.equal(flow.includes('.png'), false);
assert.equal(flow.includes('.jpg'), false);
assert.equal(flow.includes('radioFreq'), false);
assert.equal(flow.includes('morseInput'), false);
assert.equal(flow.includes('cylinderPins'), false);
assert.equal(flow.includes('patchExtra({ lockStage'), true);
assert.equal(flow.includes('playClue'), true);
assert.equal(flow.includes('글자 확정'), true);
assert.equal(flow.includes('한 글자 지우기'), true);

const play = readFileSync(new URL('../src/themes/ashen-dawn/Play.tsx', import.meta.url), 'utf8');
const audio = readFileSync(new URL('../src/themes/ashen-dawn/audio.ts', import.meta.url), 'utf8');
assert.equal(audio.includes('playHtml5Clip'), true);
assert.equal(audio.includes('AudioContext'), true);
assert.equal(audio.includes("from 'howler'"), true);
assert.equal(flow.includes('howler'), false);
assert.equal(play.includes('howler'), false);
const artSrc = readFileSync(new URL('../src/themes/ashen-dawn/art.ts', import.meta.url), 'utf8');
assert.equal(artSrc.includes('howler'), false);
const css = readFileSync(new URL('../src/themes/ashen-dawn/art.module.css', import.meta.url), 'utf8');
assert.ok(css.includes('contain'));
assert.ok(css.includes(ROOM_SRC.gate));
for (const url of [
  ...Object.values(ROOM_SRC),
  ...Object.values(PROP_SRC),
  ...Object.values(BED_SRC),
  ...Object.values(CLUE_SRC),
  ...Object.values(SFX_SRC),
]) {
  assert.ok(existsSync(new URL(`../public${url}`, import.meta.url)), url);
}
const credits = readFileSync(new URL('../public/themes/ashen-dawn/CREDITS.md', import.meta.url), 'utf8');
assert.ok(credits.includes('원작'));
assert.ok(credits.includes('number-station-7-11.wav'));
assert.ok(credits.includes('siren-close.wav'));
const clock = readFileSync(new URL('../public/themes/ashen-dawn/props/clock.svg', import.meta.url), 'utf8');
assert.equal(clock.includes('9:26'), true);
const endingArt = readFileSync(new URL('../public/themes/ashen-dawn/rooms/ending.svg', import.meta.url), 'utf8');
assert.equal(endingArt.includes('<image'), false);
assert.equal(endingArt.includes('#D5DDE4') || endingArt.includes('#d5dde4') || endingArt.includes('#C5CED6'), true);
const roomsTs = readFileSync(new URL('../src/themes/ashen-dawn/scenes/rooms.ts', import.meta.url), 'utf8');
assert.equal(roomsTs.includes('0x3a4048'), false);
assert.equal(roomsTs.includes('howler'), false);
assert.equal(play.includes('requestFullscreen'), false);
assert.ok(line('endA.4').includes('D… A… N… K… E'));
assert.ok(line('p3.empty').includes('판 위에 아무것도 없다'));
