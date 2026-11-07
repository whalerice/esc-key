import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type AshExtra } from './extra';

/** Desk through an ending. Answers live in puzzles/answers.ts. */
export const themeAshDawn: ThemeDefinition<AshExtra> = {
  id: 'ashen-dawn',
  world: 'standalone',
  title: '잿빛 새벽',
  lengthMin: 60,
  gate: { label: '이어폰을 끼고 시작', needs: [] },
  timer: {
    skin: 'wallclock',
    durationMs: 60 * 60_000,
    startClock: '03:00',
    onZero: 'C',
  },
  hud: {
    inventoryName: '소지품 서랍',
    hintChannel: 'guard-phone',
    notebook: true,
  },
  smallTalk: {
    'guard-phone': [
      '자네, 체스 둘 줄 아나. 모르면 배우게. 밤이 길어.',
      '렌츠 양반은 늘 검은 말을 잡았어. 먼저 두는 게 싫다고.',
      '나는 이 건물 경비를 서른 해 했어. 누가 무슨 일을 하는지는 몰라도, 누가 무슨 얼굴로 나가는지는 알지.',
      '무전실 아가씨는 매일 세 시 전에 커피를 새로 타더군. 오늘도. 그러고 나면 꼭 어디론가 사라져.',
      '렌츠 양반이 남긴 수, 이제 자네가 두는 거야.',
      '천천히 두게. 시계는 내가 보고 있어.',
    ],
  },
  scenes: [
    { id: 'desk', background: '#121418' },
    { id: 'radio', background: '#121418' },
    { id: 'archive', background: '#121418' },
    { id: 'office', background: '#121418' },
    { id: 'teletype', background: '#121418' },
  ],
  puzzles: [
    { id: 'P1', scene: 'desk', widget: 'NumberDial' },
    { id: 'P2', scene: 'desk', widget: 'RotaryDial' },
    { id: 'P3', scene: 'desk', widget: 'DragSnap' },
    { id: 'P4', scene: 'radio', widget: 'TuningKnob' },
    { id: 'P5', scene: 'desk', widget: 'DragSnap' },
    { id: 'P6', scene: 'desk', widget: 'FindTap' },
    { id: 'P7', scene: 'radio', widget: 'morse-buttons' },
    { id: 'P8', scene: 'office', widget: 'SafeDial' },
    { id: 'P9', scene: 'teletype', widget: 'Keypad' },
  ],
  hints: {
    P1: {
      intro: '정전이구먼. 체스는 눈 감고도 두는 거야.',
      steps: [
        '렌츠 양반은 메모를 꼭 시계 옆에 붙였어.',
        '멈춘 시계를 보게. 짧은 바늘이 먼저야.',
        '926. 아홉 시 이십육 분.',
      ],
    },
    P2: {
      intro: '경비실은 아직 이 번호가 아니야.',
      steps: [
        '전화번호부를 보게. 요제프만 번호가 없다.',
        '늘 하던 방식대로. 이름 글자를 다이얼 숫자로.',
        'JOSEF. 56733.',
      ],
    },
    P3: {
      intro: '렌츠 양반은 종이도 판 위에서 읽었지.',
      steps: [
        '64글자에 64칸이면, 답은 뻔하지 않나.',
        '그 전문, 체스판에 깔아 보게. 한 칸에 한 글자.',
        '마지막 수대로 검은 룩을 f줄로 내리게. 지나간 칸이 답이야. GLASHAUS.',
      ],
    },
    P4: {
      intro: '그 양반, 라디오를 끼고 살았어.',
      steps: [
        '사진 뒤에 적힌 그대로.',
        '7.11. 날짜 말고 주파수로. 뒤집지 말고.',
        '7.11 메가헤르츠. 숫자 두 묶음을 적게. 40271, 16947.',
      ],
    },
    P5: {
      intro: '성냥갑에 성냥이 없으면, 그건 성냥갑이 아니지.',
      steps: [
        '방송이 페이지를 불러 줬을 거야.',
        '14쪽에 그 투명한 필름을 겹치게. 홈이 맞는 쪽으로. 그리고 빼게, 받아내림 없이.',
        '03 08 05 19 19. CHESS.',
      ],
    },
    P6: {
      intro: '체스라. 렌츠 양반은 판보다 상자를 아꼈어.',
      steps: [
        '말 말고, 상자 바닥.',
        '필름이 거꾸로야. 한 번 뒤집으면 다 읽혀.',
        "보관소 V-17. 그리고 나한테 '검은 비숍'이라고 하게.",
      ],
    },
    P7: {
      intro: '그 아가씨, 뜨개질은 참 부지런히 했지.',
      steps: [
        '서류 여백에 범례가 있었을 거야.',
        '한 코는 점, 세 코는 선. 안뜨기 줄에서 글자를 끊게.',
        'VOGEL3. 전신기에 넣어 보게.',
      ],
    },
    P8: {
      intro: '금고는 귀로 여는 거야. 렌츠 양반이 그랬어.',
      steps: [
        '두 숫자는 사진에 있었지. 마지막은 들어야 해.',
        "오른쪽으로 돌리다 '쿵' 하는 데. 바늘도 같이 튀어.",
        'R32, L15, R27.',
      ],
    },
    P9: {
      intro: '렌츠 양반이 딸 얘기를 한 건 딱 한 번이야. 자장가를 부른다더군.',
      steps: [
        '오르골은 노래를 다 못 불러. 허밍이랑 비교해 보게.',
        '다른 음만 옮기게. 옮긴 핀 아래 숫자가 나와. 채널은 그 양반 채널.',
        '6172. 코드는 52086172. GLASHAUS ABBRUCH, VOGEL3, 채널 D.',
      ],
    },
  },
  events: [
    { on: { solved: 'P3' }, run: ['phone:greta'] },
    { on: { solved: 'P7' }, run: ['phone:silent'] },
    { on: { solved: 'P8' }, run: ['air:lenz'] },
    { on: { stalledMin: 5 }, run: ['phone:patrol'] },
  ],
  endings: [
    { id: 'A', title: '새벽은 오지 않았다', condition: 'flags.endingA' },
    { id: 'B', title: '가로챈 새벽', condition: 'flags.endingB' },
    { id: 'C', title: '04:00', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
