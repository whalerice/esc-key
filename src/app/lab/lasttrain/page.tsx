'use client';

/**
 * Viewfinder and cheonjiin keypad. Gray boxes only. Not a theme.
 * The rect and the composed string stay on screen — never in the save.
 * Does not request fullscreen.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { layoutContain, type ViewportLayout } from '@/engine/stage/Viewport';
import { Viewfinder, type ViewRect } from '@/engine/fx/Viewfinder';
import { Keypad } from '@/engine/widgets/Keypad';

export default function LasttrainLabPage() {
  const padRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ViewportLayout | null>(null);
  const [rect, setRect] = useState<ViewRect | null>(null);
  const [shot, setShot] = useState('대기');
  const [digits, setDigits] = useState('');
  const [hangul, setHangul] = useState('');

  useEffect(() => {
    const fit = () => setLayout(layoutContain(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    const finder = new Viewfinder();
    return finder.attach(pad, (next) => setRect(next));
  }, []);

  const coversMark = rect ? rect.x <= 180 && rect.x + rect.w >= 220 && rect.y <= 80 && rect.y + rect.h >= 120 : false;

  return (
    <main className="lab lab-wide">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>막차 이후 위젯</h1>
      <p>회색 상자. 창과 글자는 값만 낸다. 정답을 모른다. 전체화면은 여기서 열지 않는다.</p>
      {layout && (
        <p>
          contain {Math.round(layout.width)}×{Math.round(layout.height)}
        </p>
      )}
      <section className="lab-frame">
        <div className="gray-box">
          <h2>Viewfinder</h2>
          <div ref={padRef} className="lasttrain-pad" data-live="viewfinder">
            <i className="lasttrain-spot" style={{ left: 180, top: 80, width: 40, height: 40 }}>
              점
            </i>
            {rect && (
              <div
                className="lasttrain-finder"
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              />
            )}
          </div>
          <button type="button" onClick={() => setShot(coversMark ? '점' : '빈칸')}>
            셔터
          </button>
          <p>
            {rect ? `${Math.round(rect.x)},${Math.round(rect.y)} ${rect.flipped ? '아래' : '위'}` : '아직'} · {shot}
          </p>
        </div>
        <div className="gray-box">
          <h2>Keypad 천지인</h2>
          <p>숫자</p>
          <Keypad mode="cheonjiin" script="digit" value={digits} onChange={setDigits} />
          <p>한글</p>
          <Keypad mode="cheonjiin" script="hangul" value={hangul} onChange={setHangul} />
        </div>
      </section>
    </main>
  );
}
