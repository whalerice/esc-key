---
name: esc-key-asset-collector
description: Use when collecting theme images, illustrations, or icons for ESC KEY before art implementation. Searches Unsplash and Pixabay APIs and builds Pngtree and Flaticon search URLs from docs/늘봄 art direction. Use for 에셋 수집, 무드보드, theme asset candidates, or assets/candidates.
---

# ESC KEY 테마 에셋 수집

기준: `tools/asset-collector/README.md`, `docs/늘봄/*_설계.md`.

게임 `src/`를 수정하지 않는다. 수집은 `pnpm assets:collect`.

## 실행

```bash
pnpm assets:collect --self-check
pnpm assets:collect
pnpm assets:collect neulbom-112
```

테마 id: `neulbom-112`, `neulbom-greenhouse`, `neulbom-darkroom`, `neulbom-lasttrain`.

키: `UNSPLASH_ACCESS_KEY`, `PIXABAY_API_KEY`. 없으면 검색 URL만. 키를 코드·매니페스트·로그에 넣지 않는다. `.env.local`은 `node --env-file=.env.local tools/asset-collector/collect.mjs`.

출력: `assets/candidates/<themeId>/manifest.json` (쿼리, 이유, 출처 URL, 라이선스, 출처 표기).

## 하지 말 것

- Pngtree·Flaticon HTML 스크랩. 검색 URL만.
- Unsplash 파일을 깃에 저장. 핫링크. 채택할 때만 `downloadLocation` 호출.
- Pixabay CDN을 게임 경로로 고정. 쓸 때만 `--download` (테마당 2장, 400KB, `files/`는 gitignore).
- 크론, 대량 재시도. 소스당 테마당 호출 상한 4. 캐시 24시간.
- 새 npm 의존성.

쿼리 추가는 `tools/asset-collector/themes.mjs`만. 스타일 메모는 설계 문서의 톤·소품·색을 따른다.
