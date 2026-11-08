# 잿빛 새벽 에셋 크레딧

그림은 1983년 11월 서베를린 지하 신호분석국 톤(밤 `#121418`, 콘크리트 `#2A3138`, 나무 `#4A3B2E`, 종이 `#E4D7C3`, 도장 `#9B2C2C`, 형광 `#9BB892`, 놋쇠 `#C6A15B`, 눈 `#D5DDE4`)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다. 인물 얼굴은 그리지 않는다. 검문소는 뒷모습만.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/gate.svg` | 지하 계단, 철문, 명판, 헤드폰 | 원작. ESC KEY |
| `rooms/desk-dark.svg` | 정전된 분석실. 책상 여섯, 불은 꺼짐 | 원작 |
| `rooms/desk.svg` | 예비 전원 이후. 시계 9:26, 체스판, 다이얼, 오르골, 긴급 전문 | 원작 |
| `rooms/radio.svg` | 단파 수신기 세 대, 목도리, 김 나는 머그 | 원작 |
| `rooms/archive.svg` | 서랍 열. V-17만 열려 있다 | 원작 |
| `rooms/office.svg` | 표창, 금고, 빨간 전화 | 원작 |
| `rooms/teletype.svg` | 전신기, 채널 램프, 송신 레버 | 원작 |
| `rooms/ending.svg` | 눈 오는 국경. 키 큰 사람과 아이의 뒷모습 | 원작 |
| `rooms/ending-b.svg` | 비운 책상, 행방 불명 서류 | 원작 |
| `props/*.svg` | 소품. 포스트잇, 탁상시계, 벽시계, 서랍, 리나 사진(뒷통수), 전화번호부, 필름, 성냥갑, 전문, 룩, 다이얼, 수신기, 목도리, 머그, 마이크로필름, 열쇠, 금고, 오르골, 헤드폰, 검문소 뒷모습, 인사기록, 전신 | 원작 |

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

지하 험은 Howler 루프다. 전화가 나오면 험과 단파 잡음을 40% 낮춘다. `src/themes/ashen-dawn/audio.ts`에만 둔다. `Flow.tsx`는 검사 때문에 howler라는 단어를 넣지 않는다. 단서·방송·대사는 HTML5 `playHtml5Clip`. 효과음은 Howler. 단파 잡음만 Web Audio 노이즈 베드다. 주파수 파일 크로스페이드는 없다.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/room.wav` | 낮은 험 루프 | 지하 실내. `room-hum.wav` |
| `audio/lock.wav` | 짧은 틱 | 자물쇠 딸깍. `lock-click.wav` |
| `audio/thump.wav` | 낮은 한 음 | 금고 쿵. `safe-thump.wav` |
| `audio/dial.wav` | 틱 두 번 | 다이얼. `dial-tick.wav` |
| `audio/paper.wav` | 짧은 잡음 | 종이. `paper-rustle.wav` |
| `audio/drawer.wav` | 낮은 잡음 | 서랍. `drawer-wood.wav` |
| `audio/chess.wav` | 낮은 한 음 | 체스 말. `chess-tap.wav` |
| `audio/key.wav` | 낮은 잡음 | 문 밑 열쇠. `key-slide.wav` |
| `audio/teletype.wav` | 틱 여섯 | 텔레타이프. `teletype-clack.wav` |
| `audio/chime.wav` | 두 음 | 괘종 한 번. 세 번·네 번은 아래 빠진 파일 |
| `audio/tube.wav` | 낮은 버즈 | 형광등. `fluorescent-buzz.wav` |
| `audio/train.wav` | 낮은 잡음 | 머리 위 열차. `train-pass.wav` |
| `audio/busy.wav` | 같은 음 두 번 | 없는 번호. `busy-tone.wav` |
| `audio/station.wav` | 다섯 음 | 7.11 넘버 스테이션. `number-station-7-11.wav` |
| `audio/box.wav` | 도레미파솔솔솔 톤 | 오르골 첫 줄. `musicbox-line.wav` |
| `audio/hum.wav` | 라레도파시솔레 톤 | 렌츠 허밍. `lenz-hum.wav` |
| `audio/danke.wav` | 다섯 음 | 리나 "D-A-N-K-E". `lina-danke.wav` |
| `audio/lenz.wav` | 네 음 | 렌츠 방송. `lenz-broadcast.wav` |
| `audio/greta.wav` | 두 음 | 그레타 전화. `greta-phone.wav` |
| `audio/josef.wav` | 낮은 두 음 | 요제프. `josef-phone.wav` |
| `audio/chief.wav` | 낮은 한 음 | 분소장. `chief-phone.wav` |
| `audio/hans.wav` | 짧은 음 | 야간 교환. `hans-phone.wav` |
| `audio/otto.wav` | 짧은 음 | 교환원. `otto-phone.wav` |
| `audio/breath.wav` | 아주 작은 잡음 | 무언의 전화. `silent-breath.wav` |

아직 없는 파일. 녹음이 오면 이 이름으로 넣으면 된다.

- 오프닝 내레이션: `narration-open.wav` (지금은 자막)
- 03:00 괘종 세 번: `clock-0300.wav` (`chime.wav`가 한 번만 대신함)
- 경계 해제 괘종 한 번의 실제 종: `clock-release.wav`
- 04:00 괘종 네 번: `clock-0400.wav`
- 15분마다 괘종: `chime-quarter.wav`
- 엔딩 B 먼 사이렌: `siren-far.wav`
- 엔딩 C 사이렌: `siren-close.wav`
- 그레타 엔딩 B 따로: `greta-stole.wav` (지금은 `greta.wav` 한 파일)
- 요제프 힌트 낭독: `josef-hint-1.wav` `josef-hint-2.wav` `josef-hint-3.wav` (엔진 힌트는 글만)
- 오르골 태엽 기계음: `musicbox-wind.wav` (멜로디 톤과 분리)
