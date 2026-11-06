#!/usr/bin/env node
/**
 * Theme asset collector. Stdlib only.
 *
 *   pnpm assets:collect
 *   pnpm assets:collect -- neulbom-darkroom
 *   node --env-file=.env.local tools/asset-collector/collect.mjs
 *
 * Env (never hardcoded): UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY.
 * Missing key → that source stays a search URL. No scraping.
 *
 * Unsplash API (guidelines, 2026-07): hotlink photo.urls. Do not save a copy
 * from the API. Call download_location only when a photo is actually chosen.
 * Pixabay API: cache 24h, no mass download, no permanent hotlink.
 * --download saves at most 2 Pixabay previews per theme, gitignored.
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { THEMES } from './themes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CALLS = 4; // ponytail: per source per theme. Unsplash demo 50/h; Pixabay forbids mass queries.
const MAX_DOWNLOADS = 2;
const MAX_BYTES = 400_000;

const LICENSE = {
  unsplash: {
    name: 'Unsplash License',
    url: 'https://unsplash.com/license',
    note: '콘텐츠 라이선스는 사용을 허용한다. API 가이드(2026-07)는 photo.urls 핫링크를 요구하고, 파일을 깃에 넣는 복사를 금지하는 쪽에 가깝다. 고르면 download_location을 Client-ID로 한 번 호출. 출처: 작가 + Unsplash + utm_source=esc-key&utm_medium=referral. 무수정 재판매·월페이퍼 앱류 금지.',
  },
  pixabay: {
    name: 'Pixabay Content License',
    url: 'https://pixabay.com/service/license-summary/',
    note: '사용 가능. 출처 표시는 라이선스상 불필요하지만, API로 결과를 보여줄 때는 출처를 남긴다. 무수정 스톡 재판매 금지. CDN 핫링크 금지. 쓰려면 받아서 자기 파일로 둔다. 미리보기는 임시.',
  },
  pngtree: {
    name: 'Pngtree (확인 전)',
    url: 'https://pngtree.com/terms-of-use',
    note: '검색 URL만 기록. 무료도 출처 표시·횟수 제한이 흔하고, 상당수는 유료다. 재배포 불명. 페이지를 긁지 않는다.',
  },
  flaticon: {
    name: 'Flaticon (확인 전)',
    url: 'https://www.flaticon.com/legal',
    note: '검색 URL만 기록. 무료 아이콘은 보통 출처 표시, 그 외는 유료. 재배포 불명. 페이지를 긁지 않는다.',
  },
};

const SEARCH_REASON = {
  pngtree: '공식 검색 API를 쓰지 않음. 검색 URL만.',
  flaticon: '이 도구의 API 키 범위 밖. 검색 URL만.',
};

function searchUrl(query) {
  const q = query.q;
  if (query.source === 'unsplash') {
    return `https://unsplash.com/s/photos/${encodeURIComponent(q)}`;
  }
  if (query.source === 'pixabay') {
    const kind = query.imageType === 'illustration' ? 'illustrations' : 'images';
    return `https://pixabay.com/${kind}/search/${encodeURIComponent(q)}/`;
  }
  if (query.source === 'pngtree') {
    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `https://pngtree.com/so/${slug}`;
  }
  return `https://www.flaticon.com/search?word=${encodeURIComponent(q)}&type=icon`;
}

function seedCandidate(query) {
  const lic = LICENSE[query.source];
  const urlOnly = query.source === 'pngtree' || query.source === 'flaticon';
  return {
    via: 'search-url',
    source: query.source,
    kind: query.kind,
    role: query.role,
    query: query.q,
    queryKo: query.qKo,
    why: query.why,
    pageUrl: searchUrl(query),
    imageUrl: null,
    imageUrlUse: 'none',
    license: lic.name,
    licenseUrl: lic.url,
    licenseNote: lic.note,
    attribution: null,
    redistributable: urlOnly ? 'unclear' : null,
    commitAdvice: urlOnly ? 'url-only' : query.source === 'unsplash' ? 'hotlink-only' : 'download-then-review',
    localFile: null,
  };
}

function withUtm(raw) {
  const url = new URL(raw);
  url.searchParams.set('utm_source', 'esc-key');
  url.searchParams.set('utm_medium', 'referral');
  return url.toString();
}

function unsplashHit(query, photo) {
  const profile = photo.user?.links?.html || `https://unsplash.com/@${photo.user?.username || 'unknown'}`;
  return {
    ...seedCandidate(query),
    via: 'api',
    pageUrl: withUtm(photo.links.html),
    imageUrl: photo.urls?.small || null,
    imageUrlUse: 'hotlink',
    downloadLocation: photo.links?.download_location || null,
    alt: photo.alt_description || photo.description || null,
    externalId: photo.id,
    attribution: `Photo by ${photo.user?.name || 'unknown'} on Unsplash (${withUtm(profile)})`,
    redistributable: true,
    commitAdvice: 'hotlink-only',
  };
}

function pixabayHit(query, hit) {
  return {
    ...seedCandidate(query),
    via: 'api',
    pageUrl: hit.pageURL,
    imageUrl: hit.webformatURL || null,
    imageUrlUse: 'temporary-preview',
    alt: hit.tags || null,
    externalId: hit.id,
    attribution: hit.user ? `Image by ${hit.user} on Pixabay (${hit.pageURL})` : `Pixabay (${hit.pageURL})`,
    redistributable: true,
    commitAdvice: 'download-then-review',
  };
}

function cacheFile(cacheDir, source, params) {
  const hash = createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 16);
  return join(cacheDir, `${source}-${hash}.json`);
}

async function cachedJson(cacheDir, source, params, refresh, loader) {
  const file = cacheFile(cacheDir, source, params);
  if (!refresh) {
    try {
      const prev = JSON.parse(await readFile(file, 'utf8'));
      if (Date.now() - prev.savedAt < TTL_MS) return { data: prev.data, cached: true };
    } catch {
      /* miss */
    }
  }
  const data = await loader();
  await mkdir(cacheDir, { recursive: true });
  await writeFile(file, `${JSON.stringify({ savedAt: Date.now(), data })}\n`);
  return { data, cached: false };
}

async function readJson(res) {
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

async function searchUnsplash(query, key, fetchImpl, cacheDir, refresh, bucket) {
  if (bucket.calls >= MAX_CALLS) {
    bucket.truncated = true;
    return [];
  }
  bucket.calls += 1;
  const params = {
    query: query.q,
    per_page: '3',
    content_filter: 'high',
    ...(query.role === 'background' ? { orientation: 'landscape' } : {}),
  };
  const { data, cached } = await cachedJson(cacheDir, 'unsplash', params, refresh, async () => {
    const url = new URL('https://api.unsplash.com/search/photos');
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetchImpl(url, {
      headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
      signal: AbortSignal.timeout(20000),
    });
    return readJson(res);
  });
  if (cached) bucket.cacheHits += 1;
  return (data.results || []).map((photo) => unsplashHit(query, photo));
}

async function searchPixabay(query, key, fetchImpl, cacheDir, refresh, bucket) {
  if (bucket.calls >= MAX_CALLS) {
    bucket.truncated = true;
    return [];
  }
  bucket.calls += 1;
  const params = {
    q: query.q,
    image_type: query.imageType || 'all',
    safesearch: 'true',
    per_page: '3',
    ...(query.role === 'background' ? { orientation: 'horizontal' } : {}),
  };
  const { data, cached } = await cachedJson(cacheDir, 'pixabay', params, refresh, async () => {
    const url = new URL('https://pixabay.com/api/');
    url.searchParams.set('key', key);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(20000) });
    return readJson(res);
  });
  if (cached) bucket.cacheHits += 1;
  return (data.hits || []).map((hit) => pixabayHit(query, hit));
}

async function downloadPixabay(hit, themeDir, fetchImpl) {
  if (!hit.imageUrl) return;
  const ext = hit.imageUrl.includes('.png') ? 'png' : 'jpg';
  const safeId = String(hit.externalId ?? 'x').replace(/[^a-z0-9_-]/gi, '') || 'x';
  const rel = `files/pixabay-${safeId}.${ext}`;
  const dest = join(themeDir, rel);
  try {
    await access(dest);
    hit.localFile = rel;
    return;
  } catch {
    /* download */
  }
  const res = await fetchImpl(hit.imageUrl, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    hit.downloadSkipped = `HTTP ${res.status}`;
    return;
  }
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) {
    hit.downloadSkipped = 'not-image';
    return;
  }
  const len = Number(res.headers.get('content-length') || 0);
  if (len > MAX_BYTES) {
    hit.downloadSkipped = 'over-400kb';
    return;
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) {
    hit.downloadSkipped = 'over-400kb';
    return;
  }
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  hit.localFile = rel;
}

function blankBucket() {
  return { calls: 0, cacheHits: 0, truncated: false, error: null };
}

function sourceReport(mode, reason, bucket) {
  return {
    mode,
    reason,
    requests: bucket.calls,
    cacheHits: bucket.cacheHits,
    truncated: bucket.truncated,
    error: bucket.error,
  };
}

async function collectTheme(theme, opt) {
  const unsplashKey = opt.env.UNSPLASH_ACCESS_KEY || '';
  const pixabayKey = opt.env.PIXABAY_API_KEY || '';
  const buckets = { unsplash: blankBucket(), pixabay: blankBucket() };
  const candidates = [];

  for (const query of theme.queries) {
    candidates.push(seedCandidate(query));
    if (opt.dryRun) continue;
    const bucket = buckets[query.source];
    if (bucket?.error) continue;
    try {
      if (query.source === 'unsplash' && unsplashKey) {
        const hits = await searchUnsplash(query, unsplashKey, opt.fetchImpl, opt.cacheDir, opt.refresh, buckets.unsplash);
        candidates.push(...hits);
        if (opt.delayMs) await delay(opt.delayMs);
      } else if (query.source === 'pixabay' && pixabayKey) {
        const hits = await searchPixabay(query, pixabayKey, opt.fetchImpl, opt.cacheDir, opt.refresh, buckets.pixabay);
        candidates.push(...hits);
        if (opt.delayMs) await delay(opt.delayMs);
      }
    } catch (err) {
      // err.message 에 Pixabay URL(키 포함)이 들어갈 수 있다. status만 남긴다.
      if (bucket && !bucket.error) bucket.error = typeof err.status === 'number' ? `HTTP ${err.status}` : 'request failed';
    }
  }

  if (opt.download && !opt.dryRun && pixabayKey) {
    let saved = 0;
    for (const hit of candidates) {
      if (saved >= MAX_DOWNLOADS) break;
      if (hit.source !== 'pixabay' || hit.via !== 'api') continue;
      try {
        await downloadPixabay(hit, join(opt.outDir, theme.id), opt.fetchImpl);
      } catch {
        hit.downloadSkipped = 'request failed';
      }
      if (hit.localFile) saved += 1;
    }
  }

  const api = (name, key) => {
    if (opt.dryRun) return sourceReport('dry-run', '--dry-run', buckets[name]);
    if (!key) return sourceReport('dry-run', `${name === 'unsplash' ? 'UNSPLASH_ACCESS_KEY' : 'PIXABAY_API_KEY'} missing`, buckets[name]);
    return sourceReport('live', null, buckets[name]);
  };
  const sources = {
    unsplash: api('unsplash', unsplashKey),
    pixabay: api('pixabay', pixabayKey),
    pngtree: { mode: 'search-url', reason: SEARCH_REASON.pngtree },
    flaticon: { mode: 'search-url', reason: SEARCH_REASON.flaticon },
  };
  const unsplashLive = sources.unsplash.mode === 'live';
  const pixabayLive = sources.pixabay.mode === 'live';
  const mode = unsplashLive && pixabayLive ? 'live' : unsplashLive || pixabayLive ? 'partial' : 'dry-run';

  const manifest = {
    schema: 1,
    themeId: theme.id,
    title: theme.title,
    doc: theme.doc,
    palette: theme.palette,
    styleNote: theme.styleNote,
    generatedAt: new Date().toISOString(),
    mode,
    missingEnv: [
      ...(!unsplashKey ? ['UNSPLASH_ACCESS_KEY'] : []),
      ...(!pixabayKey ? ['PIXABAY_API_KEY'] : []),
    ],
    sources,
    licenseCaveats: Object.values(LICENSE).map((lic) => `${lic.name}: ${lic.note}`),
    candidates,
  };
  const dir = join(opt.outDir, theme.id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function usage() {
  return `usage: node tools/asset-collector/collect.mjs [--all | <themeId>...] [--dry-run] [--download] [--refresh] [--self-check]

themes: ${THEMES.map((t) => t.id).join(', ')}
env:    UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY
        node --env-file=.env.local tools/asset-collector/collect.mjs
out:    assets/candidates/<themeId>/manifest.json
`;
}

async function run(opt) {
  const manifests = [];
  for (const theme of opt.themes) manifests.push(await collectTheme(theme, opt));
  return manifests;
}

function baseOpt(over) {
  return {
    dryRun: false,
    download: false,
    refresh: false,
    delayMs: 300,
    outDir: join(ROOT, 'assets/candidates'),
    cacheDir: join(ROOT, 'assets/candidates/.cache'),
    env: {
      UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
      PIXABAY_API_KEY: process.env.PIXABAY_API_KEY || '',
    },
    fetchImpl: globalThis.fetch,
    themes: THEMES,
    ...over,
  };
}

async function selfCheck() {
  const hangul = /[가-힣]/;
  assert.deepEqual(
    THEMES.map((t) => t.id),
    ['neulbom-112', 'neulbom-greenhouse', 'neulbom-darkroom', 'neulbom-lasttrain'],
  );
  for (const theme of THEMES) {
    assert.match(theme.styleNote, hangul);
    assert.match(theme.palette, /^#[0-9a-f]{6}$/);
    const sources = new Set(theme.queries.map((q) => q.source));
    for (const name of ['unsplash', 'pixabay', 'pngtree', 'flaticon']) assert.ok(sources.has(name), theme.id);
    for (const query of theme.queries) {
      assert.ok(query.q.length > 0 && query.q.length <= 100, query.q);
      assert.match(query.why, hangul);
      assert.match(query.qKo, hangul);
      const url = searchUrl(query);
      assert.ok(url.startsWith('https://'), url);
      assert.equal(url.includes('key='), false);
    }
  }

  let fetches = 0;
  const dir = join(tmpdir(), `esc-asset-collector-${process.pid}`);
  const dry = await run(baseOpt({
    dryRun: true,
    delayMs: 0,
    outDir: dir,
    cacheDir: join(dir, '.cache'),
    env: { UNSPLASH_ACCESS_KEY: '', PIXABAY_API_KEY: '' },
    fetchImpl: async () => {
      fetches += 1;
      throw new Error('network');
    },
  }));
  assert.equal(fetches, 0);
  assert.equal(dry.length, 4);
  assert.equal(dry[0].mode, 'dry-run');
  assert.deepEqual(dry[0].missingEnv, ['UNSPLASH_ACCESS_KEY', 'PIXABAY_API_KEY']);
  const png = dry[0].candidates.find((c) => c.source === 'pngtree');
  const flat = dry[0].candidates.find((c) => c.source === 'flaticon');
  assert.equal(png.redistributable, 'unclear');
  assert.equal(png.imageUrl, null);
  assert.equal(flat.commitAdvice, 'url-only');
  assert.equal(JSON.stringify(dry).includes('key='), false);

  const liveDir = join(dir, 'live');
  const fetchImpl = async (url, init) => {
    const u = String(url);
    fetches += 1;
    if (u.includes('api.unsplash.com')) {
      assert.equal(init?.headers?.Authorization, 'Client-ID test-unsplash');
      assert.equal(u.includes('test-unsplash'), false);
      return Response.json({
        results: [{
          id: 'abc',
          alt_description: 'dollhouse',
          urls: { small: 'https://images.unsplash.com/photo-abc?ixid=1' },
          links: {
            html: 'https://unsplash.com/photos/abc',
            download_location: 'https://api.unsplash.com/photos/abc/download',
          },
          user: { name: 'Lee', username: 'lee', links: { html: 'https://unsplash.com/@lee' } },
        }],
      });
    }
    if (u.includes('pixabay.com/api')) {
      assert.ok(u.includes('key=test-pixabay'));
      return Response.json({
        hits: [{
          id: 9,
          pageURL: 'https://pixabay.com/photos/room-9/',
          webformatURL: 'https://cdn.pixabay.com/photo/room.jpg',
          user: 'kim',
          tags: 'room',
        }],
      });
    }
    if (u.includes('cdn.pixabay.com')) {
      return new Response(Uint8Array.from([1, 2, 3]), { status: 200, headers: { 'content-type': 'image/jpeg' } });
    }
    throw new Error(`unexpected ${u.split('?')[0]}`);
  };
  const live = await run(baseOpt({
    themes: [THEMES[0]],
    dryRun: false,
    download: true,
    delayMs: 0,
    outDir: liveDir,
    cacheDir: join(liveDir, '.cache'),
    env: { UNSPLASH_ACCESS_KEY: 'test-unsplash', PIXABAY_API_KEY: 'test-pixabay' },
    fetchImpl,
  }));
  const text = JSON.stringify(live);
  assert.equal(text.includes('test-unsplash'), false);
  assert.equal(text.includes('test-pixabay'), false);
  const hits = live[0].candidates.filter((c) => c.via === 'api');
  assert.ok(hits.some((c) => c.source === 'unsplash' && c.imageUrlUse === 'hotlink' && c.localFile === null));
  const saved = hits.filter((c) => c.localFile);
  assert.ok(saved.length >= 1 && saved.length <= MAX_DOWNLOADS);
  assert.ok(saved.every((c) => c.source === 'pixabay'));
  assert.equal(live[0].mode, 'live');
  assert.equal(fetches > 0, true);

  const bigDir = join(dir, 'big');
  const big = await collectTheme(THEMES[0], baseOpt({
    dryRun: false,
    download: true,
    delayMs: 0,
    outDir: bigDir,
    cacheDir: join(bigDir, '.cache'),
    env: { UNSPLASH_ACCESS_KEY: '', PIXABAY_API_KEY: 'test-pixabay' },
    fetchImpl: async (url) => {
      const u = String(url);
      if (u.includes('pixabay.com/api')) {
        return Response.json({
          hits: [{ id: 3, pageURL: 'https://pixabay.com/photos/x-3/', webformatURL: 'https://cdn.pixabay.com/big.jpg', user: 'kim', tags: 'x' }],
        });
      }
      return new Response(new Uint8Array(MAX_BYTES + 1), {
        status: 200,
        headers: { 'content-type': 'image/jpeg', 'content-length': String(MAX_BYTES + 1) },
      });
    },
  }));
  const bigHit = big.candidates.find((c) => c.via === 'api' && c.source === 'pixabay');
  assert.equal(bigHit.downloadSkipped, 'over-400kb');
  assert.equal(bigHit.localFile, null);
  assert.equal(big.mode, 'partial');

  const leaked = await collectTheme(THEMES[0], baseOpt({
    dryRun: false,
    delayMs: 0,
    outDir: join(dir, 'leak'),
    cacheDir: join(dir, 'leak-cache'),
    env: { UNSPLASH_ACCESS_KEY: '', PIXABAY_API_KEY: 'test-pixabay' },
    fetchImpl: async () => {
      throw new Error('https://pixabay.com/api/?key=test-pixabay failed');
    },
  }));
  assert.equal(JSON.stringify(leaked).includes('test-pixabay'), false);
  assert.equal(leaked.sources.pixabay.error, 'request failed');
}

async function main() {
  const flags = new Set();
  const positionals = [];
  for (const arg of process.argv.slice(2)) {
    if (arg === '--') continue;
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(usage());
      return;
    }
    if (arg.startsWith('--')) flags.add(arg);
    else positionals.push(arg);
  }
  const known = new Set(['--all', '--dry-run', '--download', '--refresh', '--self-check']);
  for (const flag of flags) {
    if (!known.has(flag)) {
      process.stderr.write(`unknown flag ${flag}\n${usage()}`);
      process.exitCode = 1;
      return;
    }
  }
  if (flags.has('--self-check')) {
    await selfCheck();
    process.stdout.write('self-check ok\n');
    return;
  }
  if (flags.has('--all') && positionals.length) {
    process.stderr.write(`pass --all or theme ids, not both\n${usage()}`);
    process.exitCode = 1;
    return;
  }
  const themes = [];
  if (positionals.length === 0) themes.push(...THEMES);
  else {
    for (const id of positionals) {
      const theme = THEMES.find((item) => item.id === id);
      if (!theme) {
        process.stderr.write(`unknown theme ${id}\n${usage()}`);
        process.exitCode = 1;
        return;
      }
      themes.push(theme);
    }
  }
  const manifests = await run(baseOpt({
    themes,
    dryRun: flags.has('--dry-run'),
    download: flags.has('--download'),
    refresh: flags.has('--refresh'),
  }));
  for (const manifest of manifests) {
    const hits = manifest.candidates.filter((c) => c.via === 'api').length;
    const files = manifest.candidates.filter((c) => c.localFile).length;
    process.stdout.write(`${manifest.themeId}  mode=${manifest.mode}  candidates=${manifest.candidates.length}  apiHits=${hits}  files=${files}\n`);
  }
  const missing = manifests[0]?.missingEnv ?? [];
  if (missing.length) process.stdout.write(`env missing: ${missing.join(', ')}\n`);
  if (flags.has('--download') && (flags.has('--dry-run') || missing.includes('PIXABAY_API_KEY'))) {
    process.stdout.write('download skipped: Pixabay live results required\n');
  }
}

const entry = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
if (entry) {
  main().catch((err) => {
    const line = err?.name === 'AssertionError' ? err.message : (err?.name || 'Error');
    process.stderr.write(`${line}\n`);
    process.exitCode = 1;
  });
}
