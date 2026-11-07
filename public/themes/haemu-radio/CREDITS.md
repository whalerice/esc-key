# 심야 라디오 에셋 크레딧

그림은 해무 스타일 가이드(안개, 밤바다, 종이, 놋쇠, 방송 빨강)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.
- 스타일 가이드는 사실적 렌더를 쓰지 않는다. 사진 배경 대신 평면 채색으로 맞췄다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/control.svg` | 부조정실. 창밖 배·빨간 등대(굵은 선+이중 동그라미)·부표·갈매기·큰 등대 | 원작. ESC KEY |
| `rooms/booth.svg` | 부스. 빈 의자, 콘솔, 탁상 라디오 | 원작 |
| `rooms/desk.svg` | 작가석. 원고 보드, 사연, 10/18 포스터 | 원작 |
| `rooms/archive.svg` | 아카이브실. 테이프 선반, 데크 | 원작 |
| `rooms/roof.svg` | 옥상. 안개, 송신탑 경고등, 도윤 | 원작 |
| `props/*.svg` | 소품·단서 아이콘, 큐시트, 열쇠 태그, 착석 도윤 | 원작 |

큐시트 빨간 등대 낙서와 빨간 등대 열쇠는 색과 함께 굵은 선, 이중 동그라미로 구분한다.

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

단서(옛 방송·티즈)는 HTML5 `playHtml5Clip`. 곡 베드와 효과음은 Howler(RadioBed / 짧은 Howl). iOS 무음 스위치용으로 단서를 Web Audio에 넣지 않는다.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/opening.wav` | 합성 루프 | R-MU 오프닝 시그널. H-MU-01 짧은 버전 |
| `audio/fog-stop.wav` | 합성 루프 | R-MU-01 「안개 정류장」 |
| `audio/3am-coffee.wav` | 합성 루프 | R-MU-02 「새벽 세 시의 커피」 |
| `audio/far-sea.wav` | 합성 루프 | R-MU-03 「먼 바다」 |
| `audio/wind.wav` | 합성 루프 | R-MU-04 「바람이 지나간 자리」 |
| `audio/breakwater.wav` | 합성 루프 | R-MU-05 「방파제」 |
| `audio/tease.wav` | 두 음 톤 | P2 티즈. 도윤 방송 한 토막 |
| `audio/d100.wav` `d50.wav` `d30.wav` `d7.wav` | 두 음 톤 | P5 옛 방송 VO (D-100, D-50, D-30, D-7) |
| `audio/sfx-beep.wav` | 짧은 비프 | 부스 비프·에어체크 |
| `audio/sfx-cart.wav` | 짧은 잡음 | 카트리지 꽂기·송출 |
| `audio/sfx-lock.wav` | 낮은 금속음 | 열쇠·자물쇠 |
| `audio/sfx-tape.wav` | 짧은 플러터 | 데크 재생 |

라디오 잡음 베드(약·중·강)는 파일이 아니다. `RadioBed`가 Web Audio로 만든다.
