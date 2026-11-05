/** Answer checks only — widgets emit values. Spec: §8-2. */

export const P1_ANSWER = [1, 1, 2, 4];

export function isP1Correct(values: number[]): boolean {
  return (
    values.length === 4 &&
    values.every((v, i) => v === P1_ANSWER[i])
  );
}

/** Letter dial candidates from 미니어처_설계 §2-5. */
export const P8_SLOTS = [
  ['우', '엄', '하', '내', '작'],
  ['리', '마', '늘', '집', '은'],
  ['집', '방', '꿈', '네', '다'],
];

export const P8_ANSWER = '우리집';

export function isP8Correct(value: string): boolean {
  return value === P8_ANSWER;
}
