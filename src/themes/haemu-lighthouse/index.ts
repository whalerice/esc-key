import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type LighthouseExtra } from './extra';

/** Illustrated play. Answers live in puzzles/answers.ts. Beam and morse are not in extra. */
export const themeHaemuLighthouse: ThemeDefinition<LighthouseExtra> = {
  id: 'haemu-lighthouse',
  world: 'haemu',
  title: '등대지기의 마지막 일지',
  lengthMin: 30,
  gate: { label: '당직실 문 두드리기', needs: [] },
  timer: {
    skin: 'watch-clock',
    durationMs: 30 * 60_000,
    startClock: '02:00',
    onZero: [{ if: { solved: 'P7' }, ending: 'B2' }, { ending: 'B1' }],
  },
  hud: {
    inventoryName: '주머니',
    hintChannel: 'speaking-tube',
    notebook: true,
    floorNav: {
      start: '1',
      floors: [
        { id: '1', name: '당직실', band: '#3a6ea5' },
        { id: '2', name: '무적실', band: '#3d7a4a' },
        { id: '3', name: '창고', band: '#d8d4cc' },
        { id: '4', name: '위 당직실', band: '#1c1c1c' },
        { id: '5', name: '기계실', band: '#c4a024' },
        { id: '6', name: '등실', band: '#8c2f2f' },
      ],
    },
  },
  smallTalk: {
    'speaking-tube': [
      '이 계단 몇 번 올랐는지, 세다가 말았어요.',
      '라디오 그 DJ, 20년 들으니까 친척 같아.',
      '주무관님 계획서, 나도 읽었어요. 글은 잘 쓰더만.',
      '다음 달부터 이 불은 혼자 돌아요. 그래도 누가 보고는 있겠지.',
      '천천히 해요. 배는 아직 기다려요.',
    ],
  },
  radioBed: {
    cues: [
      { at: '02:00', soundId: 'opening' },
      { at: '02:03', soundId: 'fog-stop' },
      { at: '02:07', soundId: '3am-coffee' },
      { at: '02:14', soundId: 'far-sea' },
      { at: '02:18', soundId: 'wind' },
      { at: '02:25', soundId: 'breakwater' },
      { at: '02:27', soundId: 'last-corner' },
      { at: '02:29', soundId: 'signal' },
    ],
  },
  scenes: [
    { id: 'f1', background: '#16140f' },
    { id: 'panel', background: '#14110e' },
    { id: 'f2', background: '#10140f' },
    { id: 'f3', background: '#141414' },
    { id: 'f4', background: '#16140f' },
    { id: 'f5', background: '#14120e' },
    { id: 'f6', background: '#121418' },
    { id: 'rail', background: '#1E2A33' },
  ],
  puzzles: [
    { id: 'P1', scene: 'f1', widget: 'Keypad' },
    { id: 'P2', scene: 'panel', widget: 'SequenceTap' },
    { id: 'P3', scene: 'f6', widget: 'DragSnap' },
    { id: 'P4', scene: 'rail', widget: 'BeamMask' },
    { id: 'P5', scene: 'f4', widget: 'FindTap' },
    { id: 'P6', scene: 'f2', widget: 'RhythmPress' },
    { id: 'P7', scene: 'rail', widget: 'MorseInput' },
    { id: 'P8', scene: 'f4', widget: 'DragSnap' },
  ],
  hints: {
    P1: {
      intro: '번호 물어보는 사람은 30년 만에 처음이네.',
      steps: [
        '뚜껑에 적은 대로요. 오르는 거 하나, 도는 거 하나.',
        '계단 수는 문 옆 명판. 불은 해도 말고 창밖을 시계랑 같이 봐요.',
        '1418이요. 141계단, 8초.',
      ],
    },
    P2: {
      intro: '배전반 열었어요? 그거 또 떨어졌구먼.',
      steps: [
        '쪽지 봤죠? 한꺼번에 말고, 위층부터.',
        '레버 색이랑 층 안내판 색이 같아요. 어느 층이 제일 높은지.',
        '빨강, 노랑, 초록. 등실, 기계실, 무적실.',
      ],
    },
    P3: {
      intro: '교환기가 또 걸렸지. 그거 손으로 돌려야 돼요.',
      steps: [
        '새것이라고 다 좋은 게 아니에요. 하나씩 톡 쳐 봐요.',
        '켜고 나서 확인창 봐요. 거기 보이는 건 거꾸로예요. 올리면 내려가.',
        '3번 전구. 그림자를 반대로 움직여서 십자 가운데.',
      ],
    },
    P4: {
      intro: '바람 세죠? 난간 꽉 잡고.',
      steps: [
        '진 선장이 말한 거 그대로 찾아요. 깃발, 불, 부표.',
        '초록 깃발 배가 둘이에요. 마스트 불을 세 봐요.',
        '부표 3번 바로 옆, 불 두 개. 110도쯤. 빛을 대고 가만히.',
      ],
    },
    P5: {
      intro: '일지는 내 글씨라 읽기 힘들 거요.',
      steps: [
        '띠지 색이 뭔지 나도 안 적어 놨어요. 하나씩 열어 봐요.',
        '무적은 파랑. 처음 적은 날은 준공식 날 밤.',
        '2016년 권 첫 파란 띠지. 7월 15일.',
      ],
    },
    P6: {
      intro: '압축기 소리 들리면 반은 한 거요.',
      steps: [
        '일지 순서 그대로. 순서 바꾸면 물 뒤집어써요.',
        '압력 7 기다리고, 물 먼저 잠그고, 그다음 공기.',
        '길게, 쉬고, 길게. 2초씩. 그리고 쐐기 박아요.',
      ],
    },
    P7: {
      intro: '급하다. 그래도 천천히.',
      steps: [
        '말로 하면 놓쳐요. 불로 해요. 덮개 안에 카드.',
        '위험한 쪽으로 간다는 글자. 빨간 불 말고 배를 비추고.',
        'U. 짧게, 짧게, 길게. 135도쯤 배에.',
      ],
    },
    P8: {
      intro: '30년 동안 그 칸 내가 채웠는데, 오늘은 아니네.',
      steps: [
        '오늘 본 대로 써요. 수첩에 다 있잖아요.',
        '몇 번 전구, 몇 초에 몇 번, 어느 배, 라디오 몇.',
        '3번, 30초 2회, 제3해진호, 87.9.',
      ],
    },
  },
  events: [
    { on: { timerLeftMin: 20 }, run: ['captain:t10'] },
    { on: { timerLeftMin: 10 }, run: ['tube:doyun-roof'] },
    { on: { timerLeftMin: 5 }, run: ['captain:t25'] },
    { on: { timerLeftMin: 1 }, run: ['captain:t29'] },
    { on: { solved: 'P3' }, run: ['lamp:main', 'captain:see-light'] },
    { on: { solved: 'P5' }, run: ['fx:log-flip', 'tube:reason'] },
    { on: { solved: 'P6' }, run: ['horn:loop', 'captain:hear', 'delay:10s', 'captain:red-light'] },
    { on: { stalledMin: 4 }, run: ['hint:blink'] },
  ],
  endings: [
    { id: 'A', title: '다음 사람에게', condition: 'solved:P8' },
    { id: 'B1', title: '안개 속 닻', condition: 'timer-zero' },
    { id: 'B2', title: '빈 일지', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
