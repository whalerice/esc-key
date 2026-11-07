# 붉은 방 에셋 크레딧

그림은 1994년 11월 명화사진관 톤(암실 `#1A0505`, 안전등 `#C23A3A`, 종이 `#E8D4C8`, 파란 연필 `#2846A0`, 청록 목도리 `#2AA8A0`, 나무 `#4A3024`, 금속 `#8A7564`, 매장 `#241C18`)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

색만으로 나누지 않는다. 네거 함정은 청록 + 모양(우체통 · 소화전 · 대야). 여자는 청록 고리 목도리. 안전등 숨김 잉크는 종이 `#E8D4C8`과 붉은 채널을 맞춘다(설계 9-2, ±4). 파란 글씨 413 · 0741은 붉은 채널 80 이하.

가족사진(P6 4번)은 아버지·어머니·다섯 살, 출입문 안쪽의 목도리. 단풍놀이 배경에 최 시계방 간판. 수리 카메라 아이콘은 명화사진관 작업대 쪽.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/darkroom.svg` | 암실. 확대기, 트레이, 약품장, 빨랫줄, 수칙 종이 | 원작. ESC KEY |
| `rooms/darkroom-safe.svg` | 안전등. 종이 위 413 | 원작 |
| `rooms/shop.svg` | 매장. 셔터, 최 시계방, 찾아가지 않은 사진 서랍 | 원작 |
| `rooms/shop-safe.svg` | 매장 안전등. 접수증 0741 | 원작 |
| `rooms/ending-a.svg` | 엔딩 A. 내려간 셔터, 정착액, 찾아감 | 원작 |
| `props/*.svg` | 소품·단서. 수칙, 접수증, 네거 함정 모양, 빨랫줄 여섯 장, 골목 컷 | 원작 |

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

째깍·골목 바람·엎어둔 발소리는 Howler 루프다. `src/themes/neulbom-darkroom/audio.ts`에만 둔다. `Flow.tsx`는 검사 때문에 howler라는 단어를 넣지 않는다. 최 영감 전화·엔딩 A는 HTML5 `playHtml5Clip`. 효과음은 Howler. 발소리는 배경 루프이고 덕킹하지 않는다.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/tick.wav` | 짧은 틱 루프 | 기계식 타이머 째깍 |
| `audio/wind.wav` | 낮은 두 사인 루프 | 골목 바람 |
| `audio/steps.wav` | 낮은 두 번 루프 | 엎어둔 동안 발소리. `steps-near.wav` |
| `audio/phone.wav` | 두 음 톤 | 최 영감 전화. `choi-p7.wav` |
| `audio/ending.wav` | 세 음 톤 | 엔딩 A 「정착」. `ending-a.wav` |
| `audio/sfx-safelight.wav` | 낮은 웅 | 안전등 |
| `audio/sfx-crank.wav` | 짧은 틱 | 크랭크 |
| `audio/sfx-burn.wav` | 내려가는 잡음 | 필름·인화지 탐 |
| `audio/sfx-tangle.wav` | 불협 | 필름 엉킴 |
| `audio/sfx-lock.wav` | 짧은 금속 | 약품장 |
| `audio/sfx-door.wav` | 낮은 삐걱 | 암실 문 |
| `audio/sfx-shutter.wav` | 짧은 찰칵 | 셔터 |
| `audio/sfx-splash.wav` | 짧은 물 | 현상·정착 |
| `audio/water.wav` | 짧은 찰랑 | 탱크 흔들기 |
| `audio/sfx-drag.wav` | 낮은 긁힘 | 문 쪽 끌리는 소리 |
| `audio/sfx-tick.wav` | 짧은 틱 | 10분·5분 째깍 |

아직 없는 파일. 녹음이 오면 이 이름으로 넣으면 된다.

- 엔딩 B 백열등 이후: `ending-b.wav`
- 엔딩 B 3컷 새말선 첫차(아주 작게): `first-bus.wav`
- 오프닝 셔터 덜컹: `shutter-rattle.wav`
- 힌트 전화는 글만이다. 목소리 파일 없음.
