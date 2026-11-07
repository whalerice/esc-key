/**
 * Cheonjiin keypad composer. Emits a string. Does not decide if it is the answer.
 * Same key cycles the consonant (4 → ㄱ, 44 → ㅋ). Vowel strokes combine.
 * A consonant after a vowel sits as a final, then moves to the next syllable
 * if a vowel follows. Space commits the current syllable.
 */

import { composeSyllable } from './hangul';

const CONS: Record<string, readonly string[]> = {
  '0': ['ㅇ', 'ㅁ'],
  '4': ['ㄱ', 'ㅋ'],
  '5': ['ㄴ', 'ㄹ'],
  '6': ['ㄷ', 'ㅌ'],
  '7': ['ㅂ', 'ㅍ'],
  '8': ['ㅅ', 'ㅎ'],
  '9': ['ㅈ', 'ㅊ'],
};

/** Longest exact stroke sequence. '2' and '22' are unfinished. */
const VOWEL: Record<string, string> = {
  '1': 'ㅣ',
  '12': 'ㅏ',
  '121': 'ㅐ',
  '1212': 'ㅒ',
  '122': 'ㅑ',
  '21': 'ㅓ',
  '211': 'ㅔ',
  '221': 'ㅕ',
  '2211': 'ㅖ',
  '23': 'ㅗ',
  '231': 'ㅚ',
  '232': 'ㅛ',
  '3': 'ㅡ',
  '31': 'ㅢ',
  '32': 'ㅜ',
  '321': 'ㅟ',
  '322': 'ㅠ',
};

export type CheonjiinSyl = {
  cho: string;
  choKey: string;
  choN: number;
  strokes: string;
  jung: string;
  jong: string;
  jongKey: string;
  jongN: number;
};

export type CheonjiinState = {
  out: string;
  syl: CheonjiinSyl;
};

export function emptyCheonjiin(): CheonjiinState {
  return { out: '', syl: emptySyl() };
}

function emptySyl(): CheonjiinSyl {
  return {
    cho: '',
    choKey: '',
    choN: 0,
    strokes: '',
    jung: '',
    jong: '',
    jongKey: '',
    jongN: 0,
  };
}

export function vowelOf(strokes: string): string {
  return VOWEL[strokes] ?? '';
}

function renderStrokes(strokes: string): string {
  return [...strokes].map((ch) => (ch === '1' ? 'ㅣ' : ch === '2' ? 'ㆍ' : 'ㅡ')).join('');
}

function preview(syl: CheonjiinSyl): string {
  if (syl.cho && syl.jung) return composeSyllable(syl.cho, syl.jung, syl.jong);
  const mid = syl.jung || renderStrokes(syl.strokes);
  return `${syl.cho}${mid}${syl.jong}`;
}

export function cheonjiinText(state: CheonjiinState): string {
  return state.out + preview(state.syl);
}

function clone(state: CheonjiinState): CheonjiinState {
  return { out: state.out, syl: { ...state.syl } };
}

function commit(state: CheonjiinState): void {
  const extra = preview(state.syl);
  if (extra) state.out += extra;
  state.syl = emptySyl();
}

function startCho(state: CheonjiinState, key: string): void {
  const list = CONS[key];
  state.syl = emptySyl();
  state.syl.cho = list?.[0] ?? '';
  state.syl.choKey = key;
}

function pressConsonant(state: CheonjiinState, key: string): void {
  const list = CONS[key] ?? [];
  const syl = state.syl;
  if (syl.cho && !syl.jung && !syl.strokes && !syl.jong && syl.choKey === key) {
    syl.choN = (syl.choN + 1) % list.length;
    syl.cho = list[syl.choN] ?? '';
    return;
  }
  if (syl.strokes && !syl.jung) {
    commit(state);
    startCho(state, key);
    return;
  }
  if (syl.jung && syl.jong && syl.jongKey === key) {
    syl.jongN = (syl.jongN + 1) % list.length;
    syl.jong = list[syl.jongN] ?? '';
    return;
  }
  if (syl.jung && !syl.jong) {
    syl.jong = list[0] ?? '';
    syl.jongKey = key;
    syl.jongN = 0;
    return;
  }
  if (syl.cho || syl.jung || syl.jong) {
    commit(state);
  }
  startCho(state, key);
}

function pressVowel(state: CheonjiinState, key: string): void {
  const syl = state.syl;
  if (syl.jong) {
    const moved = { jamo: syl.jong, key: syl.jongKey, n: syl.jongN };
    syl.jong = '';
    syl.jongKey = '';
    syl.jongN = 0;
    commit(state);
    state.syl.cho = moved.jamo;
    state.syl.choKey = moved.key;
    state.syl.choN = moved.n;
  }
  state.syl.strokes += key;
  state.syl.jung = vowelOf(state.syl.strokes);
}

function backspace(state: CheonjiinState): void {
  const syl = state.syl;
  if (syl.strokes) {
    syl.strokes = syl.strokes.slice(0, -1);
    syl.jung = vowelOf(syl.strokes);
    return;
  }
  if (syl.jong) {
    syl.jong = '';
    syl.jongKey = '';
    syl.jongN = 0;
    return;
  }
  if (syl.jung) {
    syl.jung = '';
    return;
  }
  if (syl.cho) {
    syl.cho = '';
    syl.choKey = '';
    syl.choN = 0;
    return;
  }
  const chars = [...state.out];
  chars.pop();
  state.out = chars.join('');
}

/** `⌫` deletes one stroke or one committed character. ` ` commits a word. */
export function applyCheonjiin(state: CheonjiinState, key: string): CheonjiinState {
  const next = clone(state);
  if (key === '⌫') {
    backspace(next);
    return next;
  }
  if (key === ' ') {
    commit(next);
    if (next.out && !next.out.endsWith(' ')) next.out += ' ';
    return next;
  }
  if (key === '1' || key === '2' || key === '3') {
    pressVowel(next, key);
    return next;
  }
  if (CONS[key]) {
    pressConsonant(next, key);
    return next;
  }
  return next;
}

/** Replay a digit string. Spaces commit the syllable. */
export function replayCheonjiin(digits: string): string {
  let state = emptyCheonjiin();
  for (const ch of digits) state = applyCheonjiin(state, ch);
  return cheonjiinText(state);
}
