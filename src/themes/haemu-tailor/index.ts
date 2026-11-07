import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type TailorExtra } from './extra';

/** Illustrated play. Answers live in puzzles/answers.ts. Sew motion stays out of extra. */
export const themeHaemuTailor: ThemeDefinition<TailorExtra> = {
  id: 'haemu-tailor',
  world: 'haemu',
  title: '한 땀',
  lengthMin: 30,
  gate: { label: '가게 문 열기', needs: [] },
  timer: {
    skin: 'thread-spool',
    durationMs: 30 * 60_000,
    startClock: '21:00',
    onZero: [{ if: { solved: 'P5' }, ending: 'B2' }, { ending: 'B1' }],
  },
  hud: {
    inventoryName: '반짇고리',
    hintChannel: 'thimble',
    notebook: true,
    collapsibleIn: ['sewing-straight', 'sewing-curve'],
  },
  smallTalk: {
    thimble: [
      '54년 했다. 이 자리에서. 바늘은 몇 개 부러뜨렸나 몰라.',
      '옷은 주인 몸 닮아 가. 안 찾아가면 그 모양 그대로 기다리고.',
      '라디오 광고비, 26년 치 다 합치면 이 가게 하나 더 차렸겠다.',
      '마지막 방송엔 우리 광고 안 나갔대. 누가 뺐나 봐. 섭섭하게.',
      '내일부턴 나도 손님 해야지. 남의 옷 말고 내 옷 고쳐 입고.',
      '실 아껴 써. 마지막 실이야.',
    ],
  },
  scenes: [
    { id: 'shop', background: '#1a1814' },
    { id: 'door', background: '#161410' },
    { id: 'ledger', background: '#1c1a16' },
    { id: 'warehouse', background: '#141614' },
    { id: 'shelf', background: '#121614' },
    { id: 'bench', background: '#1a1812' },
    { id: 'sewing-straight', background: '#221e16' },
    { id: 'sewing-curve', background: '#221e16' },
  ],
  puzzles: [
    { id: 'P1', scene: 'door', widget: 'NumberDial' },
    { id: 'P2', scene: 'warehouse', widget: 'FindTap' },
    { id: 'P3', scene: 'sewing-straight', widget: 'SewingMachine' },
    { id: 'P4', scene: 'shelf', widget: 'DragSnap' },
    { id: 'P5', scene: 'bench', widget: 'SeamRip' },
    { id: 'P6', scene: 'bench', widget: 'DragSnap' },
    { id: 'P7', scene: 'bench', widget: 'SequenceTap' },
    { id: 'P8', scene: 'sewing-curve', widget: 'SewingMachine' },
  ],
  hints: {
    P1: {
      intro: '손님 받는 중이니까 짧게 물어.',
      steps: [
        '줄자에 단추 꽂아 놨잖아. 그게 번호야.',
        '큰 단추부터 차례로, 꽂힌 눈금.',
        '0731. …네 번호표랑 같지? 우연이야.',
      ],
    },
    P2: {
      intro: '내 장부는 나만 읽는다고들 해.',
      steps: [
        '영감님 제복이 파랑 점 둘이랬지? 창고 가서 어디 걸렸나 봐.',
        '리본 색이 선반, 점이 단. 위에서부터 세.',
        '남색 선반 위에서 셋째. 철망은 열쇠 있어야 돼.',
      ],
    },
    P3: {
      intro: '재봉틀 무서워하지 마. 물진 않아.',
      steps: [
        '발은 꾹, 손은 살살. 둘 다 같이 해야 돼.',
        '선이 바늘 밑으로 지나가게 천을 옆으로 밀어. 발만 밟으면 실 뭉친다.',
        '왼쪽 엄지 누르고 있고, 오른쪽 엄지로 선 따라가. 끝까지.',
      ],
    },
    P4: {
      intro: '번호 다 바랬지? 내 눈엔 원래 안 보여.',
      steps: [
        '번호표는 반으로 찢어 주는 거야. 반쪽끼리 맞대 봐.',
        '찢긴 모양만 보지 말고, 물결 테두리랑 도장까지.',
        '도장이 동그랗게 되는 거. 그게 네 거야.',
      ],
    },
    P5: {
      intro: '…찾았구나. 천천히 봐.',
      steps: [
        '주머니 다 뒤져 봐. 하나는 내가 막아 놨어.',
        '안감 주머니. 빨간 실은 실뜯개로 땀 따라 뜯어.',
        '실뜯개를 안감 주머니에 대고, 빨간 땀 일곱 개.',
      ],
    },
    P6: {
      intro: '필통 열어 봤어? 네가 넣어 둔 거 있을 거다.',
      steps: [
        '단추 자리에 내가 크기랑 구멍 표시해 놨어.',
        '게이지에 대 봐. 22, 구멍 두 개.',
        '초록 바다유리. 갈색은 작아.',
      ],
    },
    P7: {
      intro: '바늘귀는 내가 못 꿰어. 미안하다.',
      steps: [
        '실 끝 잘라야 들어가. 보풀 있으면 안 돼.',
        '카드대로. 위로, 아래로 네 번. 그다음 기둥 감고 매듭.',
        '구멍1 위로, 구멍2 아래로, 네 번. 세 바퀴 감고 꾹 눌러 매듭.',
      ],
    },
    P8: {
      intro: '마지막이다. 불 나가기 전에.',
      steps: [
        '둥근 선이야. 밀기만 하면 안 돼.',
        '천을 돌려 가면서 밀어. 발은 천천히.',
        '페달 살살, 오른손으로 천 돌리면서 선 따라 끝까지.',
      ],
    },
  },
  events: [
    { on: { timerLeftMin: 30 }, run: ['pa:demolition-1'] },
    { on: { timerLeftMin: 27 }, run: ['counter:mangnae'] },
    { on: { timerLeftMin: 18 }, run: ['counter:cat'] },
    { on: { timerLeftMin: 10 }, run: ['counter:kim', 'spool:red-core'] },
    { on: { timerLeftMin: 5 }, run: ['pa:demolition-2'] },
    { on: { timerLeftMin: 1 }, run: ['fx:fluorescent-flicker'] },
    { on: { solved: 'P2' }, run: ['counter:jin-arrives', 'boss:call-player'] },
    { on: { solved: 'P5' }, run: ['fx:flashback-1999', 'boss:mom-line'] },
    { on: { stalledMin: 4 }, run: ['hint:blink'] },
  ],
  endings: [
    { id: 'A', title: '찾아가신 옷', condition: 'solved:P8' },
    { id: 'B1', title: '아직 기다리는 옷', condition: 'timer-zero' },
    { id: 'B2', title: '단추 하나 없는 코트', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
