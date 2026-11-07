# 등대지기 에셋 크레딧

그림은 해무 스타일 가이드(안개, 밤바다, 녹슨 철, 놋쇠, 예비등 호박 `#E09A3E`, 주등 흰빛)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/f1.svg` | 1층 당직실. 창, 벽시계, 탁상 라디오, 감시반, 철문, 빈 옷걸이, 앉은 영감(발목) | 원작. ESC KEY |
| `rooms/panel.svg` | 계단 층참. 배전반 6색, 내려간 레버 3, 전성관 | 원작 |
| `rooms/f2.svg` | 무적실. 압축기, 밸브, 감지기 「안개 없음」 | 원작 |
| `rooms/f3.svg` | 3층 창고 통과 | 원작 |
| `rooms/f4.svg` | 위 당직실. 일지 선반, 띠지, 매뉴얼, 준공 명판, 서랍 | 원작 |
| `rooms/f5.svg` | 5층 기계실 통과 | 원작 |
| `rooms/f6.svg` | 등실. 예비등 호박 | 원작 |
| `rooms/f6-main.svg` | 등실. 주등 흰빛 | 원작 |
| `rooms/rail.svg` | 난간. 안개 바다, 갈매기, 배, 부표, 빨간 등대(굵은 선+이중 동그라미), 물거품 | 원작 |
| `props/*.svg` | 소품·단서. 명판 141, 창 8초, 1996 해도 6초, 띠지 끝 모양(▽ ━ ◠), 층 숫자 | 원작 |

띠지와 레버는 색과 함께 모양·층 숫자로 구분한다. 빨간 등대는 색과 함께 굵은 선, 이중 동그라미다.

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

라디오 베드는 심야 라디오 묶음의 합성 곡을 이 테마에 복사하고, `RadioBed`가 거리 필터와 잡음을 Web Audio로 얹는다. 무전·전성관·도윤 한 줄은 HTML5 `playHtml5Clip`. 기계 효과음은 Howler.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/opening.wav` | 라디오 합성 복사 | H-MU-01 짧은 시그널 |
| `audio/fog-stop.wav` | 라디오 합성 복사 | R-MU-01 「안개 정류장」 |
| `audio/3am-coffee.wav` | 라디오 합성 복사 | R-MU-02 「새벽 세 시의 커피」 |
| `audio/far-sea.wav` | 라디오 합성 복사 | R-MU-03 「먼 바다」 |
| `audio/wind.wav` | 라디오 합성 복사 | R-MU-04 「바람이 지나간 자리」 |
| `audio/breakwater.wav` | 라디오 합성 복사 | R-MU-05 「방파제」 |
| `audio/last-corner.wav` | 합성 루프 | 02:27 마지막 코너. 도윤 사연 |
| `audio/signal.wav` | 합성 루프 | 02:29 〈두 시의 우편함〉 시그널 전곡 |
| `audio/captain.wav` | 두 음 톤 | 진억수·해진 8호 무전 VO |
| `audio/tube.wav` | 두 음 톤 | 영감 전성관 VO |
| `audio/doyun.wav` | 두 음 톤 | 전성관으로 들어오는 도윤 한 줄 |
| `audio/sfx-horn.wav` | 낮은 두 번 + 쉼, 루프 | H-AM-02 무적. 30초마다 2회 |
| `audio/sfx-door.wav` | 짧은 금속 | 철문 |
| `audio/sfx-lever.wav` | 짧은 틱 | 배전반 레버 |
| `audio/sfx-lamp.wav` | 짧은 틱 | 주등 점등 |
| `audio/sfx-page.wav` | 짧은 종이 | 일지 넘김 |
| `audio/sfx-wedge.wav` | 짧은 나무 | 쐐기 |
| `audio/sfx-machine.wav` | 짧은 저음 | 압축기 |

엔딩 대사는 아직 줄마다 파일이 없다. 자막으로 진행한다. 녹음이 오면 `end.cap` `end.corner` `end.letter` `end.off` `end.handover` `end.morning` 이름으로 자르면 된다.
