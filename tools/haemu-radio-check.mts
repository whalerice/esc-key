/**
 * Answer table for 심야 라디오. No DOM.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  channelForPuzzle,
  hintUsesByChannel,
  nextSmallTalkIndex,
  smallTalkLine,
} from '../src/engine/systems/Hints.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { BED_SRC, CLUE_SRC, DJ_SRC, ROOM_SRC, SFX_SRC } from '../src/themes/haemu-radio/art.ts';
import { initialExtra } from '../src/themes/haemu-radio/extra.ts';
import { themeHaemuRadio } from '../src/themes/haemu-radio/index.ts';
import { assertRadioAnswers } from '../src/themes/haemu-radio/puzzles/answers.ts';

assertRadioAnswers();

const order = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const channels = [{ skin: 'walkie' as const, fromPuzzle: 'P7' }];
assert.equal(channelForPuzzle('messenger', channels, 'P6', order), 'messenger');
assert.equal(channelForPuzzle('messenger', channels, 'P7', order), 'walkie');
assert.equal(channelForPuzzle('messenger', channels, 'P8', order), 'walkie');

const themeSrc = readFileSync(new URL('../src/themes/haemu-radio/index.ts', import.meta.url), 'utf8');
const messenger = [
  '나 원래 아침 팀 출근이라 지금 자야 되는데, 이건 들어야지.',
  '도윤 선배님 손편지 고집, 처음엔 진짜 이해 안 갔어요. 지금은 좀 알 것 같아요.',
  '목요일 2번 자리, 나도 3년 동안 비웠어요. 끝내 이유는 못 들었네.',
  '후배님 다음 주부터 심야죠? 안개 낀 날엔 옥상 문 꼭 받쳐 놔요.',
  '듣고 있어요. 천천히 해요.',
];
const walkie = [
  '옥상 문, 내가 고쳐 달라고 3년째 말했어요.',
  '20년 했는데 마지막 날 갇힐 줄은 몰랐네.',
  '작가님 첫날을 이렇게 만들어서 미안해요. …근데 잘하네.',
  '마지막 곡은 작가님 손으로 올려요.',
];
for (const line of [...messenger, ...walkie]) assert.ok(themeSrc.includes(line), line);
assert.equal(smallTalkLine(walkie, 0), walkie[0]);
assert.equal(smallTalkLine(walkie, 99), walkie.at(-1));
assert.equal(nextSmallTalkIndex(walkie.length, 99), walkie.length - 1);
assert.equal(smallTalkLine(messenger, 3), messenger[3]);
assert.equal(smallTalkLine(messenger, 4), messenger[4]);

const uses = hintUsesByChannel(
  { P1: 3, P6: 1, P7: 2 },
  order,
  'messenger',
  channels,
);
assert.equal(uses.messenger, 4);
assert.equal(uses.walkie, 2);

const saved = withoutEphemeralExtra({ ...initialExtra, radioFreq: 87.9, txFreq: 88.4 });
assert.equal('radioFreq' in saved, false);
assert.equal('txFreq' in saved, false);
assert.equal(saved.heardFragments.length, 0);

for (const url of [...Object.values(ROOM_SRC), DJ_SRC, ...Object.values(BED_SRC), ...Object.values(CLUE_SRC), ...Object.values(SFX_SRC)]) {
  const file = new URL(`../public${url}`, import.meta.url);
  assert.ok(existsSync(file), url);
}

// Enter boom: no RadioBed cue at 02:00 / opening on control entry.
assert.equal(
  themeHaemuRadio.radioBed?.cues.some((c) => c.at === '02:00' || c.soundId === 'opening'),
  false,
);
assert.ok(themeHaemuRadio.radioBed?.cues.some((c) => c.soundId === 'fog-stop'));
assert.ok(existsSync(new URL('../tools/haemu-radio-synth-audio.py', import.meta.url)));

// Resume captions: ThemePlay must persist/restore captionQueue (not always re-seed openings).
const themePlay = readFileSync(new URL('../src/engine/ui/ThemePlay.tsx', import.meta.url), 'utf8');
assert.equal(themePlay.includes('setCaptionQueue'), true);
assert.equal(themePlay.includes('captionQueue'), true);

// P3 ease: 2:30 cue in sheet + softer close band + clearer hints.
const flow = readFileSync(new URL('../src/themes/haemu-radio/Flow.tsx', import.meta.url), 'utf8');
assert.equal(flow.includes('radioSfx(SFX_SRC.beep, 0.18)'), true, 'P3 reject beep quieter');
assert.equal(flow.includes('2:30'), true);
assert.equal(flow.includes('formatCartClock'), true);
assert.equal(themeSrc.includes('2분 30초(150초)'), true);
assert.equal(themeSrc.includes('80초짜리 + 20초짜리'), true);

// Popup UX: contained sheet scroll + next-hint control (no page scrollbar).
assert.equal(flow.includes('radio-popup'), true);
assert.equal(flow.includes('radio-popup-scroll'), true);
assert.equal(flow.includes('radio-popup-scrim'), true);
assert.equal(flow.includes('radio-popup-panel'), true);
assert.equal(flow.includes("data-open={mode ? 'yes' : undefined}"), true);
assert.equal(themePlay.includes('onNextHint'), true);
assert.equal(themePlay.includes('canNextHint'), true);
const hintMemo = readFileSync(new URL('../src/engine/ui/HintMemo.tsx', import.meta.url), 'utf8');
assert.equal(hintMemo.includes('다음 힌트'), true);
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
assert.equal(css.includes("html:has(.theme-play)"), true);
assert.equal(css.includes(".radio-flow[data-open='yes']"), true);
assert.equal(css.includes('radio-popup-scroll'), true);
assert.equal(css.includes('radio-popup-scrim'), true);
assert.equal(css.includes('radio-popup-panel'), true);
// Taller open popup: HUD/caption clearance only (not full 22% narration band) + slot height.
assert.equal(css.includes('calc(4.5rem + var(--safe-bottom))'), true);
assert.match(css, /\.radio-flow\[data-open='yes'\] \.radio-popup\s*\{[^}]*height:\s*100%/);
