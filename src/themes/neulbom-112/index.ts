import type { ThemeDefinition } from '@/engine/types';
import { initialExtra, type Extra112 } from './extra';

/** Gray-box play through the ending. Answers live in puzzles/answers.ts. Zoom and dials are not in extra. */
export const theme112: ThemeDefinition<Extra112> = {
  id: 'neulbom-112',
  world: 'neulbom',
  title: '1/12',
  lengthMin: 30,
  gate: { label: '공방 문 열기', needs: [] },
  timer: { skin: 'none' },
  hud: {
    inventoryName: '부품함',
    hintChannel: 'author-notebook',
    notebook: false,
  },
  scenes: [
    { id: 'workshop', background: '#1a1510' },
    { id: 'dollhouse', background: '#1a1510' },
  ],
  puzzles: [
    { id: 'P1', scene: 'workshop', widget: 'NumberDial' },
    { id: 'P2', scene: 'dollhouse', widget: 'NumberDial' },
    { id: 'P3', scene: 'dollhouse', widget: 'DragSort' },
    { id: 'P4', scene: 'dollhouse', widget: 'SequenceTap' },
    { id: 'P5', scene: 'dollhouse', widget: 'NumberDial' },
    { id: 'P6', scene: 'dollhouse', widget: 'FindTap' },
    { id: 'P7', scene: 'dollhouse', widget: 'FindTap' },
    { id: 'P8', scene: 'dollhouse', widget: 'LetterDial' },
  ],
  hints: {
    P1: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '집으로 가는 편지는 어디로 오나요?',
        '현관 옆 우편함을 확대해 보세요.',
        '봉투 주소의 번지수가 정답이에요. (1124)',
      ],
    },
    P2: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '문틀의 볼펜 자국은 무엇일까요?',
        '줄자를 대고 확대하면 키가 보여요.',
        '어린 나이부터 키의 끝자리를 적어요.',
      ],
    },
    P3: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '날짜보다 메모가 중요해요.',
        '아기가 자라는 순서를 떠올려 보세요.',
        '말 → 걸음 → 혼자 자기 → 학교.',
      ],
    },
    P4: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '자석 중 몇 개만 달라요.',
        '아주 작은 점을 찾아보세요.',
        '점이 큰 것부터 탭하면 집 안의 물건이 돼요.',
      ],
    },
    P5: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '사진 속 배경을 자세히 보세요.',
        '사진마다 벽시계가 찍혀 있어요.',
        '오래된 사진부터 시각을 이어 붙여요.',
      ],
    },
    P6: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '이 방엔 아직 안 본 곳이 있어요.',
        '가구 아래를 끝까지 확대해 보세요.',
        '침대 밑 틈을 최대로 확대해요.',
      ],
    },
    P7: {
      intro: '작가가 남긴 메모예요.',
      steps: [
        '모은 편지를 다시 읽어 보세요.',
        '어머니 옷장 안이에요.',
        '겨울 코트는 칼라에 털이 있어요.',
      ],
    },
    P8: {
      intro: '다락에서 발견한 메모예요.',
      steps: [
        '다락에 걸린 그림은 누가 그렸을까요?',
        '그림 속 집 아래 글씨를 확대해 보세요.',
        '정답은 「우리집」이에요.',
      ],
    },
  },
  events: [
    { on: { solved: 'P1' }, run: ['fx:roof-open'] },
    { on: { solved: 'P4' }, run: ['fx:tick'] },
    { on: { solved: 'P5' }, run: ['fx:stairs'] },
    { on: { solved: 'P7' }, run: ['fx:attic'] },
    { on: { solved: 'P8' }, run: ['fx:box'] },
    { on: { stalledMin: 3 }, run: ['hint:blink'] },
  ],
  endings: [{ id: 'A', title: '1/12 — CLEAR', condition: 'flags.endingA' }],
  assets: [],
  extra: { initial: initialExtra },
};

export { use112Store, initialSave } from './store';
export { mountWorkshop } from './scenes/workshop';
export { openingLines, script, line } from './data/script';
