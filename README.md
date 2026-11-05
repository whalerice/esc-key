# ESC KEY

모바일 웹 방탈출 엔진 (Next.js + PixiJS + Zustand + Howler + GSAP).

설계·규약은 **`docs/공통엔진.md`** 가 소스 오브 트루스. 이 README는 실행만 적는다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

- 허브: http://localhost:4200
- 늘봄 목록: http://localhost:4200/neulbom
- 스텁 테마: http://localhost:4200/neulbom/neulbom-112

```bash
pnpm typecheck
pnpm build
```

## 폴더

- `src/engine/` — 공통 게이트·HUD·저장·위젯 셸 (테마가 복제하지 않음)
- `src/themes/<world>-<theme>/` — 장면·퍼즐·대사·연출 데이터만
- `docs/공통엔진.md` — 전체 스펙

테마 구현은 아직 스텁. 퍼즐·연출은 테마 작업에서 채운다.
