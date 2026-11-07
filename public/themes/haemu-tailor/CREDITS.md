# 한 땀 에셋 크레딧

그림은 해무 스타일 가이드(따뜻한 형광 `#EDE6C8`, 코트 남색 `#23305A`, 바다유리 초록 `#6FAE8E`, 커튼 장미 `#B9867E`, 놋쇠)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/shop.svg` | 가게. 간판 「한 땀」, 사장(돋보기·팔토시), 꽃무늬 커튼, 실패 벽, 재봉틀, 손님 뒷모습 | 원작. ESC KEY |
| `rooms/door.svg` | 커튼 뒤 나무 문. 4칸 자물쇠, 줄자 단추 0·7·3·1 | 원작 |
| `rooms/ledger.svg` | 재봉틀 자리. 1999·2023 장부, 서랍의 실뜯개 | 원작 |
| `rooms/warehouse.svg` | 옷 커버. 리본 매듭(나비·한 번·두 번·고리)과 남색 철망 | 원작 |
| `rooms/shelf.svg` | 열린 철망. 1999 커버 | 원작 |
| `rooms/bench.svg` | 남색 코트, 빈 단추 칸 22, 주머니, 게이지, 필통 | 원작 |
| `rooms/sew-straight.svg` | 재봉틀 확대. 직선 천 | 원작 |
| `rooms/sew-curve.svg` | 재봉틀 확대. 안감 곡선 | 원작 |
| `props/*.svg` | 소품·단서. 번호표 반쪽은 찢긴 선·물결·도장 반원 | 원작 |

리본은 색과 함께 매듭 모양으로 구분한다. 번호표 정답 반쪽만 세 가지가 맞물린다.

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

가게 카세트와 엔딩 오르골은 Howler 루프다. 거리 잡음이 없어 `RadioBed`를 쓰지 않는다. 철거 방송과 엄마 전화는 HTML5 `playHtml5Clip`. 효과음은 Howler.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/shop.wav` | 느린 5음 루프 | T-MU-01 오래된 가요 연주 |
| `audio/musicbox.wav` | 높은 플럭 루프 | T-MU-02 시그널 오르골 편곡 |
| `audio/pa.wav` | 두 음 톤 | 철거 반장. `pa-2100` `pa-2125` `pa-b1` |
| `audio/mom.wav` | 두 음 톤 | 엄마 전화 6줄. `mom-1` … `mom-6` |
| `audio/sfx-dial.wav` | 짧은 틱 | 숫자 다이얼 |
| `audio/sfx-lock.wav` | 짧은 금속 | 창고 문 |
| `audio/sfx-page.wav` | 짧은 종이 | 장부 넘김 |
| `audio/sfx-cloth.wav` | 짧은 천 | 커버 |
| `audio/sfx-key.wav` | 짧은 짤랑 | 철망 열쇠 |
| `audio/sfx-rip.wav` | 짧은 틱 | 실뜯개 |
| `audio/sfx-snip.wav` | 짧은 두 틱 | 가위 |
| `audio/sfx-knot.wav` | 짧은 저음 | 매듭 |
| `audio/sfx-sew.wav` | 짧은 저음 | 재봉틀 3단 루프 |
| `audio/sfx-snap.wav` | 짧은 틱 | 마지막 실이 끊김 |
| `audio/sfx-horn.wav` | 낮은 음 두 번 | H-AM-02 무적. 엔딩에서 멀리 |

아직 없는 파일. 녹음이 오면 이 이름으로 넣으면 된다.

- 사장 비언어: `sfx-laugh.wav` `sfx-tsk.wav` `sfx-oh.wav` `sfx-gasp.wav` `sfx-sigh.wav`
- 환경음: `am-corridor.wav` `am-murmur.wav` `am-warehouse.wav`
- 엔딩 줄마다의 목소리는 없다. 자막으로 진행한다. 엄마만 `mom.wav` 한 조각이다.
