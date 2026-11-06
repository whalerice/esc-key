---
name: esc-key-puzzle-engine
description: Use when designing or implementing ESC KEY puzzle widgets, ThemeDefinition, inventory, hints, timer, zoom camera, drag-snap, or answer checks. Follow docs/개발/공통엔진_v1.md. PixiJS widgets emit values; puzzle code judges answers; Zustand stores progress.
---

# ESC KEY 퍼즐·위젯

기준: `docs/개발/공통엔진_v1.md` §7–§8, §12–§13.

테마 코드는 위젯을 조립하고 정답만 판정한다. 화면 틀, 저장, 힌트, 타이머를 테마가 다시 구현하지 않는다.

진행은 `solved: Record<PuzzleId, boolean>` + `scene` + `flags`. 별도의 LOCKED/DISCOVERED/ATTEMPTING 상태 머신을 엔진 표준으로 두지 않는다.

## 판정

위젯은 값 변화 이벤트만 낸다. 정답 비교, 오답, 페널티는 퍼즐 코드.
오답 공통: GSAP 흔들림 0.3초 + 효과음. 시간 감소는 테마가 `timer.penalty(ms)`.
정답 문자열을 해시하거나 난독화하지 않는다.

공백·대소문자 정규화가 필요한 키패드만 퍼즐 코드에서 한다. 다이얼·스냅은 눈금·목표 id로 판정한다.

## 제스처 (`engine/input/gestures.ts`)

| 제스처 | 판정 | 용도 |
|---|---|---|
| 탭 | 10px 이내, 300ms 이내 | 핫스팟, 자석, 찾기 |
| 더블 탭 | 280ms 이내 | 줌 한 단계 (한 손) |
| 길게 누르기 | 기본 600ms | 힌트 단계, 입김 대체, 확정 |
| 드래그 | 10px 초과 | 손전등, 필름, 사진, 줄자, 플러그 |
| 스냅 드래그 | 놓을 때 목표 반경 안 | 필름, 줄자, 사진 걸기 |
| 회전 드래그 | 중심 기준 각도 | 다이얼 전화, 금고, 크랭크 |
| 핀치 | 두 손가락 거리 | 줌 |

탭 영역 최소 44×44px(화면 px). 줌 중 반지름 = 22 ÷ 현재 배율.
겹치면 반응 최소 배율이 높은 쪽, 그다음 화면에서 위에 있는 쪽.

## 위젯

| 위젯 | 렌더 | 노트 |
|---|---|---|
| NumberDial, LetterDial, RotaryDial, SafeDial | Pixi 퍼즐 패널 | 배경 줌 고정 |
| Keypad | DOM | 숫자 / 알파벳 / 천지인 / 커스텀. 시스템 키보드 금지 |
| SequenceTap, DragSort, DragSnap, FindTap, LongPress | Pixi | 공통 제스처 |
| ZoomCamera | Pixi | 핀치, 팬, 더블 탭, ± 버튼. 문턱 넘으면 LOD·숨은 조각·효과음. 영역 줌은 사각 마스크 |

## 엔진 시스템

- **Inventory**: 오른쪽 세로 5칸. 테마는 이름·그림만. 탭 → 확대 뷰어. 장면 위에 놓으면 `onUse(itemId, targetId)`. 획득은 GSAP 곡선.
- **Notebook** (DOM): 오른쪽 절반 시트. 없는 테마(1/12)는 끈다.
- **Hints**: 퍼즐당 3단계(방향 → 구체 단서 → 정답). 열기는 길게 누르기. 채널 스킨·`hint.intro[puzzleId]`만 테마. 정체 N분(테마별 3~5)이면 아이콘 깜빡임. 사용 수는 결과 카드.
- **Timer**: 시계 하나, 스킨만 테마. 남은 시간은 실제 시각에서 일시정지(세로, 백그라운드, 시스템 오버레이)를 뺀다. `pause(ms)`, `penalty(ms)`, 경보 지점 이벤트. 타이머 없는 테마(1/12)와 `onZero` 엔딩 모두 가능.
- **Events**: `{ on, run }` 표를 테마 데이터로. 전화·무전은 조작 중 상단 배너만. 퍼즐 화면을 덮지 않는다.
- **저장**: 키 `escape:<themeId>`. 퍼즐 해결, 아이템 획득, 백그라운드 진입 때. 스키마는 공통엔진 §12. 버전 불일치 → 테마 `migrate`. 실패하면 "처음부터"만.

`ThemeDefinition` 필드는 공통엔진 §13을 그대로 쓴다. 대사는 테마 `data/script.ts`.
