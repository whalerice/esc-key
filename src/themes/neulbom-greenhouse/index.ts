import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type GreenhouseExtra } from './extra';

/** Gray-box play. Answers live in puzzles/answers.ts. Pressure and dial notches are not in extra. */
export const themeGreenhouse: ThemeDefinition<GreenhouseExtra> = {
  id: 'neulbom-greenhouse',
  world: 'neulbom',
  title: '겨울 온실',
  lengthMin: 30,
  gate: { label: '문 열기', needs: ['mic'] },
  timer: { skin: 'thermometer', durationMs: 30 * 60_000, onZero: 'B' },
  hud: {
    inventoryName: '소지품',
    hintChannel: 'radio',
    notebook: true,
  },
  smallTalk: {
    radio: [
      '춥죠. 장갑 있어요? 없으면 교수님 거 전실에 있을 거예요.',
      '교수님이 하윤 씨 얘기를 많이 하진 않았어요. 근데 봄 되면 정문까지 내려오셨어요.',
      '나는 커피를 안 좋아해요. 교수님이 타 오시니까 마신 거지.',
      '그 온실, 내년에 헐린대요. 교수님 혼자 반대 서명 받으러 다니셨어요.',
      '…거기 있는 거, 교수님이 직접 보여 주고 싶어 하셨을 거예요. 내가 말하면 안 되죠.',
      '여기 있어요. 천천히 해요.',
    ],
  },
  scenes: [
    { id: 'foyer', background: '#2a2e2c' },
    { id: 'boiler', background: '#323232' },
    { id: 'hall', background: '#2e3230' },
    { id: 'glass', background: '#343836' },
    { id: 'nursery', background: '#303430' },
  ],
  puzzles: [
    { id: 'P1', scene: 'foyer', widget: 'DragSnap' },
    { id: 'P2', scene: 'boiler', widget: 'SequenceTap' },
    { id: 'P3', scene: 'hall', widget: 'Keypad' },
    { id: 'P4', scene: 'glass', widget: 'LongPress' },
    { id: 'P5', scene: 'nursery', widget: 'DragSnap' },
    { id: 'P6', scene: 'nursery', widget: 'DragSnap' },
    { id: 'P7', scene: 'nursery', widget: 'DragSort' },
    { id: 'P8', scene: 'foyer', widget: 'SafeDial' },
  ],
  hints: {
    P1: {
      intro: '교수님은 커피를 꼭 두 잔 타 오셨어요. 하나는 내 거, 하나는 식어도 안 드시고.',
      steps: [
        '쪽지에 뭐라고 적혀 있었어요?',
        '매트는 작업대 밑에. 콘센트는 고장 안 난 걸로.',
        '노란 비상 콘센트예요.',
      ],
    },
    P2: {
      intro: '보일러가 서면 교수님이 제일 먼저 뛰어가셨지. 오늘처럼.',
      steps: [
        '벽에 교수님 글씨가 붙어 있을 거예요.',
        '바늘 숫자가 작은 것부터요.',
        '파랑, 노랑, 초록, 빨강.',
      ],
    },
    P3: {
      intro: '그 난초 보러 외국에서도 손님이 왔어요. 교수님은 시큰둥하셨고.',
      steps: [
        '이름이 지워졌으면, 이름 지은 기록을 찾아봐요.',
        '책상 위 액자. 제목에 학명이 그대로 있어요.',
        'H, A, Y, U, N, A, E.',
      ],
    },
    P4: {
      intro: '그 유리는 청소하는 분들한테 손대지 말라고, 교수님이 몇 번이나 부탁하셨어요.',
      steps: [
        '뿌연 유리. 차가운 유리엔 입김이 보이죠.',
        '후 불어 봐요. 날짜가 나올 거예요.',
        '1214.',
      ],
    },
    P5: {
      intro: '교수님 노트, 그거 30년 된 거예요. 겉장을 세 번 갈았어요.',
      steps: [
        '노트 그림이랑 잎 모양을 하나씩 대 봐요.',
        '씨앗만 있는 건 손에 쏟아 보고. 풀처럼 생긴 것도 꽃이에요.',
        '하트 잎 시클라멘, 둥근 잎 팬지, 주걱 잎 금잔화, 풀잎 패랭이. 둥근 씨 봉선화, 줄무늬 씨 해바라기, 바늘 씨 코스모스.',
      ],
    },
    P6: {
      intro: '봄만 되면 교수님이 정문까지 내려와서 한참 서 계셨어요. 누굴 기다리는 사람처럼.',
      steps: [
        '선반에 달마다 칸이 있죠.',
        '노트 맨 뒷장, 피는 달.',
        '1월 시클라멘, 3월 팬지, 4월 금잔화, 5월 패랭이, 7월 봉선화, 8월 해바라기, 10월 코스모스.',
      ],
    },
    P7: {
      intro: '15년 전 그 한파 때, 교수님 밤새 안 나오셨어요. 아침에 외투도 없이 나오시더라고.',
      steps: [
        '그날 교수님이 한 그대로 해 봐요.',
        '물주머니부터. 따뜻한 물은 보일러실에.',
        '물주머니 채우기, 상자 양옆, 외투, 신문.',
      ],
    },
    P8: {
      intro: '교수님이 그 꽃 피는 날은 경비실에도 불 끄라고 하셨어요. 어두워야 핀다고.',
      steps: [
        '교수님 메모에 세 가지가 있었죠.',
        '바람은 눈에 안 보여요. 아까 유리에 했던 것처럼. 매트는 테이프 보고 여덟 칸.',
        '문틀 아래 왼쪽 틈에 신문, 다이얼 여덟 칸 더, 그리고 불 끄기.',
      ],
    },
  },
  events: [
    { on: { solved: 'P1' }, run: ['bloom:icon', 'thermo:run'] },
    { on: { solved: 'P2' }, run: ['timer:pause-180000', 'heater:on'] },
    { on: { solved: 'P3' }, run: ['banner:nursery'] },
    { on: { solved: 'P6' }, run: ['crayon:letters'] },
    { on: { solved: 'P7' }, run: ['banner:found', 'frost:recede'] },
    { on: { solved: 'P8' }, run: ['bloom:full', 'bed:cut'] },
    { on: { stalledMin: 3 }, run: ['hint:blink'] },
  ],
  endings: [
    { id: 'A', title: '봄이네', condition: 'finale' },
    { id: 'B', title: '씨앗은 얼지 않는다', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
