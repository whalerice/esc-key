# haemu-radio 몰입 아트 슬롯 교체 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `haemu-radio` 방·소품·HUD를 와이어 SVG에서 해무 톤 이미지/스킨으로 교체하되 퍼즐·핫스팟·세이브는 그대로 둔다.

**Architecture:** 슬롯 교체. `art.ts`가 공개 URL을 모은다. `Flow.tsx`는 하드코딩 `.svg`를 `PROP_SRC`로 통일. 픽셀은 `public/themes/haemu-radio/{rooms,props}/`. HUD는 `globals.css`의 `[data-theme="haemu-radio"]` 오버라이드만. 엔진/`ThemePlay` API 변경 없음.

**Tech Stack:** Next.js 15, React 19, 기존 DOM 오버레이(`RadioFlow`), 정적 `public/` 이미지(PNG 또는 WebP), CSS 변수.

**Spec:** `docs/superpowers/specs/2026-11-08-haemu-radio-immerse-design.md`

## Global Constraints

- 테마 id: `haemu-radio` only. 다른 테마 파일 수정 금지.
- 씬 키 고정: `control` | `booth` | `desk` | `archive` | `roof`.
- BG 매핑: control→R-BG-02, booth→R-BG-03, desk→R-BG-05, archive→R-BG-06, roof→R-BG-08.
- 팔레트: 밤바다 `#1E2A33`, 깊은 밤 `#12191F`, 안개 `#A9B4B9`, 종이 `#E9E2D2`, 바랜 잉크 `#3B3A36`, 놋쇠 `#B08D4F`, 방송빨강 `#D9473A`. `#000`/`#FFF` 금지.
- 단서 고정(생성 금지): 빨간 등대 이중원, 라디오 깨진 9, 큐시트 낙서/슬롯, 열쇠 실루엣 구분.
- BG에 UI 라벨 텍스트 굽지 않음.
- 새 npm 의존성 추가 금지.
- 퍼즐 정답·`extra` 플래그·핫스팟 좌표 로직 변경 금지.

---

## File map

| Path | Role |
|---|---|
| `src/themes/haemu-radio/art.ts` | `ROOM_SRC`, `DJ_SRC`, **`PROP_SRC`**, 오디오 경로 |
| `src/themes/haemu-radio/Flow.tsx` | `PROP_SRC` 소비. 씬/퍼즐 로직 유지 |
| `src/themes/haemu-radio/hud.module.css` 또는 `src/app/globals.css` 하단 | `[data-theme="haemu-radio"]` HUD 스킨 |
| `src/themes/haemu-radio/Play.tsx` | module CSS import만 (필요 시) |
| `public/themes/haemu-radio/rooms/*` | 5장 BG |
| `public/themes/haemu-radio/props/*` | 소품 |
| `public/themes/haemu-radio/props/_legacy/` | 교체 전 SVG 백업 |
| `public/themes/haemu-radio/rooms/_legacy/` | 교체 전 SVG 백업 |
| `public/themes/haemu-radio/CREDITS.md` | 라이선스·clue-locked·생성 메타 |
| `tools/haemu-radio-art-check.mjs` | 경로 파일 존재 검사 |

---

### Task 1: 브랜치 + PROP_SRC 배선 + 존재 검사

**Files:**
- Create: `tools/haemu-radio-art-check.mjs`
- Modify: `src/themes/haemu-radio/art.ts`
- Modify: `src/themes/haemu-radio/Flow.tsx` (icon/cuesheet/fader src만)
- Test: `node tools/haemu-radio-art-check.mjs`

**Interfaces:**
- Consumes: 기존 `ROOM_SRC`, `DJ_SRC`
- Produces:
  - `PROP_SRC: Record<string, string>` — keys: `board`, `cart`, `coffee`, `cuesheet`, `dj`, `door`, `envelope`, `fader`, `key-big`, `key-boat`, `key-buoy`, `key-gull`, `key-red`, `keypad`, `letter`, `radio`, `tape`, `tower`, `walkie`
  - `propArt(id: string): string` — `PROP_SRC[id]` 또는 throw
  - check script exit 0 iff every `ROOM_SRC` + `PROP_SRC` + `DJ_SRC` file exists under `public/`

- [ ] **Step 1: 브랜치**

```bash
git checkout develop
git pull
git checkout -b cursor/haemu-radio-immerse-art
```

- [ ] **Step 2: 실패하는 존재 검사 스크립트 작성**

`tools/haemu-radio-art-check.mjs`:

```js
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const artPath = join(root, 'src/themes/haemu-radio/art.ts');
const src = readFileSync(artPath, 'utf8');
const urls = [...src.matchAll(/`(\/themes\/haemu-radio\/[^`]+)`/g)].map((m) => m[1]);
const unique = [...new Set(urls)].filter((u) => !u.includes('/audio/'));
let fail = 0;
for (const u of unique) {
  const file = join(root, 'public', u.slice(1));
  if (!existsSync(file)) {
    console.error('MISSING', u);
    fail++;
  }
}
if (fail) {
  console.error(`fail ${fail}`);
  process.exit(1);
}
console.log(`ok ${unique.length} art files`);
```

- [ ] **Step 3: 스크립트 실행 (현재는 SVG로 ok여야 함)**

Run: `node tools/haemu-radio-art-check.mjs`  
Expected: `ok N art files` (N ≥ 24), exit 0

- [ ] **Step 4: `art.ts`에 PROP_SRC 추가**

`DJ_SRC` 아래에:

```ts
export const PROP_SRC = {
  board: `${root}/props/board.svg`,
  cart: `${root}/props/cart.svg`,
  coffee: `${root}/props/coffee.svg`,
  cuesheet: `${root}/props/cuesheet.svg`,
  dj: `${root}/props/dj.svg`,
  door: `${root}/props/door.svg`,
  envelope: `${root}/props/envelope.svg`,
  fader: `${root}/props/fader.svg`,
  'key-big': `${root}/props/key-big.svg`,
  'key-boat': `${root}/props/key-boat.svg`,
  'key-buoy': `${root}/props/key-buoy.svg`,
  'key-gull': `${root}/props/key-gull.svg`,
  'key-red': `${root}/props/key-red.svg`,
  keypad: `${root}/props/keypad.svg`,
  letter: `${root}/props/letter.svg`,
  radio: `${root}/props/radio.svg`,
  tape: `${root}/props/tape.svg`,
  tower: `${root}/props/tower.svg`,
  walkie: `${root}/props/walkie.svg`,
} as const;

export function propArt(id: string): string {
  const src = PROP_SRC[id as keyof typeof PROP_SRC];
  if (!src) throw new Error(`unknown prop: ${id}`);
  return src;
}
```

`DJ_SRC`는 `PROP_SRC.dj`와 동일 문자열로 맞춰도 됨: `export const DJ_SRC = PROP_SRC.dj;` (순서: PROP_SRC 먼저).

- [ ] **Step 5: Flow.tsx 하드코딩 제거**

Import: `PROP_SRC, propArt` from `./art`.

`Prop` 컴포넌트 icon:

```tsx
{icon ? <img src={propArt(icon)} alt="" /> : null}
```

cuesheet img ≈ line 471:

```tsx
src={PROP_SRC.cuesheet}
```

fader img ≈ line 994:

```tsx
src={PROP_SRC.fader}
```

다른 `/themes/haemu-radio/props/*.svg` 리터럴이 있으면 같은 방식으로 교체. `rg "haemu-radio/props" src/themes/haemu-radio` → 0건의 하드코딩 `.svg`.

- [ ] **Step 6: 재검사 + typecheck**

```bash
node tools/haemu-radio-art-check.mjs
pnpm typecheck
```

Expected: art check ok, tsc exit 0

- [ ] **Step 7: Commit**

```bash
git add tools/haemu-radio-art-check.mjs src/themes/haemu-radio/art.ts src/themes/haemu-radio/Flow.tsx
git commit -m "$(cat <<'EOF'
refactor(haemu-radio): centralize prop art URLs

Keep puzzle logic; make format swaps a single art.ts edit.
EOF
)"
```

---

### Task 2: SVG 레거시 백업

**Files:**
- Create: `public/themes/haemu-radio/rooms/_legacy/*.svg`
- Create: `public/themes/haemu-radio/props/_legacy/*.svg`

**Interfaces:**
- Produces: 교체 전 원본 복사본. 게임 런타임은 `_legacy`를 읽지 않음.

- [ ] **Step 1: 복사**

```bash
mkdir -p public/themes/haemu-radio/rooms/_legacy public/themes/haemu-radio/props/_legacy
cp public/themes/haemu-radio/rooms/*.svg public/themes/haemu-radio/rooms/_legacy/
cp public/themes/haemu-radio/props/*.svg public/themes/haemu-radio/props/_legacy/
```

- [ ] **Step 2: Commit**

```bash
git add public/themes/haemu-radio/rooms/_legacy public/themes/haemu-radio/props/_legacy
git commit -m "chore(haemu-radio): park wireframe SVG under _legacy"
```

---

### Task 3: 방 BG 5장 교체 (세로 슬라이스 = control 먼저)

**Files:**
- Create/Replace: `public/themes/haemu-radio/rooms/{control,booth,desk,archive,roof}.png` (또는 `.webp`)
- Modify: `src/themes/haemu-radio/art.ts` `ROOM_SRC` 확장자
- Test: `node tools/haemu-radio-art-check.mjs` + `pnpm dev` 시각 확인

**Interfaces:**
- Consumes: Task 1 `ROOM_SRC`
- Produces: 1920×1080 이미지 5장. UI 라벨 텍스트 없음. 광원 1개. 팔레트 준수.

**생성 규칙 (에이전트):**
1. Cursor `GenerateImage` 또는 동등 도구로 해무 톤 일러스트 생성.
2. 프롬프트에 팔레트 hex·“no UI labels / no pure black-white / soft flat painterly / single warm light” 포함.
3. control = 부조정실(책상·부스 유리·바다 창·ON AIR 램프). booth = DJ 부스. desk = 작가석. archive = 테이프 선반. roof = 안개 옥상+송신탑.
4. 가능하면 WebP; 없으면 PNG. `art.ts` 확장자를 파일과 일치.
5. control 창의 빨간 등대는 BG에 약하게만. **이중원 단서는 props/cuesheet·key-red 쪽이 진실** (BG에 구워도 퍼즐 마크와 충돌하지 않게 흐리게).

- [ ] **Step 1: control 이미지만 넣고 ROOM_SRC.control 확장자 변경**

예:

```ts
control: `${root}/rooms/control.png`,
```

구 `control.svg`는 `_legacy`에만 두고 루트 `rooms/control.svg`는 삭제(혼동 방지).

- [ ] **Step 2: 존재 검사**

Run: `node tools/haemu-radio-art-check.mjs`  
Expected: ok (control 새 확장자 반영)

- [ ] **Step 3: 시각 확인**

```bash
pnpm dev
```

브라우저: `/haemu/haemu-radio` (또는 앱 라우트) → 부조정실.  
체크: 네모 와이어 아님, “부조정실” 굽힌 글자 없음, HTML 회색상자 감 감소.

- [ ] **Step 4: 나머지 4방 동일 절차**

`booth`, `desk`, `archive`, `roof` 생성 → `ROOM_SRC` 일괄 확장자 → 루트 `.svg` 제거 → check.

- [ ] **Step 5: Commit**

```bash
git add public/themes/haemu-radio/rooms src/themes/haemu-radio/art.ts
git commit -m "$(cat <<'EOF'
feat(haemu-radio): replace room wireframes with painted BGs

Slot-swap only; keep scene keys and hotspot layout.
EOF
)"
```

---

### Task 4: 소품 리치화 + clue-locked

**Files:**
- Replace: `public/themes/haemu-radio/props/*` ( `_legacy` 제외)
- Modify: `art.ts` `PROP_SRC` 확장자(필요 시)
- Modify: `public/themes/haemu-radio/CREDITS.md`
- Optional overlay SVGs: `props/marks/cuesheet-doodle.svg`, `props/marks/radio-digit9.svg`, `props/marks/lighthouse-rings.svg` — Flow에 얹을 때만 생성. **우선순위: 소품 파일 안에 손으로 구운 마크 유지가 더 단순 (YAGNI).**

**Interfaces:**
- Consumes: `PROP_SRC` / `propArt`
- Produces: 식별 가능한 소품 19종. CREDITS에 clue-locked 표.

**클루 체크리스트 (머지 전 필수):**

| 파일 | 고정 마크 |
|---|---|
| `cuesheet.*` | 빨간 등대 낙서 = 굵은 선 + 이중 동그라미 |
| `radio.*` | 숫자창 끝자리 깨진/특수 `9` |
| `key-red.*` | 이중원 + 빨간 등대 실루엣 (함정 키) |
| `key-boat|buoy|gull|big.*` | 서로 다른 실루엣 |

- [ ] **Step 1: 비클루 소품부터 교체**

`coffee`, `cart`, `door`, `envelope`, `letter`, `tape`, `tower`, `walkie`, `board`, `fader`, `keypad`, `dj` — 리치 SVG(그라데이션/손때) 또는 PNG. `origin/cursor/haemu-radio-props-rich-5483` diff를 참고 가능하되 파일럿 톤은 스타일가이드 우선.

- [ ] **Step 2: 클루 소품 교체 (마크 보존 검수)**

`cuesheet`, `radio`, `key-*` — 베이스 그린 뒤 마크를 `_legacy`에서 트레이스하거나 벡터로 다시 그림. 스크린샷으로 이중원·9·실루엣 확인.

- [ ] **Step 3: PROP_SRC 확장자 맞추기 + check**

```bash
node tools/haemu-radio-art-check.mjs
pnpm typecheck
```

- [ ] **Step 4: CREDITS 갱신**

`CREDITS.md`의 “원작 SVG / 사진 금지” 문단을 스펙에 맞게 수정:

- 방 BG·소품: AI/스톡/원작 구분 표
- clue-locked 행 명시
- 모델명·시드·스톡 URL(해당 시)

- [ ] **Step 5: Commit**

```bash
git add public/themes/haemu-radio/props public/themes/haemu-radio/CREDITS.md src/themes/haemu-radio/art.ts
git commit -m "$(cat <<'EOF'
feat(haemu-radio): rich props with clue-locked marks

Keep puzzle tokens; only pixels change.
EOF
)"
```

---

### Task 5: HUD 스킨 (`data-theme="haemu-radio"`)

**Files:**
- Modify: `src/app/globals.css` (테마 스코프 블록 추가) **또는**
- Create: `src/themes/haemu-radio/hud.css` + `Play.tsx`에서 `import './hud.css'`

**Interfaces:**
- Consumes: `ThemePlay` root `data-theme={theme.id}` (`ThemePlay.tsx` ≈ line 349)
- Produces: 라디오 플레이 중만 가방/힌트/타이머/슬롯이 종이·놋쇠·방송빨강 톤

권장: `Play.tsx`에 `import './hud.css'` — 다른 테마 오염 최소.

`hud.css` 예시:

```css
:global([data-theme='haemu-radio']) {
  --hud: rgba(30, 42, 51, 0.88);
  --radio-paper: #e9e2d2;
  --radio-ink: #3b3a36;
  --radio-brass: #b08d4f;
  --radio-onair: #d9473a;
}

:global([data-theme='haemu-radio'] .hud-btn),
:global([data-theme='haemu-radio'] .hud-timer),
:global([data-theme='haemu-radio'] .hud-inventory) {
  background: var(--hud);
  border: 1px solid var(--radio-brass);
  color: var(--radio-paper);
  border-radius: 2px;
}

:global([data-theme='haemu-radio'] .hud-slot) {
  border-color: var(--radio-brass);
  background: rgba(18, 25, 31, 0.75);
  color: var(--radio-paper);
}

:global([data-theme='haemu-radio'] .hud-btn.blink) {
  box-shadow: 0 0 0 1px var(--radio-onair);
}

:global([data-theme='haemu-radio'] .radio-flow button) {
  border-color: var(--radio-brass);
  color: var(--radio-paper);
  background: rgba(18, 25, 31, 0.82);
}
```

CSS modules를 쓰면 `:global` 유지. plain `hud.css`면 `:global` 제거·선택자만 `[data-theme='haemu-radio'] ...`.

- [ ] **Step 1: hud.css 추가 + Play import**

```tsx
import './hud.css';
```

- [ ] **Step 2: 시각 확인**

`pnpm dev` → 가방·타이머·힌트 버튼이 기본 회색 웹 UI가 아닌지.  
다른 테마(`/neulbom/...` 또는 lighthouse) 열어 스타일 오염 없는지.

- [ ] **Step 3: Commit**

```bash
git add src/themes/haemu-radio/hud.css src/themes/haemu-radio/Play.tsx
git commit -m "style(haemu-radio): theme-scoped HUD brass/paper skin"
```

---

### Task 6: 회귀 스모크 + 합격선 체크

**Files:** none required (검증만). 실패 시 해당 Task로 롤백 수정.

- [ ] **Step 1: 자동화**

```bash
node tools/haemu-radio-art-check.mjs
pnpm typecheck
pnpm exec tsx -e "import { assertRadioAnswers } from './src/themes/haemu-radio/puzzles/answers.ts'; assertRadioAnswers(); console.log('answers ok')"
```

`tsx` 없으면:

```bash
pnpm typecheck
node --import tsx 2>/dev/null || node -e "console.log('skip assert; run via vitest/ts-node if available')"
```

최소: `pnpm typecheck` + art-check. answers assert는 프로젝트가 TS 직접 실행 가능할 때만.

- [ ] **Step 2: 수동 플레이 스모크 (체크리스트)**

1. 5방 전환 — BG 전부 새 아트
2. P1 키패드 → 부스 입장
3. 인벤 아이콘 식별(열쇠 종류)
4. 힌트 채널(메신저→P7 후 무전) UI 보임
5. 새로고침 이어하기 동작(기존 세이브)
6. 단서 마크 4종 육안 확인

- [ ] **Step 3: 스펙 합격선 문장 확인**

- [ ] 와이어/HTML 크롬 느낌 제거
- [ ] 광원 1개·해무 톤
- [ ] 퍼즐 무파괴

- [ ] **Step 4: 최종 Commit (필요 시 픽스만)**

```bash
git status
# 픽스 있으면 commit 후
git log --oneline develop..HEAD
```

---

## Self-review (plan vs spec)

| Spec 요구 | Task |
|---|---|
| 슬롯 교체 / 엔진 미변경 | 1, 3–5 |
| 방 5 + R-BG 매핑 | 3 |
| 소품 + clue-locked | 4 |
| HUD 스킨 스코프 | 5 |
| 라이선스 CREDITS | 4 |
| `_legacy` 폴백 | 2 |
| 검증 합격선 C | 6 |
| 타 테마 비범위 | Global Constraints |

Placeholder scan: none. PROP_SRC 키 = 실제 props 디렉터리 파일명과 일치.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-08-haemu-radio-immerse.md`.

**1. Subagent-Driven (recommended)** — 태스크마다 새 서브에이전트 + 사이 리뷰  
**2. Inline Execution** — 이 세션에서 executing-plans로 연속 실행

Which approach?
