---
name: esc-key-audio-system
description: Use when designing or debugging ESC KEY audio, BGM, SFX sprites, voice clues, Howler unlock, ducking, hearing-assist captions, or mic lifecycle. Spec is docs/개발/공통엔진_v1.md. Do not build a separate Web Audio game bus.
---

# ESC KEY 사운드 (Howler)

기준: `docs/개발/공통엔진_v1.md` §5, §9–§11. 구현은 `engine/audio/SoundManager.ts`.

Web Audio `AudioContext`를 게임 버스·절차적 비프 신스로 만들지 않는다. Howler가 재생을 맡는다.

## 깨우기

시작 게이트 탭 안에서 Howler를 깨운다. 그 전 재생 호출은 큐에 넣지 말고 버린다.
백그라운드에서 돌아오면 다시 깨운다. iOS는 백그라운드 후 오디오가 멈춰 있을 수 있다.
마이크 트랙을 끈 직후에도 다시 깨운다. iOS는 마이크 동안 출력 경로가 바뀐다.

## 구성

- 테마당 SFX 스프라이트 1파일 + BGM 루프 1~2.
- 볼륨 세 갈래: `bgm`, `sfx`, `voice`. 음소거는 HUD 오른쪽 위.
- 전화·무전 음성 중 BGM은 40%.
- 소리 단서(넘버 스테이션, 자장가, 전화 음성)는 iPhone 무음 스위치에 묻히지 않게 HTML5 Audio. 지원 브라우저면 audio session을 playback으로.
- 소리 단서마다 시각 대체(자막, 램프). 설정 `hearingAssist`. 소리만으로 진행이 막히면 안 된다.
- `navigator.vibrate` 금지.

## 생명주기

| 상황 | 소리 |
|---|---|
| 세로 전환 | BGM만 낮춤. 게임 시간은 정지 |
| 백그라운드·화면 꺼짐 | 전부 정지. 즉시 저장 |
| 전체화면 해제, 모달 | 계속 |
| 엎어두기 중 회전 | 계속 |

## 마이크 (입김, 겨울 온실)

그 장면에서만 켠다. 끝나면 트랙을 바로 `stop` (표시등 끄기).
넓은 대역 잡음이 기준 이상으로 1.5초면 성공.
권한 거부, 마이크 없음, 3회 실패 → 길게 누르기 1.5초.

## 체크

- [ ] 게이트 탭 전에 소리가 나지 않는가
- [ ] 게이트 탭 한 번으로 Howler가 깨우는가
- [ ] BGM / SFX / 음성 볼륨과 HUD 음소거가 분리되는가
- [ ] 백그라운드 후 iOS에서 소리가 다시 나는가
- [ ] 소리 단서가 무음 스위치에서도 나거나, 아니면 시각 대체만으로 풀리는가
- [ ] 마이크를 끈 뒤 출력 경로가 복구되는가
