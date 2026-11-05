import type { ThemeDefinition } from '@/engine/types';
import type { Extra112 } from './store';

/** 1/12 vertical slice — docs/늘봄/미니어처_설계.md */
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
    P8: {
      intro: '다락에서 발견한 메모예요.',
      steps: [
        '크레파스 그림 속 글씨를 읽어 보세요.',
        '세 칸 글자 다이얼입니다.',
        '정답은 「우리집」이에요.',
      ],
    },
  },
  events: [
    { on: { solved: 'P1' }, run: ['fx:roof-open'] },
    { on: { solved: 'P8' }, run: ['ending:A'] },
  ],
  endings: [
    { id: 'A', title: '1/12 — CLEAR', condition: 'solved:P8' },
  ],
  assets: [],
  extra: {
    initial: { roofOpen: false, atticReachable: false },
  },
};

export { use112Store, initialSave } from './store';
export { mountWorkshop } from './scenes/workshop';
export { openingLines, script, line } from './data/script';
