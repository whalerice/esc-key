# 겨울 온실 에셋 크레딧

그림은 밤 유리온실 톤(밤유리 `#163038`, 성에 `#D7E4EC`, 철골 `#7E949C`, 흙 `#5C4636`, 잎 `#3F7A4A`, 매트 `#C4622E`, 비상 노랑 `#F0C14A`, 종이 `#F4E7C8`, 크레용)에 맞춘 **원작 SVG**다. 상용 스톡 일러스트를 복사하지 않았다. 사실 렌더를 넣지 않았다.

`tools/asset-collector` 규칙 때문에 아래는 게임 파일로 넣지 않았다.

- Unsplash API로 받은 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 재배포 조건이 불명확해서 페이지를 긁지 않는다.

색만으로 나누지 않는다. 콘센트는 회색 사각형+X 「고장」 / 노란 원+삼각 「비상」. 밸브는 육각·마름모·원·둥근 사각형과 숫자(1.6 · 2.1 · 0.8 · 1.2). 화면 순서는 초록·빨강·파랑·노랑. 화분은 잎·씨 모양으로 구분한다.

## 그림

| 파일 | 내용 | 라이선스 |
|---|---|---|
| `rooms/foyer.svg` | 전실. 월하미인 봉오리, 매트, 콘센트 셋, 새말선 안내 | 원작. ESC KEY |
| `rooms/foyer-night.svg` | P8. 반개, 문틀 아래 왼쪽 틈 | 원작 |
| `rooms/foyer-bloom.svg` | 만개. 불 끈 뒤의 흰 꽃 | 원작 |
| `rooms/boiler.svg` | 비상 온풍기. 게이지 넷, 공구함, 온수, 흙 자국 | 원작 |
| `rooms/hall.svg` | 난초 유리장, 논문, 가족사진, 화분 나눔 포스터 | 원작 |
| `rooms/glass.svg` | 뿌연 유리 「닦지 마시오」, 4칸 자물쇠 | 원작 |
| `rooms/nursery.svg` | 넘어진 상자 「하윤」, 화분, 12달 선반, 안경 | 원작 |
| `rooms/ward.svg` | 엔딩 A. 새벽 병실, 이름표 여덟 | 원작 |
| `props/*.svg` | 소품·단서. 잎 모양, 씨, 입김 자국, 크레용 일곱 글자, 가족사진 앞·뒤 | 원작 |

가족사진은 아버지·어머니·다섯 살만 가까이 그린다. 출입문과 붉은 여자는 없다.

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 흐름이 끊기지 않게 넣어 둔 **자리표시**다. 프로젝트 원작(합성). 그대로 출시하지 말 것.

바람·보일러·온풍기는 Howler 루프다. `src/themes/neulbom-greenhouse/audio.ts`에만 둔다. `Flow.tsx`는 검사 때문에 howler라는 단어를 넣지 않는다. 아버지 음성·남 씨 무전·회상·엔딩은 HTML5 `playHtml5Clip`. 효과음은 Howler. 입김 잡음은 기존 `BreathDetector` 그대로다.

P6를 푸는 순간(P7 일지)부터 루프를 끈다. P8 만개도 루프 없이 효과음만 난다.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/wind.wav` | 낮은 두 사인 루프 | 밤 유리 바람 |
| `audio/boiler.wav` | 낮은 험 루프 | 보일러실 |
| `audio/heater.wav` | 따뜻한 험 루프 | 온풍기·매트 |
| `audio/dad.wav` | 두 음 톤 | 아버지 음성 메시지. `dad-1` |
| `audio/guard.wav` | 두 음 톤 | 남기철 무전. `guard-p2` `guard-p3` `guard-p7` |
| `audio/recall.wav` | 높은 두 음 | P6 회상. `recall-1` |
| `audio/ending.wav` | 세 음 톤 | 엔딩 「봄이네」. `ending-a` |
| `audio/sfx-valve-fail.wav` | 내려가는 틱 | 퓨슉, 밸브 잠김 |
| `audio/sfx-heater-on.wav` | 올라가는 틱 | 온풍기 점화 |
| `audio/sfx-lock.wav` | 짧은 금속 | 유리장·육묘실 문 |
| `audio/sfx-page.wav` | 짧은 종이 | 일지 넘김 |
| `audio/sfx-bloom.wav` | 세 음 | 만개 |
| `audio/sfx-crayons.wav` | 짧은 플럭 | 크레용 글자 |

아직 없는 파일. 녹음이 오면 이 이름으로 넣으면 된다.

- 힌트 무전 단계마다의 목소리: `guard-hint-1.wav` … `guard-hint-3.wav` (엔진 힌트 배너는 글만)
- 엔딩 B 남 씨·아버지: `ending-b.wav`
- 환경음 층: `am-frost.wav`
