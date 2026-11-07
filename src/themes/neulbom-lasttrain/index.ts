import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type LasttrainExtra } from './extra';

/** Scene art. Answers live in puzzles/answers.ts. Drafts and the viewfinder stay off extra. */
export const themeLasttrain: ThemeDefinition<LasttrainExtra> = {
  id: 'neulbom-lasttrain',
  world: 'neulbom',
  title: '막차 이후',
  lengthMin: 30,
  gate: { label: '센터 불 켜기', needs: [] },
  timer: { skin: 'battery', durationMs: 30 * 60_000, onZero: 'B' },
  hud: {
    inventoryName: '서랍',
    hintChannel: 'extension',
    notebook: true,
  },
  smallTalk: {
    extension: [
      '나는 역무실에 있다. 거기 춥지 않냐.',
      '오늘 그 전동차 마지막 날이다. 나도 그 차 처음 들어올 때 여기 있었다.',
      '해마다 이날은 서랍이 덜컥거린다. 처음엔 쥐인 줄 알았지.',
      '…너 그날 장갑 한 짝은 끼고 갔냐.',
      '천천히 해라. 막차는 이미 들어왔다.',
    ],
  },
  scenes: [
    { id: 'counter', background: '#12141a' },
    { id: 'warehouse', background: '#1a1814' },
  ],
  puzzles: [
    { id: 'P1', scene: 'counter', widget: 'DragSnap' },
    { id: 'P2', scene: 'counter', widget: 'Keypad' },
    { id: 'P3', scene: 'counter', widget: 'Keypad' },
    { id: 'P4', scene: 'counter', widget: 'Viewfinder' },
    { id: 'P5', scene: 'warehouse', widget: 'FindTap' },
    { id: 'P6', scene: 'counter', widget: 'DragSnap' },
    { id: 'P7', scene: 'counter', widget: 'Keypad' },
    { id: 'P8', scene: 'counter', widget: 'Keypad' },
  ],
  hints: {
    P1: {
      intro: '또 왔냐. …아니, 왔냐.',
      steps: ['폰이 꺼졌으면 밥부터 먹여야지.', '단자 모양 봐라. 그 시절 폰은 다 넓적했다.', 'B. 20핀짜리.'],
    },
    P2: {
      intro: '남의 폰 함부로 여는 거 아니다. …너는 괜찮다.',
      steps: ['비밀번호는 보통 제일 소중한 날로 한다.', '뒤에 붙은 스티커 사진. 둘이 편 손가락을 세 봐라.', '1225.'],
    },
    P3: {
      intro: '그 시절 애들은 문자를 숫자로 보냈지. 둘만 아는 말로.',
      steps: [
        '숫자가 한글이다. 서랍에 카드 있을 거다.',
        '천지인. 8은 ㅅ, 2는 점, 1은 세로 획. 하나씩 맞춰 봐라.',
        '선물 눈사람.',
      ],
    },
    P4: {
      intro: '그 폰 카메라는 이상한 걸 찍는다. 나도 안다.',
      steps: ['카메라를 켜고 센터를 비춰 봐라. 그날 장부가 책상에 있다.', '장부에서 막차 7칸 습득물.', '쇼핑백. 상자 24.'],
    },
    P5: {
      intro: '그 상자, 열일곱 해 동안 몇 번 옮겼다.',
      steps: ['번호 말고 생김새를 봐라.', '파란 테이프 X자, 찌그러진 모서리.', '맨 아랫줄 왼쪽 끝.'],
    },
    P6: {
      intro: '…이제 쇼핑백 열어 봐도 된다.',
      steps: ['영수증이 반쪽이다. 나머지는 어디 있겠냐. 손 시렸을 텐데.', '장갑 안에 반쪽. 맞추면 시각이 나온다.', '2247. 사진첩 비밀 폴더.'],
    },
    P7: {
      intro: '그날 넌 졸고 있었지.',
      steps: ['폰에 알람 맞춰 놨을 거다.', '알람 시각이랑 그해 막차 시각표를 맞춰 봐.', '은곡.'],
    },
    P8: {
      intro: '누나가 기다린다.',
      steps: [
        '누나가 뭘 물었는지 다시 읽어 봐라. 어디서 내렸냐가 아니다.',
        '어디 가던 길이었냐. 그리고, 너희 방식으로.',
        '새말역. 숫자 모드로. 812100125502214.',
      ],
    },
  },
  events: [
    { on: { solved: 'P1' }, run: ['phone:boot', 'hud:battery'] },
    { on: { solved: 'P2' }, run: ['sms:three'] },
    { on: { solved: 'P3' }, run: ['call:out-of-service'] },
    { on: { solved: 'P6' }, run: ['call:kwak'] },
    { on: { solved: 'P7' }, run: ['sms:2026'] },
    { on: { stalledMin: 3 }, run: ['hint:blink'] },
    { on: { timerLeftMin: 3 }, run: ['fx:dim'] },
    { on: { timerLeftMin: 2 }, run: ['fx:dim-blink'] },
  ],
  endings: [
    { id: 'A', title: '받았어', condition: 'finale' },
    { id: 'B', title: '다음 해', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
