# 테마 에셋 수집

늘봄시 테마 아트 방향(`docs/늘봄/*_설계.md`)으로 후보를 찾는다. 게임 코드와 분리된 스크립트다. 의존성 없음.

```bash
pnpm assets:collect --self-check
pnpm assets:collect
pnpm assets:collect neulbom-greenhouse
node --env-file=.env.local tools/asset-collector/collect.mjs
pnpm assets:collect --download
pnpm assets:collect --dry-run
```

테마 id: `neulbom-112`, `neulbom-greenhouse`, `neulbom-darkroom`, `neulbom-lasttrain`.

인자 없으면 네 테마 전부. 출력은 `assets/candidates/<themeId>/manifest.json`.

## 환경 변수

| 변수 | 소스 |
|---|---|
| `UNSPLASH_ACCESS_KEY` | [Unsplash 앱](https://unsplash.com/oauth/applications) Access Key |
| `PIXABAY_API_KEY` | [Pixabay API](https://pixabay.com/api/docs/) |

키는 코드에 넣지 않는다. `.env.local`은 gitignore 대상이다. 키가 없으면 그 소스는 검색 URL만 기록하고, 빠진 변수 이름을 출력한다.

크론으로 돌리지 않는다. Unsplash API는 사람 손으로 돌리는 검색을 전제로 한다.

## 소스별 동작

| 소스 | 동작 |
|---|---|
| Unsplash | 공식 검색 API. 결과는 `photo.urls` 핫링크와 출처. 바이너리를 저장하지 않는다. 실제로 쓸 때만 manifest의 `downloadLocation`을 `Client-ID` 헤더로 호출. |
| Pixabay | 공식 검색 API. 응답은 24시간 파일 캐시(`assets/candidates/.cache/`, gitignore). CDN 주소는 임시 미리보기. `--download`는 테마당 미리보기 최대 2장, 400KB 이하만 `assets/candidates/<themeId>/files/`에 저장. 그 폴더도 gitignore. |
| Pngtree | API 호출 없음. `https://pngtree.com/so/<slug>` 검색 URL. |
| Flaticon | API 호출 없음. `https://www.flaticon.com/search?word=` 검색 URL. |

쿼리 수정은 `tools/asset-collector/themes.mjs`.

## 라이선스

- **Unsplash License.** 사용 가능. 화면에는 작가, Unsplash, 프로필 링크(`utm_source=esc-key&utm_medium=referral`)를 남긴다. 무수정 재판매 금지. API로 받은 파일을 저장소에 넣지 않는다.
- **Pixabay Content License.** 사용 가능. 무수정 스톡 재판매 금지. 게임이나 깃에 CDN 핫링크 금지. 쓸 파일만 `--download`로 받은 뒤 사람이 고른다.
- **Pngtree, Flaticon.** 재배포 불명. 무료도 출처 표시가 흔하고 유료가 많다. URL만 커밋한다. 페이지를 긁지 않는다.
