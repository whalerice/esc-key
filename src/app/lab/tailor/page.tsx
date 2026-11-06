'use client';

/**
 * Try 19-13 step 5. Gray boxes only. Not a theme.
 * Needle, stitch progress, and rip count stay on screen — never in the save.
 * Does not request fullscreen.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Hud } from '@/engine/ui/Hud';
import { hudCollapsed } from '@/engine/ui/hudCollapse';
import { layoutContain, type ViewportLayout } from '@/engine/stage/Viewport';
import { SeamRip, type SeamStitch } from '@/engine/widgets/SeamRip';
import {
  SewingMachine,
  type SewPoint,
  type SewSnapshot,
  type SewStitch,
} from '@/engine/widgets/SewingMachine';

const COLLAPSE = ['sewing-straight', 'sewing-curve'];
const STRAIGHT: SewPoint[] = [
  { x: 0, y: 0 },
  { x: 0, y: 240 },
];

function arcPath(): SewPoint[] {
  const r = 90;
  const pts: SewPoint[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = (Math.PI / 2) * (i / 8);
    pts.push({ x: r - r * Math.cos(a), y: r * Math.sin(a) });
  }
  return pts;
}

const PLOT = 0.62;

export default function TailorLabPage() {
  const sewRef = useRef<HTMLDivElement>(null);
  const ripRef = useRef<HTMLDivElement>(null);
  const machineRef = useRef<SewingMachine | null>(null);
  const ripApi = useRef<SeamRip | null>(null);

  const [layout, setLayout] = useState<ViewportLayout | null>(null);
  const [snap, setSnap] = useState<SewSnapshot | null>(null);
  const [stitches, setStitches] = useState<SewStitch[]>([]);
  const [sewNote, setSewNote] = useState('대기');
  const [pedal, setPedal] = useState(false);
  const [curve, setCurve] = useState(false);
  const [oneHand, setOneHand] = useState(false);
  const [pathPts, setPathPts] = useState<SewPoint[]>(STRAIGHT);
  const [seam, setSeam] = useState<SeamStitch[]>([]);
  const [left, setLeft] = useState(7);
  const [stray, setStray] = useState(0);
  const [ripNote, setRipNote] = useState('대기');
  const [scene, setScene] = useState('shop');
  const [hint, setHint] = useState('—');

  const collapsed = hudCollapsed(scene, COLLAPSE);

  useEffect(() => {
    const fit = () => setLayout(layoutContain(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const pad = sewRef.current;
    const ripPad = ripRef.current;
    if (!pad || !ripPad) return;

    const machine = new SewingMachine({
      path: STRAIGHT,
      onStitch: (offset) => setSewNote(`땀 ${offset.toFixed(1)}`),
      onBunch: () => setSewNote('뭉침'),
      onBigMiss: (offset) => setSewNote(`크게 벗어남 ${offset.toFixed(1)}`),
      onReachEnd: (ratio) => setSewNote(`끝 ${ratio.toFixed(2)}`),
      onSpeed: (stage) => setSewNote(`속도 ${stage}`),
    });
    const rip = new SeamRip({
      count: 7,
      onRipped: (index) => setRipNote(`뜯김 ${index}`),
      onStray: () => {
        setStray((n) => n + 1);
        setRipNote('천까지 찢을 뻔했다');
      },
      onComplete: () => setRipNote('땀 없음'),
      onChange: (n) => setLeft(n),
    });
    machineRef.current = machine;
    ripApi.current = rip;
    setSeam(rip.stitches.map((s) => ({ ...s })));
    const offSew = machine.attach(pad);
    const offRip = rip.attach(ripPad);
    const timer = window.setInterval(() => {
      machine.tick(performance.now());
      setSnap(machine.snapshot());
      setStitches(machine.stitches.map((s) => ({ ...s })));
      setSeam(rip.stitches.map((s) => ({ ...s })));
    }, 100);
    return () => {
      window.clearInterval(timer);
      offSew();
      offRip();
      machineRef.current = null;
      ripApi.current = null;
    };
  }, []);

  function togglePedal() {
    const next = !pedal;
    setPedal(next);
    machineRef.current?.setPedal(next, performance.now());
  }

  function steer(dx: number, dy: number) {
    machineRef.current?.nudgeCloth(dx, dy, performance.now());
  }

  function toggleCurve() {
    const machine = machineRef.current;
    if (!machine) return;
    const next = !curve;
    const path = next ? arcPath() : STRAIGHT;
    machine.setCurve(next);
    machine.setPath(path);
    machine.setPedal(false, performance.now());
    setCurve(next);
    setPathPts(path);
    setPedal(false);
    setSewNote('대기');
  }

  function toggleHand() {
    const next = !oneHand;
    setOneHand(next);
    machineRef.current?.setOneHand(next);
  }

  return (
    <main className="lab lab-wide">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>한 땀 위젯</h1>
      <p>회색 상자. 바늘·진행·뜯기는 값만 내고 저장하지 않는다. 맞았는지는 여기 없다.</p>

      <section
        className="lab-stage"
        data-logical="1920x1080"
        style={layout ? { width: layout.width } : undefined}
      >
        <div className="lab-frame">
          <article className="gray-box">
            <h2>SewingMachine</h2>
            <div ref={sewRef} className="sew-pad" aria-label="재봉틀">
              <svg className="sew-plot" viewBox="0 0 240 170" width="240" height="170" aria-hidden>
                <polyline
                  points={pathPts
                    .map((p) => `${120 + p.x * PLOT},${8 + p.y * PLOT}`)
                    .join(' ')}
                  fill="none"
                  stroke="#9a9a9a"
                  strokeWidth="2"
                />
              </svg>
              {stitches.map((stitch, i) => (
                <i
                  key={`${stitch.progress}-${i}`}
                  className="sew-stitch"
                  style={{
                    left: 120 + stitch.x * PLOT,
                    top: 8 + stitch.y * PLOT,
                    transform: `rotate(${stitch.angle}deg)`,
                  }}
                />
              ))}
              {snap && (
                <i
                  className="sew-needle"
                  style={{
                    left: 120 + snap.needle.x * PLOT,
                    top: 8 + snap.needle.y * PLOT,
                  }}
                />
              )}
              <div className="role-pedal">페달</div>
              <div className="role-cloth">천</div>
            </div>
            <div className="lab-row">
              <button type="button" aria-pressed={pedal} onClick={togglePedal}>
                {pedal ? '페달 끄기' : '페달 켜기'}
              </button>
              <button type="button" onClick={() => steer(-12, 0)}>
                천 ←
              </button>
              <button type="button" onClick={() => steer(12, 0)}>
                천 →
              </button>
              <button type="button" onClick={() => steer(0, 12)}>
                천 아래
              </button>
            </div>
            <div className="lab-row">
              <button type="button" aria-pressed={curve} onClick={toggleCurve}>
                곡선 {curve ? '켬' : '끔'}
              </button>
              <button type="button" aria-pressed={oneHand} onClick={toggleHand}>
                한 손 {oneHand ? '켬' : '끔'}
              </button>
              <button
                type="button"
                onClick={() => {
                  machineRef.current?.reset();
                  setPedal(false);
                  setSewNote('대기');
                }}
              >
                처음부터
              </button>
            </div>
            <p data-speed={snap?.speed ?? 0}>속도 {snap?.speed ?? 0}</p>
            <p data-progress={(snap?.progress ?? 0).toFixed(2)}>
              진행 {(snap?.progress ?? 0).toFixed(2)} · 어긋남 {(snap?.offset ?? 0).toFixed(1)}
            </p>
            <p data-needle={`${(snap?.needle.x ?? 0).toFixed(0)},${(snap?.needle.y ?? 0).toFixed(0)}`}>
              바늘 {(snap?.needle.x ?? 0).toFixed(0)}, {(snap?.needle.y ?? 0).toFixed(0)} · 땀{' '}
              {snap?.stitches ?? 0} · 비율 {(snap?.crookedRatio ?? 0).toFixed(2)}
            </p>
            <p data-angle={(snap?.clothAngle ?? 0).toFixed(0)}>
              천 각도 {(snap?.clothAngle ?? 0).toFixed(0)}°
            </p>
            <p data-sew={sewNote}>{sewNote}</p>
          </article>

          <article className="gray-box">
            <h2>SeamRip</h2>
            <div ref={ripRef} className="rip-pad" aria-label="시접">
              {seam.map((stitch) => (
                <i
                  key={stitch.index}
                  className="rip-dot"
                  data-ripped={stitch.ripped ? 'yes' : 'no'}
                  style={{ left: stitch.x, top: stitch.y }}
                />
              ))}
            </div>
            <div className="lab-row">
              <button type="button" onClick={() => ripApi.current?.move(8, 160)}>
                벗어난 드래그
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = ripApi.current?.stitches.find((s) => !s.ripped);
                  if (next) ripApi.current?.rip(next.index);
                }}
              >
                다음 땀
              </button>
            </div>
            <p data-left={left}>남은 땀 {left}</p>
            <p data-stray={stray}>벗어남 {stray}</p>
            <p data-rip={ripNote}>{ripNote}</p>
          </article>

          <article className="gray-box">
            <h2>HUD 접기</h2>
            <div className="lab-row">
              {(
                [
                  ['shop', '가게'],
                  ['sewing-straight', '직선 재봉'],
                  ['sewing-curve', '곡선 재봉'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={scene === id}
                  onClick={() => setScene(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="hud-demo">
              <Hud
                collapsed={collapsed}
                inventoryName="반짇고리"
                itemCount={1}
                itemLabels={['실뜯개']}
                timerLabel="21:04"
                notebook
                onHint={() => setHint('골무')}
              />
              {collapsed && (
                <button type="button" className="scene-thimble" onClick={() => setHint('장면 골무')}>
                  골무
                </button>
              )}
            </div>
            <p data-collapsed={collapsed ? 'yes' : 'no'}>
              접힘 {collapsed ? '예' : '아니오'} · 장면 {scene}
            </p>
            <p data-hint={hint}>힌트 {hint}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
