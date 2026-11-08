/** Lines from docs/시리즈/늘봄/04_미니어처_대본_v1.md. Gray-box subset. */

import { narration, type CaptionLine } from '@/engine/ui/caption';

export const script = {
  'narration.opening.1': '비가 그치지 않는 저녁이었다.',
  'narration.opening.2': '작가님은 보이지 않았다. 작업대 위에, 내가 자란 집이 있었다.',
  'narration.guide.zoom': '두 손가락으로 벌려 확대해 보세요.',
  'narration.guide.onehand': '두 번 톡톡 누르거나 + 버튼으로 확대해 보세요.',
  'inspect.house.locked': '지붕이 잠겨 있다. 자물쇠에 숫자 네 칸.',
  'inspect.desk': '붓, 핀셋, 손톱만 한 접시들. 한쪽에 작은 줄자가 있다.',
  'acquire.tape': '줄자를 부품함에 넣었다.',
  'inspect.wall': '편지 묶음이 핀으로 꽂혀 있다. 맨 위 한 통만 빼낼 수 있다.',
  'letter.1':
    '작가님께. 집을 하나 주문하고 싶습니다. 제가 살던 집이 아니라, 우리 아이가 자란 집이요. 언젠가 그 애가 같은 집을 주문하러 오면, 이걸 먼저 보여 주셨으면 해요.',
  'narration.letter.1': '이 글씨를 안다. 장보기 목록에서, 도시락 쪽지에서, 수없이 본 글씨다.',
  'inspect.mailbox.far': '손톱보다 작은 봉투. 글씨가 너무 작다.',
  'inspect.mailbox.near': '손톱보다 작은 봉투. 늘봄시 해송동 1124번지.',
  'acquire.envelope': '봉투를 부품함에 넣었다.',
  'narration.p1.solved': '딸깍. 지붕이 열렸다. 익숙한 냄새가 날 것 같았다.',
  'inspect.frame': '볼펜 줄이 여러 개. 옆에 나이만 적혀 있다. 6살. 8살. 10살. 12살.',
  'inspect.lock': '자물쇠에 작게 새겨져 있다. 자란 만큼.',
  'tape.far': '눈금이 안 보인다. 더 가까이에서 대 보자.',
  'tape.miss': '문틀이 아니다.',
  'tape.ok': '엄마는 매년 생일마다 여기 나를 세웠다. 발뒤꿈치 들지 말라고, 그렇게 웃었다.',
  'letter.2': '문틀의 키 자국은 꼭 그대로 새겨 주세요. 이사 오는 사람이 칠해 버리기 전에요. 부엌 달력도 부탁드려요. 그 애는 기억 못 하는 날들이에요.',
  'calendar.far': '동그라미만 보인다.',
  'narration.p3': '하나도 기억나지 않는다. 엄마는 전부 기억하고 있었다.',
  'letter.3': '그 애는 제 옷장 겨울 코트 뒤에 괴물이 산다고 한참을 무서워했어요. 그래서 제일 소중한 건 거기 숨겼답니다. 아무도 안 열어 보니까요.',
  'inspect.fridge': '글자 자석이 어지럽게 붙어 있다. 노선도 모양 자석도 하나 있다.',
  'magnet.far': '자석 글자만 보인다. 점은 안 보인다.',
  'p4.wrong': '자석이 우르르 제자리로 돌아갔다.',
  'inspect.route': '새말선 개통 기념 자석. 1988. 반곡역 옆에 볼펜으로 작은 하트가 그려져 있다.',
  'narration.p4': '거실 쪽에서 똑딱, 소리가 났다.',
  'inspect.clock': '바늘이 멈춰 있다. 숫자 세 칸 자물쇠가 붙어 있다.',
  'inspect.clock.shop': '문자판 아래 작은 글씨. 최 시계방 · 도래동. 고장 날 때마다 엄마는 이걸 안고 버스를 탔다.',
  'inspect.clock.far': '문자판 아래는 흐리다.',
  'inspect.pot': '하트 모양 잎, 은빛 잎맥. 시클라멘이다. 이름표: 한결대 식물원 가을 나눔. 엄마는 해마다 이맘때 줄을 서서 화분을 받아 왔다.',
  'acquire.photo2': '거실 액자에서 사진을 꺼냈다.',
  'narration.p5': '시계가 다시 가기 시작했다. 2층으로 올라가는 계단에 불이 켜졌다.',
  'inspect.bed': '이불이 반듯하다. 내가 한 번도 이렇게 개 본 적 없는데.',
  'bed.far': '틈이 깜깜하다. 더 가까이 봐야 할 것 같다.',
  'acquire.note': '다락 열쇠는 네가 제일 무서워하던 곳에.',
  'note.back': '이제는 안 무섭지?',
  'acquire.photo3': '책상 위 사진. 중학교 졸업 날.',
  'inspect.vanity': '빗, 로션, 머리끈. 엄마 자리 그대로다.',
  'inspect.wardrobe': '코트가 세 벌. 어느 코트 뒤였을까.',
  'coat.far': '코트 세 벌이 비슷한 색 덩어리다.',
  'coat.wrong': '여기는 아니다. 그때도 이 코트는 무섭지 않았다.',
  'coat.ok': '털 칼라 코트 뒤, 작은 열쇠 하나. 괴물은 없었다.',
  'narration.attic': '다락은 내가 올라가 본 적 없는 곳이었다. 엄마가 위험하다고 했으니까.',
  'inspect.box': '글자가 새겨진 다이얼 세 칸. 뚜껑에 작은 칸이 여덟 개 비쳐 보인다.',
  'drawing.far': '크레파스로 그린 집. 지붕은 빨갛고 창문은 삐뚤다. 아래에 큰 글씨로 뭔가 적혀 있다.',
  'narration.x12': '이제 이 집이 원래 크기가 됐다.',
  'drawing.near': '삐뚤빼뚤한 글씨가 이제야 읽힌다. 우리집.',
  'drawing.back': '우리 애기 여섯 살 때. 엄마한테 처음 준 선물.',
  'inspect.attic.box': '다락 상자에 글자 세 칸 다이얼이 있다.',
  'narration.p8.solved': '상자 안에는 내가 버린 줄 알았던 것들이 있었다. 전부 1/12 크기로.',
  'narration.dolls': '그리고 인형 두 개. 부엌에 선 엄마. 다락 아래서 올려다보는 어린 나.',
  'memo.author': '어머님이 인형을 하나 더 주문하셨는데, 그건 비워 두라고 하셨어요. 지금의 당신이 직접 놓으시라고요.',
  'guide.stand': '빈 받침대를 눌러 보세요.',
  'narration.doll': '집 앞에 지금의 내가 섰다. 창문마다 하나씩 불이 켜졌다.',
  'narration.home': '다녀왔어요.',
  'letter.hidden':
    '다 찾았구나. 너는 어릴 때도 작은 걸 참 잘 찾았어. 엄마가 잃어버린 귀걸이 한 짝도, 소파 밑 동전도. 이 집에 있던 건 다 너야. 엄마는 그냥 잠깐 맡아 둔 거고. 이제 다 돌려줄게. 작가님한테 인형 하나는 얼굴을 비워 달라고 했어. 엄마는 지금의 네 얼굴을 모르잖아. 그건 네가 채워. 잘 컸다, 우리 애기.',
  'system.wrong': '아닌 것 같다.',
} as const;

export type ScriptKey = keyof typeof script;

export function line(key: ScriptKey): string {
  return script[key];
}

export function spoken(key: ScriptKey): CaptionLine {
  return narration(script[key]);
}

export const openingLines: CaptionLine[] = [
  narration(script['narration.opening.1']),
  narration(script['narration.opening.2']),
  narration(script['narration.guide.onehand']),
];
