/**
 * Audit haemu-radio mobile layout at phone/tablet viewports.
 * Usage: pnpm dlx tsx tools/radio-mobile-audit.mts
 */
import puppeteer, { type Page } from 'puppeteer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.RADIO_URL ?? 'http://127.0.0.1:4200/haemu/haemu-radio';
const OUT =
  process.env.RADIO_MEDIA ??
  '/cursor/stores/bc-c703650c-8721-41f7-b8fe-426ff6e55b22/media';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ??
  '/home/ubuntu/.cache/puppeteer/chrome/linux-156.0.8078.47/chrome-linux64/chrome';

async function measure(page: Page) {
  return page.evaluate(`(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const cs = (el, prop) =>
      el ? getComputedStyle(el).getPropertyValue(prop) : null;
    const overlaps = (a, b) =>
      a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const stage = document.querySelector('.theme-play');
    const frame = document.querySelector('.radio-frame');
    const flow = document.querySelector('.radio-flow');
    const inv = document.querySelector('.hud-inventory');
    const narr = document.querySelector('.narration');
    const narrText = document.querySelector('.narration-text');
    const rotate = document.querySelector('.engine-overlay.rotate');
    const popup = document.querySelector('.radio-popup-panel');
    const scroll = document.querySelector('.radio-popup-scroll');
    const closeBtn = document.querySelector('.radio-popup-close');
    const scrim = document.querySelector('.radio-popup-scrim');

    const hits = [...document.querySelectorAll('.radio-hit')].map((el) => {
      const r = box(el);
      return {
        hit: el.dataset.hit,
        ...r,
        tiny: r.w < 44 || r.h < 44,
      };
    });
    const exits = [...document.querySelectorAll('.radio-exit')].map((el) => {
      const r = box(el);
      const style = getComputedStyle(el);
      return {
        exit: el.dataset.exit || el.dataset.dir,
        ...r,
        tiny: r.w < 44 || r.h < 44,
        display: style.display,
        pointerEvents: style.pointerEvents,
      };
    });

    const invBox = box(inv);
    const narrBox = box(narr);
    const exitOverlapsInv = exits.filter((e) => overlaps(e, invBox)).map((e) => e.exit);
    const exitOverlapsNarr = exits.filter((e) => overlaps(e, narrBox)).map((e) => e.exit);

    let captionClip = null;
    if (narrText && narr) {
      const panel = narr.querySelector('.narration-panel');
      const tb = narrText.getBoundingClientRect();
      const pb = panel ? panel.getBoundingClientRect() : null;
      captionClip = {
        textOverflow: getComputedStyle(narrText).overflow,
        panelOverflow: panel ? getComputedStyle(panel).overflow : 'n/a',
        textLeft: tb.left,
        panelLeft: pb ? pb.left : null,
        textRight: tb.right,
        panelRight: pb ? pb.right : null,
        ok: pb ? tb.left >= pb.left - 1 && tb.right <= pb.right + 2 : false,
      };
    }

    const hudRight = document.querySelector('.hud-right');
    const hudLeft = document.querySelector('.hud-left');

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      orientation: window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait',
      rotateShown: !!rotate,
      stage: box(stage),
      frame: box(frame),
      flow: {
        box: box(flow),
        open: flow ? flow.dataset.open : null,
        overflow: cs(flow, 'overflow'),
        padding: cs(flow, 'padding'),
      },
      inv: invBox,
      hudRight: box(hudRight),
      hudLeft: box(hudLeft),
      narr: narrBox,
      hits,
      exits,
      exitOverlapsInv,
      exitOverlapsNarr,
      tinyHits: hits.filter((h) => h.tiny),
      tinyExits: exits.filter((e) => e.tiny && e.display !== 'none'),
      popup: popup
        ? {
            box: box(popup),
            scroll: scroll
              ? {
                  box: box(scroll),
                  scrollH: scroll.scrollHeight,
                  clientH: scroll.clientHeight,
                  overflowY: cs(scroll, 'overflow-y'),
                }
              : null,
            close: box(closeBtn),
            scrim: box(scrim),
            closeTiny: (() => {
              const c = box(closeBtn);
              return c ? c.w < 44 || c.h < 44 : null;
            })(),
          }
        : null,
      captionClip,
      bodyOverflow: cs(document.body, 'overflow'),
      htmlOverflow: cs(document.documentElement, 'overflow'),
      safe: {
        top: cs(document.documentElement, '--safe-top'),
        right: cs(document.documentElement, '--safe-right'),
        bottom: cs(document.documentElement, '--safe-bottom'),
        left: cs(document.documentElement, '--safe-left'),
      },
    };
  })()`);
}

async function boot(page: Page) {
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60_000 });
  await page.waitForSelector('.gate-btn, .theme-play[data-theme="haemu-radio"]', {
    timeout: 30_000,
  });
  const buttons = await page.$$('.gate-btn:not([disabled])');
  if (buttons.length) {
    await buttons[buttons.length - 1]!.click();
  }
  await page.waitForSelector('.radio-stage, .engine-overlay.rotate', { timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 600));
}

async function dismissCaptions(page: Page) {
  for (let i = 0; i < 12; i++) {
    const narr = await page.$('.narration');
    if (!narr) break;
    await narr.click();
    await new Promise((r) => setTimeout(r, 120));
  }
}

async function openDoorPopup(page: Page) {
  await dismissCaptions(page);
  const door = await page.$('.radio-hit[data-hit="door"]');
  if (door) {
    await door.click();
    await page.waitForSelector('.radio-popup-panel', { timeout: 5000 }).catch(() => null);
    await new Promise((r) => setTimeout(r, 300));
  }
}

const VIEWPORTS = [
  { name: 'phone-portrait', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'phone-landscape', width: 844, height: 390, isMobile: true, hasTouch: true },
  { name: 'tablet-portrait', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'tablet-landscape', width: 1024, height: 768, isMobile: true, hasTouch: true },
];

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const report: Record<string, unknown> = {};

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
  });
  await boot(page);
  const base = (await measure(page)) as Record<string, unknown>;
  await page.screenshot({
    path: join(OUT, `radio-mobile-${vp.name}.png`),
    fullPage: false,
  });

  let withPopup: unknown = null;
  if (base.orientation === 'landscape' && !base.rotateShown) {
    await openDoorPopup(page);
    withPopup = await measure(page);
    await page.screenshot({
      path: join(OUT, `radio-mobile-${vp.name}-popup.png`),
      fullPage: false,
    });
  }

  if (base.orientation === 'landscape' && !base.rotateShown) {
    await page.evaluate(`(() => {
      const key = 'escape:haemu-radio';
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      if (!data.state) data.state = {};
      data.state.items = ['큐시트', '봉투', '카트테이프', '열쇠고리'];
      data.state.captionQueue = [
        { kind: 'narration', text: '안개가 부조정실 유리를 천천히 밀어 올린다. 이어폰을 권장합니다.' },
      ];
      localStorage.setItem(key, JSON.stringify(data));
    })()`);
    await page.reload({ waitUntil: 'networkidle0' });
    await boot(page);
    await new Promise((r) => setTimeout(r, 400));
    const rich = await measure(page);
    await page.screenshot({
      path: join(OUT, `radio-mobile-${vp.name}-hud.png`),
      fullPage: false,
    });
    report[vp.name] = { base, withPopup, rich };
  } else {
    report[vp.name] = { base, withPopup };
  }

  await page.close();
}

writeFileSync(join(OUT, 'radio-mobile-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
