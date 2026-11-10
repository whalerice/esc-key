# 심야 라디오 에셋 크레딧

해무 스타일 가이드(안개, 밤바다, 종이, 놋쇠, 방송 빨강)에 맞춘 그림.

`tools/asset-collector` 규칙:

- Unsplash API 파일은 저장소에 커밋하지 않는다.
- Pngtree, Flaticon은 페이지를 긁지 않는다.

## 그림

| 파일 | 내용 | 출처 | 비고 |
|---|---|---|---|
| `rooms/control.png` | 부조정실 풀블리드 페인티드 BG (1920×1080) | 원작 일러스트 | R-BG-02. 밤·책상램프·ON AIR·창밖 등대. 오른쪽 문 유리 너머 녹음 부스(콘솔·마이크·빈 의자). 정리된 방송실 |
| `rooms/booth.png` | 부스 풀블리드 페인티드 BG (1920×1080) | 원작 일러스트 | R-BG-03. 콘솔·마이크·탁상 라디오·카트리지 랙·빈 DJ 의자. 오른쪽 문 유리 너머 아카이브(금속 선반·테이프 상자). 정리된 심야 부스 |
| `rooms/desk.png` | 작가석 풀블리드 페인티드 BG (1920×1080) | 원작 일러스트 | R-BG-05. 원고 보드 4칸·사연함·책상램프·코르크보드. 정리된 방송 작가석 |
| `rooms/archive.png` | 아카이브실 풀블리드 페인티드 BG (1920×1080) | 원작 일러스트 | R-BG-06. 테이프 선반·데크·무전기·따뜻한 펜던트 램프. 정리된 아카이브 |
| `rooms/roof.png` | 옥상 풀블리드 페인티드 BG (1920×1080) | 원작 일러스트 | R-BG-08. 안개·송신기·빨간 경고등·문 빛 Spill. 정리된 옥상 TX |
| `props/*.svg` | 소품·단서 아이콘 (L2 손때) | 원작 SVG | 부조정실·부스·작가석·아카이브·옥상 핫스팟 아이콘 |

### clue-locked

생성물로 바꾸지 말 것. 검수 필수.

| 파일 | 마크 |
|---|---|
| `props/cuesheet.svg` | 빨간 등대 낙서 = 굵은 선 + 이중 동그라미 |
| `props/radio.svg` | 숫자창 끝자리 깨진 `9` |
| `props/key-red.svg` | 이중원 + 빨간 등대 실루엣 |
| `props/key-boat\|buoy\|gull\|big.svg` | 서로 다른 태그 실루엣 |

## 소리

성우 녹음과 작곡 의뢰 음원은 없다. 아래 WAV는 프로젝트 원작 **합성**(22.05 kHz mono PCM). 라이선스 팩 스크랩 없음. 흐름용으로 쓸 만하게 다듬었지만, 작곡·VO 교체 전 자리표시로 본다. 재생성: `python3 tools/haemu-radio-synth-audio.py`.

단서(옛 방송·티즈)는 HTML5 `playHtml5Clip`. 곡 베드와 효과음은 Howler(RadioBed / 짧은 Howl). iOS 무음 스위치용으로 단서를 Web Audio에 넣지 않는다. 사람 말소리·합성 음성 없음 — 대사는 자막만.

| 파일 | 지금 | 나중에 바꿀 것 |
|---|---|---|
| `audio/opening.wav` | 합성 루프(저음 허밍). **RadioBed 큐 없음**(입장 붐 방지) | R-MU 오프닝 시그널. H-MU-01 짧은 버전 |
| `audio/fog-stop.wav` | 안개 패드 + 히스 루프 | R-MU-01 「안개 정류장」 |
| `audio/3am-coffee.wav` | 따뜻한 미드 드론 루프 | R-MU-02 「새벽 세 시의 커피」 |
| `audio/far-sea.wav` | 저음 스웰 + 필터 서프 | R-MU-03 「먼 바다」 |
| `audio/wind.wav` | 하이패스 바람 노이즈 | R-MU-04 「바람이 지나간 자리」 |
| `audio/breakwater.wav` | 저펄스 + 그릿 루프 | R-MU-05 「방파제」 |
| `audio/tease.wav` | AM 필터 두 음(C→G). 말 없음 | P2 티즈. 도윤 방송 한 토막 |
| `audio/d100.wav` `d50.wav` `d30.wav` `d7.wav` | AM 필터 두 음(구간별 음정). 말 없음 | P5 옛 방송 VO (D-100, D-50, D-30, D-7) |
| `audio/sfx-beep.wav` | 소프트 880 Hz 사인(짧은 ADSR) | 부스 비프·에어체크 |
| `audio/sfx-cart.wav` | 카트리지 클릭+바디 | 카트리지 실녹음 |
| `audio/sfx-lock.wav` | 자물쇠 틱+메탈 | 자물쇠 실녹음 |
| `audio/sfx-tape.wav` | 데크 훨+클랙 | 테이프 데크 실녹음 |
