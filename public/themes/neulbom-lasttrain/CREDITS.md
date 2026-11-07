# 막차 이후 에셋 크레딧

그림은 2009년 12월 24일 밤과 2026년의 같은 밤, 새말역 분실물 센터 톤(밤 `#12141A`, 형광등 `#E7F6EA`, 남색 코트 `#1E3A78`, 종이 `#F3E6C8`, 상자 `#C4A07A`, 파란 테이프 `#2A6EBE`, 나무 `#6B5344`, 눈 `#E7EEF6`)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

색만으로 나누지 않는다. 충전기 A는 타원+둥근 핀, B는 넓은 20핀, C는 금속 사다리꼴+굵은 다리 둘. 상자는 테이프 모양(X · 十 · 한 줄 · 갈색 두 줄)과 오른쪽 위 찌그러진 모서리. 정답 상자는 X와 찌그러짐이 같이 있다. 창구 유리 반사에는 센터만 있고 사람은 없다. 엔딩 A 창구 쪽도 비어 있다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/counter.svg` | 2026 창구. 형광등, 반납함, 퇴역 안내, 온실 안내 | 원작. ESC KEY |
| `rooms/counter-2009.svg` | 뷰파인더. 시각표, 대장, 빈 유리 | 원작 |
| `rooms/warehouse.svg` | 바랜 창고 선반 | 원작 |
| `rooms/warehouse-2009.svg` | 2009 배치. 셋째 줄 둘째, 파란 X, 모서리 | 원작 |
| `rooms/ending-a.svg` | 엔딩 A. 00:00, 12월 25일, 스노글로브, 빈 창구 | 원작 |
| `props/*.svg` | 소품·단서. 충전기 모양, 상자 모양, 스티커 손가락, 영수증 반쪽, 셀카 | 원작 |

가족·셀카는 납작한 도형이다. 사진으로 찍은 얼굴을 넣지 않았다.

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

형광등·선로는 Howler 루프다. 반전(P6) 이후 같은 루프를 한 단계 낮춘다. `src/themes/neulbom-lasttrain/audio.ts`에만 둔다. `Flow.tsx`는 검사 때문에 howler라는 단어를 넣지 않는다. 서비스 지역·곽 반장·엔딩 A는 HTML5 `playHtml5Clip`. 효과음은 Howler. 소리 단서는 없다. 자막은 그대로다.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/fluorescent.wav` | 낮은 험 루프 | 형광등 웅. `fluorescent-hum.wav` |
| `audio/rail.wav` | 낮은 두 번 루프 | 멀리 선로. `distant-rail.wav` |
| `audio/announce.wav` | 두 음 차임 | 오프닝 역 안내. `station-pa.wav` |
| `audio/boot.wav` | 올라가는 틱 | 폴더폰 부팅 |
| `audio/shutter.wav` | 짧은 잡음 | 셔터 |
| `audio/sms.wav` | 짧은 두 음 | 문자 |
| `audio/hangup.wav` | 내려가는 음 | 끊긴 통화 효과 |
| `audio/poweroff.wav` | 내려가는 세 음 | 폰 꺼짐 |
| `audio/station.wav` | 낮은 두 번 | 셀카를 닫은 뒤 역. `station-night.wav` |
| `audio/out.wav` | 두 음 톤 | 누나 전화 「서비스 지역이 아닙니다」. `sister-out.wav` |
| `audio/kwak.wav` | 낮은 두 음 | 곽 반장 「올해도 왔구나」. `kwak-p6.wav` |
| `audio/ending.wav` | 세 음 톤 | 엔딩 A 「받았어」. `ending-a.wav` |

아직 없는 파일. 녹음이 오면 이 이름으로 넣으면 된다.

- 기관사 오프닝: `driver.wav` (지금은 자막)
- 누나 2026 문자: `sister-2026.wav` (글만)
- 힌트 내선: `kwak-hint-1.wav` `kwak-hint-2.wav` `kwak-hint-3.wav` (엔진 힌트는 글만)
- 엔딩 B: `ending-b.wav`
