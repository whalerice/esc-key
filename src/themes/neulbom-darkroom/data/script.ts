/** Lines the gray box speaks. Full VO: docs/시리즈/늘봄/02_붉은방_대본_v1.md */

import { dialogue, narration, type CaptionLine } from '@/engine/ui/caption';

export const script = {
  'open.date': '1994년 11월 28일 새벽 4시 50분. 도래동.',
  'open.closed': '셔터에 임시 휴업. 맞은편 최 시계방도 불이 꺼져 있다. 선생님이 안 나오신 지 사흘째다.',
  'open.door': '경찰은 어른이 사흘쯤 안 보이는 건 일도 아니라고 했다.',
  'open.ledger':
    '11.6 경로당 단풍놀이 단체. 11.16 윤석주 — 가족사진 4×6 2매. 11.25 증명사진 1. 선생님 글씨는 날이 갈수록 작아졌다.',
  'open.sign': '현상 중 — 열지 마시오. 선생님은 이 팻말을 걸어 둔 채 사라졌다.',
  'open.note': '카메라에 쪽지. 현상하지 마. 작업대 구석, 렌즈 덮개마다 명화사진관 수리.',
  'open.timer': '벽의 타이머가 30분에 맞춰져 돈다. 누가 감아 놓은 거지.',
  'open.go': '현상하지 말라는 건, 현상할 게 있다는 뜻이다.',
  'safe.on': '안전등. 빨간 불 아래서는 빨간 낙서가 종이에 묻힌다.',
  'safe.dark': '아무것도 안 보인다.',
  'p1.scribble': '빨간 낙서. 선생님이 직접 그은 거다.',
  'p1.rules': '필름과 컬러 인화지는 안전등에도 탄다. 안전등은 흑백 인화와 서류 볼 때만. 413.',
  'p1.no': '아니다.',
  'p1.solved': '약품장이 열린다. 흑백 키트, 컬러 키트, 탱크와 릴, 선생님 노트.',
  'p2.crank': '먼저 필름을 감아 넣어야 한다.',
  'p2.full': '끝까지 감겼다. 한 롤을 다 썼다.',
  'p2.rule': '수칙 두 번째. 필름은 안전등에도 탄다.',
  'p2.burn': '…탔다. 앞부분만. 다행이다.',
  'p2.dark': '선생님이 붙여 둔 점. 바깥에서 안쪽으로.',
  'p2.tangle': '엉켰다. 다시.',
  'p2.solved': '됐다. 이제 불을 켜도 된다.',
  'p2.sound': '…아까 그 소리. 문밖이었다. 쥐다. 구시장 골목에는 쥐가 많다.',
  'p3.label': '필름 통. COLOR 100.',
  'p3.note': '흑백은 20도 언저리면 된다. 컬러는 까다롭다. 38도, 1도도 틀리면 안 된다. 3분 15초.',
  'p3.bw': '필름 통을 다시 보자.',
  'p3.clear': '…아무것도 없다. 약이 틀렸다.',
  'p3.cold': '물이 미지근했다.',
  'p3.hot': '너무 뜨거웠다.',
  'p3.again': '다시. 노트대로.',
  'p3.shake': '선생님은 이걸 30초마다 흔들었다. 아기 재우듯이.',
  'p3.solved': '나왔다. 선생님이 현상하지 말라고 한 거.',
  'p4.look': '번호가 없다. 줄도 섞여 있다. 네가는 색이 거꾸로다. 빨간 건 청록.',
  'p4.person': '……사람이다. 목도리를 했다.',
  'p4.again': '또 있다. 같은 사람이다.',
  'p4.solved': '여섯 장. 줄마다 한 명씩. A5, B2, C6, D3, E1, F4.',
  'p5.strip': '시험 띠. 회색이 끊기지 않는 첫 칸. 10초는 아직 흐리다. 20초는 그림자가 뭉개진다.',
  'p5.burn': '수칙 두 번째. 컬러 인화지도 탄다.',
  'p5.thin': '너무 흐리다.',
  'p5.dark': '너무 어둡다. 얼굴이 안 보인다.',
  'p5.dunk': '빛이 들면 사진을 망친다. 화면을 아래로 엎어 두세요.',
  'p5.light': '빛이 들어갔다.',
  'p5.early': '아직이다.',
  'p5.solved': '여섯 장이 떠올랐다. 발소리는 그쳤다.',
  'p6.look': '날짜가 안 찍혔다. 사진 속에서 찾아야 한다.',
  'p6.solved': '다가오고 있었다. 골목 끝, 맞은편, 쇼윈도, 사진관 안, 카운터, 암실 문.',
  'p6.door': '문손잡이가 한 번 덜컥. …무섭다.',
  'p7.slip': '접수증을 내밀고 있다. 번호가 빨간 볼펜에 묻혔다.',
  'p7.num': '0741. 수칙 세 번째. 서류 볼 때만.',
  'p7.door': '수칙 첫 번째. 현상 중에는 문을 열지 말 것. …지금은 현상 중이 아니다.',
  'p7.other': '모르는 집 사진이다.',
  'p7.solved': '1974. 11. 김정희. 같은 머플러, 같은 얼굴. 접수일과 부고가 같다.',
  'p7.call': '최 시계방. …정희 씨를 봤구먼. 상만이가 그 봉투만은 못 열었지.',
  'p7.wait': '선생님은 무서워서 셔터를 누른 게 아니었다. 기다린 거다.',
  'p8.note': '어두운 얼굴은 손으로 가려 빛을 덜 줘라. 이번엔 같이 찍혀야겠다.',
  'p8.one': '한 사람만 보인다. 둘 다.',
  'p8.together': '같이 찍혔다. 선생님이 사흘 전에 이걸 찍고, 사라졌다.',
  'p8.choice': '사진은 정착액에 넣기 전까지는 아직 사진이 아니다. 빛 한 번이면 지워진다.',
  'p8.hand': '사진을 집어 대야로.',
  'end.a1': '이제 이 사진은 빛을 받아도 지워지지 않는다.',
  'end.a2': '그날 아침. 셔터는 올라가지 않았다. 봉투 0741에 찾아감.',
  'end.a3': '…상만이, 같이 갔구먼. 명화사진관은 그해 겨울 문을 닫았다.',
  'end.b1': '백열등. 정희가 먼저, 도상만이 나중에 지워진다.',
  'end.b2': '왜 이렇게 일찍 왔냐. 목에 붉은 머플러. 선생님은 평생 목도리를 하지 않았다.',
  'end.b3': '이제 네가 찍어라. 손님 없을 땐 골목이라도.',
  'end.b4': '골목 끝 구석에 아주 작게, 붉은 머플러를 한 여자.',
  'end.b5': '그날부터 사진관의 셔터는 내가 눌렀다.',
  'end.c1': '타이머 종이 울린다. 안전등이 깜빡이고 꺼진다.',
  'end.c2': '그 뒤로 아무도 도상만을 보지 못했다.',
  'tick.10': '째깍 소리가 커진다. 안전등이 미세하게 떨린다.',
  'tick.5': '남은 시간이 얼마 없다. 안전등이 또 떨린다.',
  'hand.ok': '손으로 하면 되지.',
} as const;

export type ScriptKey = keyof typeof script;

export function line(key: ScriptKey): string {
  return script[key];
}

const SPEAKER: Partial<Record<ScriptKey, string>> = {
  'p7.call': '최 영감',
  'end.a3': '최 영감',
  'end.b3': '선생님',
};

export function spoken(key: ScriptKey): CaptionLine {
  const speaker = SPEAKER[key];
  return speaker !== undefined ? dialogue(script[key], speaker) : narration(script[key]);
}

export const openingLines: CaptionLine[] = [
  narration(script['open.date']),
  narration(script['open.closed']),
  narration(script['open.door']),
  narration(script['open.ledger']),
  narration(script['open.sign']),
  narration(script['open.note']),
  narration(script['open.timer']),
  narration(script['open.go']),
];

export const NOTEBOOK_PAGES = `명화사진관. 1972.
간판 글씨 — 정희.

흑백은 20도 언저리면 된다.
컬러는 까다롭다. 38도, 1도도 틀리면 안 된다. 3분 15초.
30초마다 흔든다. 세게 말고.`;
