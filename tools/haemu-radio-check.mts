/**
 * Answer table for 심야 라디오. No DOM.
 */
import assert from 'node:assert/strict';
import { channelForPuzzle } from '../src/engine/systems/Hints.ts';
import { withoutEphemeralExtra } from '../src/engine/types.ts';
import { initialExtra } from '../src/themes/haemu-radio/extra.ts';
import { assertRadioAnswers } from '../src/themes/haemu-radio/puzzles/answers.ts';

assertRadioAnswers();

const order = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const channels = [{ skin: 'walkie' as const, fromPuzzle: 'P7' }];
assert.equal(channelForPuzzle('messenger', channels, 'P6', order), 'messenger');
assert.equal(channelForPuzzle('messenger', channels, 'P7', order), 'walkie');
assert.equal(channelForPuzzle('messenger', channels, 'P8', order), 'walkie');

const saved = withoutEphemeralExtra({ ...initialExtra, radioFreq: 87.9, txFreq: 88.4 });
assert.equal('radioFreq' in saved, false);
assert.equal('txFreq' in saved, false);
assert.equal(saved.heardFragments.length, 0);
