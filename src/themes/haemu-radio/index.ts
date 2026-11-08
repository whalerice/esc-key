import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type RadioExtra } from './extra';

/** Illustrated play. Answers live in puzzles/answers.ts. Frequencies are not in extra. */
export const themeHaemuRadio: ThemeDefinition<RadioExtra> = {
  id: 'haemu-radio',
  world: 'haemu',
  title: '심야 라디오',
  lengthMin: 30,
  gate: { label: '부조정실 문 열기', needs: [] },
  timer: {
    skin: 'onair-clock',
    durationMs: 30 * 60_000,
    startClock: '02:00',
    onZero: 'B',
  },
  hud: { inventoryName: '가방', hintChannel: 'messenger', notebook: true },
  hintChannels: [{ skin: 'walkie', fromPuzzle: 'P7' }],
  smallTalk: {
    messenger: [
      '나 원래 아침 팀 출근이라 지금 자야 되는데, 이건 들어야지.',
      '도윤 선배님 손편지 고집, 처음엔 진짜 이해 안 갔어요. 지금은 좀 알 것 같아요.',
      '목요일 2번 자리, 나도 3년 동안 비웠어요. 끝내 이유는 못 들었네.',
      '후배님 다음 주부터 심야죠? 안개 낀 날엔 옥상 문 꼭 받쳐 놔요.',
      '듣고 있어요. 천천히 해요.',
    ],
    walkie: [
      '옥상 문, 내가 고쳐 달라고 3년째 말했어요.',
      '20년 했는데 마지막 날 갇힐 줄은 몰랐네.',
      '작가님 첫날을 이렇게 만들어서 미안해요. …근데 잘하네.',
      '마지막 곡은 작가님 손으로 올려요.',
    ],
  },
  radioBed: {
    // No bed at 02:00 — enter boom (opening.wav ~220Hz loop) was too loud on control entry.
    // Silence until fog-stop; later cues stay.
    cues: [
      { at: '02:03', soundId: 'fog-stop' },
      { at: '02:07', soundId: '3am-coffee' },
      { at: '02:14', soundId: 'far-sea' },
      { at: '02:18', soundId: 'wind' },
      { at: '02:25', soundId: 'breakwater' },
    ],
  },
  scenes: [
    { id: 'control', background: '#12191F' },
    { id: 'booth', background: '#101418' },
    { id: 'desk', background: '#16120e' },
    { id: 'archive', background: '#12100e' },
    { id: 'roof', background: '#0e1418' },
  ],
  puzzles: [
    { id: 'P1', scene: 'control', widget: 'Keypad' },
    { id: 'P2', scene: 'booth', widget: 'TuningKnob' },
    { id: 'P3', scene: 'booth', widget: 'DragSnap' },
    { id: 'P4', scene: 'desk', widget: 'DragSnap' },
    { id: 'P5', scene: 'booth', widget: 'TuningKnob' },
    { id: 'P6', scene: 'archive', widget: 'LongPress' },
    { id: 'P7', scene: 'control', widget: 'LongPress' },
    { id: 'P8', scene: 'roof', widget: 'TuningKnob' },
  ],
  hints: {
    P1: {
      intro: '채: 후배님, 벌써 출근했어요? 나 집에서 마지막 방송 듣는 중~',
      steps: [
        '이 방에 등대가 하나만 있을까요?',
        '창밖 불빛 순서대로, 큐시트 그림 곡의 분 끝자리.',
        '4538. 배, 빨간 등대, 부표, 갈매기.',
      ],
    },
    P2: {
      intro: '채: 부스 들어갔어요? 에어체크부터!',
      steps: [
        '그 라디오 숫자 창은 고장이에요. 믿지 마요.',
        '스피커랑 라디오가 똑같아질 때까지. 소리 없으면 바늘.',
        '87.9. 바늘이 제일 높은 데서 1초.',
      ],
    },
    P3: {
      intro: '채: 무음 3초 경보, 나도 첫날 울렸어요.',
      steps: [
        '매뉴얼 「내가 자리 비울 때」. 호출부호·날씨·광고 금지부터. 목표는 곡까지 2분 30초(150초).',
        '맨 앞·맨 끝 지키면 가운데 100초. 80초짜리 + 20초짜리.',
        '호출부호, 녹음 코너, 해무수산, 날씨. 딱 2분 30초.',
      ],
    },
    P4: {
      intro: '채: 원고 준비하는구나. 메모 두 번째 장 봤어요?',
      steps: [
        '다 우리 프로그램 앞으로 온 건 아니에요. 받는 곳.',
        '소인 번진 건 포스터랑. 같은 필명 두 통.',
        '1번 수산시장 막내, 2번 비우고, 3번 고양이 10/21, 4번 등대지기 영감.',
      ],
    },
    P5: {
      intro: '채: 라디오가 또 지직거려요? 어젯밤 선배님이 뭘 하셨더라…',
      steps: [
        '라디오 뒷면을 봐요.',
        '87.9 근처 네 군데. 수능까지 며칠인지.',
        'D-100, D-50, D-30, D-7 순서로 끝자리. 5326.',
      ],
    },
    P6: {
      intro: '채: 아카이브실, 라벨이 번졌을 텐데.',
      steps: [
        '상자는 목요일마다 하나. 1027 다음은?',
        '빈 상자 쪽지를 봐요.',
        '예비 데크 2번을 멈추고 412까지 되감아 재생.',
      ],
    },
    P7: {
      intro: '도윤: 무전기 들고 있어요. 나 여기 꽤 춥다.',
      steps: [
        '끊긴 말을 이어 봐요. 내가 앉는 곳, 아침에 마시는 것.',
        '내 자리 커피잔 밑. 태그 그림.',
        '큰 등대 열쇠. 빨간 등대 말고.',
      ],
    },
    P8: {
      intro: '도윤: 급하다. 그래도 천천히.',
      steps: [
        '휴대 라디오는 건들지 마요. 송신기를 돌려요.',
        '내 목소리가 맑아질 때까지. 소리 없으면 램프.',
        '램프 초록으로 2초. 편지는 2번 칸, 페이더 끝까지.',
      ],
    },
  },
  events: [
    { on: { timerLeftMin: 27 }, run: ['bgm:fog-stop'] },
    { on: { timerLeftMin: 23 }, run: ['bgm:3am-coffee'] },
    { on: { timerLeftMin: 16 }, run: ['bgm:far-sea'] },
    { on: { timerLeftMin: 12 }, run: ['bgm:wind'] },
    { on: { timerLeftMin: 5 }, run: ['bgm:breakwater'] },
    { on: { solved: 'P6' }, run: ['radio:first-call', 'hint:channel=walkie'] },
    { on: { stalledMin: 4 }, run: ['hint:blink'] },
  ],
  endings: [
    { id: 'A', title: '제 자리', condition: 'solved:P8' },
    { id: 'B', title: '송출 종료', condition: 'timer-zero' },
  ],
  assets: [],
  extra: { initial: initialExtra },
};
