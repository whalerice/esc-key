import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type DarkroomExtra } from './extra';

/** Gray-box play. Answers live in puzzles/answers.ts. Crank, bath, spiral, and face-down time are not in extra. */
export const themeDarkroom: ThemeDefinition<DarkroomExtra> = {
  id: 'neulbom-darkroom',
  world: 'neulbom',
  title: '붉은 방',
  lengthMin: 30,
  gate: { label: '암실에 들어가기', needs: ['orientation'] },
  timer: { skin: 'darkroom', durationMs: 30 * 60_000, onZero: 'C' },
  hud: {
    inventoryName: '소지품',
    hintChannel: 'rotary-phone',
    notebook: true,
  },
  smallTalk: {
    'rotary-phone': [
      '이 시간에 불을 켜 놓고 뭐 하나 했더니. 춥지 않나.',
      '상만이는 셔터 내리고 나면 꼭 우리 가게 와서 시계 소리 듣다 갔어. 조용해서 좋다고.',
      '나는 사진 찍히는 거 싫어해. 상만이가 몇 번을 찍자고 했는데.',
      '정희 씨가 그 간판 글씨를 쓸 때 내가 사다리를 잡아 줬지. 비뚤다고 세 번을 다시 썼어.',
      '…상만이가 그 방에서 뭘 기다렸는지, 나는 알 것 같기도 해.',
      '천천히 하게. 시계는 내가 보고 있을 테니.',
    ],
  },
  scenes: [
    { id: 'darkroom', background: '#1a0505' },
    { id: 'shop', background: '#241c18' },
  ],
  puzzles: [
    { id: 'P1', scene: 'darkroom', widget: 'NumberDial' },
    { id: 'P2', scene: 'darkroom', widget: 'PathFollow' },
    { id: 'P3', scene: 'darkroom', widget: 'TuningKnob' },
    { id: 'P4', scene: 'darkroom', widget: 'Loupe' },
    { id: 'P5', scene: 'darkroom', widget: 'TuningKnob' },
    { id: 'P6', scene: 'darkroom', widget: 'DragSnap' },
    { id: 'P7', scene: 'shop', widget: 'FindTap' },
    { id: 'P8', scene: 'darkroom', widget: 'MaskAccumulator' },
  ],
  hints: {
    P1: {
      intro: '상만이 이 가게 연 게 72년이었나. 간판 글씨는 정희 씨가 골랐지.',
      steps: [
        '빨간 건 빨간 불 아래서 숨는다네.',
        '안전등 켜고 수칙 종이를 다시 보게. 파란 연필 자국이 있을 게야.',
        '413. 약품장 자물쇠.',
      ],
    },
    P2: {
      intro: '정희 씨는 암실을 무서워했어. 그래서 상만이가 야광 점을 붙여 놨지.',
      steps: [
        '필름은 그 빨간 불도 싫어해. 깜깜해야 해.',
        '반짝이는 점이 릴 길이야. 바깥에서 안쪽으로.',
        '불 끄고, 점을 따라 바깥부터 끝까지 감게.',
      ],
    },
    P3: {
      intro: '컬러 필름은 정희 씨가 들여왔어. 상만이는 흑백만 고집했고.',
      steps: [
        '필름 통에 뭐라고 적혔나 보게. 흑백이랑 컬러는 약이 달라.',
        '컬러는 뜨겁게, 정확하게. 상만이 노트에 숫자가 있지.',
        '컬러 키트, 38도, 3분 15초.',
      ],
    },
    P4: {
      intro: '정희 씨는 늘 빨간 머플러를 했지. 겨울이 아니어도.',
      steps: [
        '네가는 거꾸로 보여. 빨간 건 빨갛게 안 보이지.',
        '청록색을 찾되, 우체통 말고 사람을 찾게. 줄마다 하나씩이야.',
        'A5, B2, C6, D3, E1, F4.',
      ],
    },
    P5: {
      intro: '74년 그 겨울에도 상만이는 여기서 인화를 하고 있었어.',
      steps: [
        '시험 띠는 흐린 쪽부터 보게.',
        '회색이 끊기지 않는 첫 칸. 10초는 아직 흐려. 불 끄는 것도 잊지 말고.',
        '15초. 안전등 끄고, 넣고 나면 엎어 두고 기다리게.',
      ],
    },
    P6: {
      intro: '요즘 상만이가 골목만 찍더라고. 누굴 기다리는 사람처럼.',
      steps: [
        '나무를 보게. 잎은 거꾸로 붙지 않아.',
        '옆집 전파사 간판, 그리고 화환. 꽃은 시들기만 하지. 외투는 믿지 말고.',
        '단풍놀이, 돌잔치, 쇼윈도, 가족사진, 증명사진, 첫눈.',
      ],
    },
    P7: {
      intro: '그 봉투는 내가 버리자고 해도 안 버렸어.',
      steps: [
        '그 여자 손에 뭐가 들렸는지 크게 보게.',
        '빨간 볼펜은 빨간 불 아래서 사라지지.',
        "0741. 진열장 아래 '찾아가지 않은 사진' 서랍.",
      ],
    },
    P8: {
      intro: '상만이가 사흘 전에 그러더라. 이번엔 같이 찍혀야겠다고.',
      steps: [
        '어두운 사진은 빛을 더 주는 게 아니라, 밝힐 데를 가려 주는 거야.',
        '노출하는 동안 얼굴 두 개를 손가락으로 덮고 있게.',
        '두 얼굴을 끝까지 가리고, 다시 엎어 두게.',
      ],
    },
  },
  events: [
    { on: { solved: 'P1' }, run: ['safelight:hum', 'cabinet:open'] },
    { on: { solved: 'P4' }, run: ['lightbox:blink'] },
    { on: { solved: 'P6' }, run: ['door:rattle'] },
    { on: { solved: 'P7' }, run: ['banner:choi'] },
    { on: { stalledMin: 3 }, run: ['hint:blink'] },
    { on: { timerLeftMin: 10 }, run: ['fx:tick-louder'] },
    { on: { timerLeftMin: 5 }, run: ['fx:tick-louder'] },
  ],
  endings: [
    { id: 'A', title: '정착', condition: 'fix' },
    { id: 'B', title: '감광', condition: 'fog' },
    { id: 'C', title: '타이머 종료', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
