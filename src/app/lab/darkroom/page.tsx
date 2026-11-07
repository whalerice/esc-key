'use client';

/**
 * Spiral path and loupe. Gray boxes only. Not a theme.
 * Progress and glass position stay on screen — never in the save.
 * Does not request fullscreen.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { layoutContain, type ViewportLayout } from '@/engine/stage/Viewport';
import { Loupe, type LoupePlace } from '@/engine/widgets/Loupe';
import { PathFollow, reelTolerance, spiralPath, type PathPoint } from '@/engine/widgets/PathFollow';

const BOX = 280;

export default function DarkroomLabPage() {
  const padRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<PathFollow | null>(null);
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [layout, setLayout] = useState<ViewportLayout | null>(null);
  const [progress, setProgress] = useState(0);
  const [strays, setStrays] = useState(0);
  const [place, setPlace] = useState<LoupePlace | null>(null);

  useEffect(() => {
    const fit = () => setLayout(layoutContain(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    const glass = glassRef.current;
    if (!pad || !glass) return;
    const points = spiralPath(3, BOX);
    setPoints(points);
    const path = new PathFollow({
      path: points,
      tolerance: reelTolerance(BOX),
      onChange: (next) => setProgress(next),
      onStray: () => setStrays((n) => n + 1),
    });
    pathRef.current = path;
    const loupe = new Loupe();
    const offPath = path.attach(pad);
    const offLoupe = loupe.attach(glass, 48, (next) => setPlace(next));
    return () => {
      offPath();
      offLoupe();
      path.detach();
    };
  }, []);

  return (
    <main className="lab lab-wide">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>붉은 방 위젯</h1>
      <p>회색 상자. 경로와 루페는 값만 낸다. 정답을 모른다. 전체화면은 여기서 열지 않는다.</p>
      {layout && (
        <p>
          contain {Math.round(layout.width)}×{Math.round(layout.height)}
        </p>
      )}
      <section className="lab-frame">
        <div className="gray-box">
          <h2>PathFollow</h2>
          <div ref={padRef} className="darkroom-pad" data-live="spiral">
            {points.filter((_, i) => i % 4 === 0).map((p, i) => (
              <i key={i} className="darkroom-dot" style={{ left: p.x, top: p.y }} />
            ))}
          </div>
          <p>진행 {Math.round(progress * 100)}% · 엉킴 {strays}</p>
          <button
            type="button"
            onClick={() => {
              const path = pathRef.current;
              if (!path) return;
              const i = Math.min(points.length - 1, Math.floor(path.progress * (points.length - 1)) + 1);
              const p = points[i];
              if (p) path.move(p.x, p.y);
            }}
          >
            다음 점
          </button>
        </div>
        <div className="gray-box">
          <h2>Loupe</h2>
          <div ref={glassRef} className="darkroom-pad" data-live="loupe">
            {place && (
              <div
                className="darkroom-glass"
                data-flip={place.flipped ? 'yes' : 'no'}
                style={{ left: place.x - 48, top: place.y - 48, width: 96, height: 96 }}
              />
            )}
          </div>
          <p>
            {place
              ? `${Math.round(place.x)}, ${Math.round(place.y)} · ${place.flipped ? '아래' : '위'}`
              : '손가락을 올리세요'}
          </p>
        </div>
      </section>
    </main>
  );
}
