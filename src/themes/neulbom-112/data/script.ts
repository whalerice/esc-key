/** Script keys — from docs/늘봄/미니어처_대본.md (slice subset). */

export const script = {
  'narration.opening.1': '비가 그치지 않는 저녁이었다.',
  'narration.opening.2':
    '작가님은 보이지 않았다. 작업대 위에, 내가 자란 집이 있었다.',
  'narration.guide.zoom': '두 손가락으로 벌려 확대해 보세요.',
  'inspect.house.locked': '지붕이 잠겨 있다. 자물쇠에 숫자 네 칸.',
  'inspect.mailbox.far': '손톱보다 작은 봉투. 글씨가 너무 작다.',
  'inspect.mailbox.near': '손톱보다 작은 봉투. 늘봄시 해송동 1124번지.',
  'acquire.envelope': '봉투를 부품함에 넣었다.',
  'narration.p1.solved': '딸깍. 지붕이 열렸다. 익숙한 냄새가 날 것 같았다.',
  'inspect.attic': '다락 상자에 글자 세 칸 다이얼이 있다.',
  'narration.p8.solved':
    '상자 안에는 내가 버린 줄 알았던 것들이 있었다. 전부 1/12 크기로.',
  'system.wrong': '아닌 것 같다.',
} as const;

export type ScriptKey = keyof typeof script;

export function line(key: ScriptKey): string {
  return script[key];
}

export const openingLines = [
  script['narration.opening.1'],
  script['narration.opening.2'],
  script['narration.guide.zoom'],
];
