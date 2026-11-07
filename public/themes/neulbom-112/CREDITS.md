# 1/12 에셋 크레딧

그림은 2026년 늦가을 비 오는 저녁, 해송동 골목 끝 미니어처 공방 톤(밤 `#1A1510`, 나무 `#5C4030` `#6B5344`, 실내등 `#E6C36A`, 종이 `#F3E6C8`, 크레파스 지붕 `#C23B3B`, 남색 코트 `#1E3A78`, 창 `#243044`)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

색만으로 나누지 않는다. 자석은 벽돌·시계·계단·글자 타일·노선도다. 빨간 점 개수는 벽 3, 시 2, 계 1, 나머지는 0. 새말선 자석에는 점이 없고 노선과 하트가 있다. 코트는 멀리서 같은 덩어리, 가까이서 털 칼라·단추·벨트. 시클라멘은 하트 잎과 은색 잎맥. 가족사진은 납작한 도형이고 사진으로 찍은 얼굴은 없다. 인형 얼굴은 비어 있다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/workshop.svg` | 닫힌 집, 지붕 잠김, 우편함, 공방 벽, 줄자, 빗창 | 원작. ESC KEY |
| `rooms/dollhouse.svg` | P1 이후 단면. 1층만 밝고 2층은 어둡다 | 원작 |
| `rooms/dollhouse-up.svg` | P5 이후. 계단 불, 침대, 옷장 | 원작 |
| `rooms/dollhouse-attic.svg` | P7 이후. 다락 그림과 상자 | 원작 |
| `rooms/ending.svg` | 창문 불, 인형 둘, 빈 얼굴 | 원작 |
| `props/*.svg` | 소품·단서. 줄자, 봉투 1124, 키 눈금, 달력 메모, 자석, 시계, 시클라멘, 사진 세 장, 코트, 크레파스 「우리집」, 기억 조각 | 원작 |

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

빗소리는 Howler 루프다. 인형을 놓아 창문에 불이 켜지면 같은 루프를 낮춘다. `src/themes/neulbom-112/audio.ts`에만 둔다. `Flow.tsx`는 검사 때문에 howler라는 단어를 넣지 않는다. 어머니 편지·숨은 편지는 HTML5 `playHtml5Clip`. 효과음은 Howler. 빗소리 파일에 잡음을 구워 두었고 Web Audio 잡음 노드는 없다. 소리는 단서가 아니다.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/rain.wav` | 낮은 잡음 루프 | 창밖 빗소리. `rain-window.wav` |
| `audio/lock.wav` | 짧은 틱 | 자물쇠 딸깍. `lock-click.wav` |
| `audio/dial.wav` | 짧은 틱 | 다이얼. `dial-tick.wav` |
| `audio/drawer.wav` | 짧은 잡음 | 서랍·문. `drawer-wood.wav` |
| `audio/tick.wav` | 낮은 두 음 | 시계 똑딱. `clock-tick.wav` |
| `audio/magnets.wav` | 짧은 잡음 | 자석 우르르. `magnet-clatter.wav` |
| `audio/paper.wav` | 짧은 잡음 | 종이 바스락. `paper-rustle.wav` |
| `audio/spark.wav` | 높은 두 음 | 기억 조각. `sparkle.wav` |
| `audio/wood.wav` | 낮은 한 음 | 받침대 톡. `stand-tap.wav` |
| `audio/mom.wav` | 두 음 톤 | 어머니 편지 1·2·3. `mom-letter.wav` |
| `audio/ending.wav` | 세 음 톤 | 숨은 편지 「잘 컸다, 우리 애기」. `mom-hidden.wav` |

아직 없는 파일. 녹음이 오면 이 이름으로 넣으면 된다.

- 오프닝 내레이션: `narration-open.wav` (지금은 자막)
- 배율 문턱 틱: `lod-tick.wav` (끄기 가능. 지금은 없음)
- 힌트 메모장 낭독: `author-hint-1.wav` `author-hint-2.wav` `author-hint-3.wav` (엔진 힌트는 글만)
