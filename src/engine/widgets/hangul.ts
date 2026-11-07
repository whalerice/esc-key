/**
 * Jamo keypad composer. Emits a string. Does not decide if the name is right.
 * Backspace removes one jamo, not the whole syllable.
 */

const CHO = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const JUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
] as const;

const JONG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const JUNG_COMBO: Record<string, string> = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
};

const JONG_COMBO: Record<string, string> = {
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ',
};

const JONG_SPLIT: Record<string, readonly [string, string]> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ'],
};

/** Consonants and simple vowels. Compounds are composed, not separate keys. */
export const HANGUL_KEYS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ',
] as const;

export function applyHangulKey(value: string, key: string): string {
  if (key === '⌫') return backspace(value);
  const chars = [...value];
  const last = chars.at(-1) ?? '';
  const head = chars.slice(0, -1).join('');
  const parts = last ? parseSyl(last) : null;

  if ((CHO as readonly string[]).includes(key)) {
    if (parts && parts.jong === '' && (JONG as readonly string[]).includes(key)) {
      return head + syl(parts.cho, parts.jung, key);
    }
    if (parts && parts.jong) {
      const combo = JONG_COMBO[parts.jong + key];
      if (combo) return head + syl(parts.cho, parts.jung, combo);
    }
    return value + key;
  }

  if ((JUNG as readonly string[]).includes(key)) {
    if ((CHO as readonly string[]).includes(last)) return head + syl(last, key);
    if (parts && parts.jong === '') {
      const combo = JUNG_COMBO[parts.jung + key];
      if (combo) return head + syl(parts.cho, combo);
      return value + key;
    }
    if (parts && parts.jong) {
      const split = JONG_SPLIT[parts.jong];
      const keep = split ? split[0] : '';
      const move = split ? split[1] : parts.jong;
      if (!(CHO as readonly string[]).includes(move)) return value + key;
      return head + syl(parts.cho, parts.jung, keep) + syl(move, key);
    }
    return value + key;
  }

  return value + key;
}

function backspace(value: string): string {
  const chars = [...value];
  const last = chars.pop();
  if (!last) return '';
  const head = chars.join('');
  const parts = parseSyl(last);
  if (!parts) return head;
  if (parts.jong) {
    const split = JONG_SPLIT[parts.jong];
    return head + syl(parts.cho, parts.jung, split ? split[0] : '');
  }
  return head + parts.cho;
}

function syl(cho: string, jung: string, jong = ''): string {
  const ci = CHO.indexOf(cho as (typeof CHO)[number]);
  const ji = JUNG.indexOf(jung as (typeof JUNG)[number]);
  const ki = JONG.indexOf(jong as (typeof JONG)[number]);
  if (ci < 0 || ji < 0 || ki < 0) return cho + jung + jong;
  return String.fromCharCode(0xac00 + ci * 588 + ji * 28 + ki);
}

function parseSyl(ch: string): { cho: string; jung: string; jong: string } | null {
  const code = ch.codePointAt(0);
  if (code == null || code < 0xac00 || code > 0xd7a3) return null;
  const n = code - 0xac00;
  return {
    cho: CHO[Math.floor(n / 588)] ?? '',
    jung: JUNG[Math.floor((n % 588) / 28)] ?? '',
    jong: JONG[n % 28] ?? '',
  };
}
