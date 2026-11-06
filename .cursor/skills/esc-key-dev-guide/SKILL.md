---
name: esc-key-dev-guide
description: Use when designing, developing, or testing ESC KEY front-end architecture, PixiJS scenes, DOM HUD, touch input, landscape orientation, or fullscreen max mode. Stack is Next.js + PixiJS + Zustand + Howler + GSAP. Canonical spec is docs/개발/공통엔진_v1.md.
---

# ESC KEY 프론트 아키텍처

기준 문서: `docs/개발/공통엔진_v1.md`. 스킬과 문서가 다르면 문서가 이긴다.

모바일 웹, 터치만. PC는 개발 확인용. 가로 전용. 세로는 회전 안내 + 일시정지.

## 스택 경계

| 도구 | 하는 일 | 하지 않는 일 |
|---|---|---|
| Next.js | 라우팅, DOM UI, 정적 내보내기, `manifest`(fullscreen, landscape, 검정) | 장면 그리기 |
| PixiJS | 장면, 핫스팟, 줌, 퍼즐 조작, 필터, 마스크 | 두 줄 이상 글 |
| Zustand | 설정, 진행, 부품함, 수첩, 힌트, 타이머, 로컬 저장 | 장면 안 순간 좌표 |
| Howler | BGM, SFX 스프라이트, 소리 단서, 음성 | 마이크 입력 |
| GSAP | 연출, 카메라, 타임라인. 장면 퇴장 시 그 장면 context 정리 | 게임 시간 계산 |

PixiJS는 테마 페이지에서 클라이언트만 생성한다. SSR 끄고 dynamic import.
Phaser, DOM/SVG를 장면 그래프의 기본 렌더러로 쓰는 것, `navigator.vibrate`는 금지.

글 두 줄 이상 → DOM. 소품 위 짧은 글씨(봉투 주소, 달력 메모)만 텍스처.

## 화면

- 논리 해상도 **1920×1080**, contain. 레터박스는 장면 배경색.
- 터치 크기 기준은 가로 최대 모드 높이 **360px**. 핫스팟 최소 **44×44px**.
- DPR 상한 2. 저사양 1.5.
- HUD는 safe area 안. 장면은 safe area 밖까지 깔 수 있다.
- 조작 금지 띠: 좌우 24px, 아래 20px. 단서 금지.

위 계층이 터치를 먼저 받는다.

| 순서 | 계층 | 곳 |
|---|---|---|
| 1 | 시스템 오버레이 (세로 안내, 시작 게이트, 오류) | DOM |
| 2 | 모달 (편지, 수첩, 설정, 결과) | DOM |
| 3 | 배너 (전화·무전, 퍼즐을 덮지 않는 상단 띠) | DOM |
| 4 | HUD (시간, 뒤로, 힌트, 부품함, 음소거, 최대 모드) | DOM |
| 5 | 내레이션 띠 (아래 22%, 한 줄, 탭으로 넘김) | DOM |
| 6 | 화면 필터 | PixiJS |
| 7 | 퍼즐 패널 (배경 줌 고정) | PixiJS |
| 8 | 장면 | PixiJS |

- 모달: Pixi 입력 잠금. 게임 시간은 흐른다.
- 시스템 오버레이: 게임 시간 정지.
- 전체화면 해제: 게임 계속. HUD 최대 모드 버튼만 깜빡임.
- 엎어두기(붉은 방) 중에는 `orientation.suppress()`. 회전 안내·일시정지 끔.

## 시작 게이트

로딩 바 → 게이트 문구. 입장 때 전체화면을 호출하지 않는다.

모바일은 「화면을 크게 볼까요?」를 먼저 보여 준다. 동의한 탭에서만 `requestFullscreen`. 거절하면 전체화면 없이 시작한다. PC 게이트는 전체화면을 호출하지 않는다. 원하는 사람은 HUD 최대 모드 버튼.

시작 탭 안에서, 전체화면(동의한 경우만) 다음을 동기 시작: 가로 고정 시도 → Howler 깨우기 → wake lock → 그 테마가 요구할 때만 마이크/기울기 권한.

권한 결과는 기다리지 않는다. 거부돼도 대체 경로로 끝까지 간다.

| 환경 | 최대 모드 |
|---|---|
| Android Chrome·삼성 인터넷 | 동의한 뒤에만 Fullscreen API. 전체화면 중 가로 잠금 시도. 뒤로가기로 풀려도 게임은 계속 |
| iPhone Safari | 요소 전체화면 없음. 홈 화면 추가 안내 1회(앱 전역, `homeScreenTipDismissed`). 안에서는 `100dvh` |
| iPhone 홈 화면 | 주소창 없이 실행. 가로 고정 불가 → 세로 안내 |
| iPad | 동의한 뒤에만 전체화면. 가로 고정 불가 |
| PC | 게이트에서 안 함. HUD 버튼만 |

## 입력

게임 영역 `touch-action: none`. 문서 `overscroll-behavior: none`, `user-select: none`, `-webkit-touch-callout: none`.
iOS 확대 방지: viewport `user-scalable=no`, `gesturestart`/`gesturechange` preventDefault.
입력은 Pointer Events. 손가락은 `pointerId`로 구분.

## 폴더

`src/engine/{boot,stage,input,camera,ui,widgets,systems,fx,sensors,audio,save}`, `src/themes/<world>-<theme>/`.
테마는 장면·퍼즐·대사·연출 데이터만 만든다. 화면 틀, 저장, 힌트, 타이머를 테마가 다시 만들지 않는다.
테마 폴더 접두사: `neulbom-`, `haemu-`. 테마는 다른 테마 에셋 없이 단독 실행.

성능·배포·실기기 체크는 공통엔진 §15–§18. 센서·마이크 확인은 HTTPS 정적 빌드에서 한다.
