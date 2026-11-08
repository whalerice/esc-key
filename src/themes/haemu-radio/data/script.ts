/** Lines that move the night forward. Full VO stays in the script doc. */

import { dialogue, narration, type CaptionLine } from '@/engine/ui/caption';

export const script = {
  'open.date': '2026년 11월 12일 목요일. 새벽 1시 55분. 해무.',
  'open.job': '첫 출근이 마지막 방송 날이다. 오늘은 보고 배우라고 하셨다.',
  'open.air': '방송 시작했는데. DJ가 없다.',
  'p1.memo': '채 선배 글씨. 그림 그려진 곡의 분 끝자리. 순서는 등대가 알려준다.',
  'p1.sheet': '큐시트 낙서. 부표 02:03, 배 02:14, 갈매기 02:18, 빨간 등대 02:25.',
  'p1.window': '큰 등대 불빛이 훑는다. 배, 빨간 등대, 부표, 갈매기.',
  'p1.envelope': '갈곶리 우체국. 속은 비어 있다. 편지는 선배가 갖고 가셨나.',
  'p1.coffee': '도윤 선배 커피. 식었다.',
  'p1.postit': '포스트잇. 그 등대 말고. 저 멀리.',
  'p1.no': '아니다.',
  'p1.solved': '문이 열렸다. 빈 DJ 의자. 진짜 아무도 없다.',
  'p2.guide': '숫자 창은 끝자리만 나온다. 노브를 돌려 우리 방송에 맞춘다.',
  'p2.tease': '…목요일 사연, 필명 팔칠구 님… 방금 뭐였지.',
  'p2.solved': '나가고 있다. 우리 방송. 곡까지 2분 30초. 그 사이를 누가 채우지.',
  'p2.fixed': '탁상 라디오는 87.9에 고정돼 있다.',
  'p3.manual': '호출부호가 맨 앞. 바로 뒤에 광고 금지. 곡 직전은 날씨. 1초도 비우거나 넘기지 말 것. 합계 2분 30초.',
  'p3.rule': '매뉴얼이랑 다르다.',
  'p3.short': '비었다! 채 선배: 방금 무음 났어요!!',
  'p3.long': '곡이랑 겹쳤어. 넘쳤다.',
  'p3.solved': '살았다. 채 선배: 마지막 코너 원고를 미리 준비해 둬요. 사연 고르는 건 작가 일이에요.',
  'p3.alarm': '무음 경보. 채 선배: 방금 무음 났어요!!',
  'p4.rules': '오래된 소인부터. 같은 사람 한 번. 다른 프로그램은 아침 팀. 목요일 2번은 비운다.',
  'p4.slot2': '여긴 비워 두는 자리다.',
  'p4.morning': '이건 아침 팀 서랍에 넣어야 한다.',
  'p4.same': '같은 사람이다.',
  'p4.no': '메모랑 다르다.',
  'p4.solved': '장부가 2011년에서 멈춘다. 팔칠구. 매주 목요일 둘째 사연. 마지막 줄, 테이프 1103, 카운터 412. 아까 그 목소리.',
  'p5.memo': '어젯밤 시험 송출 네 군데. 비번 = 팔칠구가 지나간 순서.',
  'p5.first': '도윤 선배 목소리다. 지금보다 젊다.',
  'p5.all': '전부 같은 해, 같은 사람. 수능까지 남은 날 순서로.',
  'p5.order': '주파수 순서가 아니다. 메모의 순서가 진해진다.',
  'p5.no': '안 열린다.',
  'p5.solved': '자물쇠가 풀렸다. 아카이브실. 뭔가 돌고 있다. 라디오는 87.9로 돌아온다.',
  'p5.locked': '아카이브실 문은 잠겨 있다.',
  'p6.trap': '1110. 수능 날 특집. 팔칠구는 없다.',
  'p6.no': '목요일 칸이 아니다.',
  'p6.note': '1103은 비어 있다. 쪽지: 시험 송출용으로 빼 감. 예비 데크 2번.',
  'p6.stop': '데크 2가 멈춘다. 카운터 873. 87.6에서 나오던 게 이 테이프였다.',
  'p6.miss': '여기가 아니다.',
  'p6.play': '붙으면 마지막 편지. 떨어지면 1년 더 듣겠다고. 그리고 15년.',
  'p6.call1': '도윤: 아까부터 계속 불렀는데, 드디어 받네.',
  'p6.call2': '도윤: 시험 송출 꺼진 거 보니까 아카이브실이죠. 작가님 맞죠?',
  'p6.call3': '도윤: 나 옥상에 갇혔어요.',
  'p6.alive': '살아 계셨다. 아니, 당연히 살아 계시지.',
  'p7.1': '도윤: 열쇠는… 내 자리… 밑에…',
  'p7.2': '도윤: 매일 아침 마시는 거… 식었겠네…',
  'p7.3': '도윤: 꾸러미에서… 불빛 쏘는 쪽… 작은 거 말고…',
  'p7.short': '더 길게 눌러야 한다.',
  'p7.keys': '커피잔 밑. 열쇠 꾸러미. 배, 부표, 갈매기, 빨간 등대, 큰 등대.',
  'p7.door': '옥상 문은 잠겨 있다. 바람 소리.',
  'p7.need': '가방의 열쇠 꾸러미를 자물쇠에 쓴다.',
  'p7.wrongItem': '이건 이 자물쇠에 안 맞는다.',
  'p7.red': '도윤: 그거 방파제 창고 열쇠예요. 그 등대 말고.',
  'p7.red.note': '포스트잇 글씨도 선배였다.',
  'p7.miss': '안 들어간다.',
  'p7.solved': '옥상. 도윤이 손을 흔든다. 주파수가 밀렸다. 휴대 라디오는 건들지 말 것. 송신기를 맞춰 달라고 하고 내려간다. 혼자 남았다.',
  'p8.guide': '휴대 라디오는 87.9 고정. 돌릴 건 송신기다.',
  'p8.other': '다른 방송이다. 너무 갔다.',
  'p8.locked': '송신기 램프가 초록이다. 도윤: 됐다. 이제 내려와요. 마지막은 작가 몫이에요.',
  'p8.letter': '도윤이 편지를 내민다. 그 봉투에 있던 것. 2번에 꽂아 달라고 한다.',
  'p8.placed': '테이프가 떨어진다. 15년 만에 2번 칸.',
  'p8.fader': '도윤이 고개를 끄덕인다. 마지막 곡 페이더.',
  'p8.ending': '제 자리. 시그널이 흐르고 창밖 큰 등대가 한 번 바다를 훑는다. 도윤은 새 문자를 열지 않고 조명을 끈다.',
  'need.booth': '부스는 잠겨 있다.',
  'need.desk': '원고는 방송이 이어진 뒤에.',
} as const;

export type ScriptKey = keyof typeof script;

export function line(key: ScriptKey): string {
  return script[key];
}

const SPEAKER: Partial<Record<ScriptKey, string>> = {
  'p2.tease': '방송',
  'p3.short': '채 선배',
  'p3.solved': '채 선배',
  'p3.alarm': '채 선배',
  'p6.call1': '도윤',
  'p6.call2': '도윤',
  'p6.call3': '도윤',
  'p7.1': '도윤',
  'p7.2': '도윤',
  'p7.3': '도윤',
};

export function spoken(key: ScriptKey): CaptionLine {
  const speaker = SPEAKER[key];
  return speaker !== undefined ? dialogue(script[key], speaker) : narration(script[key]);
}

export const openingLines: CaptionLine[] = [
  narration(script['open.date']),
  narration(script['open.job']),
  narration(script['open.air']),
];

export const P6_CALL = [script['p6.call1'], script['p6.call2'], script['p6.call3']];

export const P7_CALLS = [script['p7.1'], script['p7.2'], script['p7.3']] as const;
