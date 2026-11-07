'use client';

/**
 * Stroke pad and breath loudness. Gray boxes only. Not a theme.
 * Strokes and loud milliseconds stay on screen — never in the save.
 * Does not request fullscreen.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { layoutContain, type ViewportLayout } from '@/engine/stage/Viewport';
import { BreathDetector, BREATH_NEED_MS } from '@/engine/sensors/BreathDetector';
import { StrokePad, type Stroke } from '@/engine/widgets/StrokePad';

export default function GreenhouseLabPage() {
  const padRef = useRef<HTMLDivElement>(null);
  const breathRef = useRef<HTMLButtonElement>(null);
  const [layout, setLayout] = useState<ViewportLayout | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [loud, setLoud] = useState(0);
  const [fails, setFails] = useState(0);
  const [fallback, setFallback] = useState(false);
  const [mic, setMic] = useState('대기');

  useEffect(() => {
    const fit = () => setLayout(layoutContain(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    const breathEl = breathRef.current;
    if (!pad || !breathEl) return;
    const strokesApi = new StrokePad((next) => {
      setStrokes(next.map((stroke) => stroke.map((point) => ({ ...point }))));
    });
    const breath = new BreathDetector();
    breath.start();
    const offPad = strokesApi.attach(pad);
    const offHold = breath.attachHold(breathEl, (ms) => {
      setLoud(ms);
      setFails(breath.fails);
      setFallback(breath.fallback);
    });
    breathEl.addEventListener('pointerup', onUp);
    return () => {
      breathEl.removeEventListener('pointerup', onUp);
      offPad();
      offHold();
      breath.disarmMic();
      breath.stop();
    };

    function onUp() {
      if (breath.loudMs >= BREATH_NEED_MS) {
        breath.release(true);
        breath.loudMs = 0;
        setLoud(0);
        return;
      }
      const fell = breath.release(false);
      breath.loudMs = 0;
      setLoud(0);
      setFails(breath.fails);
      setFallback(fell);
    }
  }, []);

  return (
    <main className="lab lab-wide">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>겨울 온실 위젯</h1>
      <p>회색 상자. 획과 입김 시간은 값만 낸다. 글자를 읽지 않는다. 전체화면은 여기서 열지 않는다.</p>
      {layout && (
        <p>
          contain {Math.round(layout.width)}×{Math.round(layout.height)}
        </p>
      )}
      <section className="lab-frame">
        <div className="gray-box">
          <h2>StrokePad</h2>
          <div ref={padRef} className="greenhouse-pad" data-live="strokes" />
          <p>획 {strokes.length}</p>
          <svg viewBox="0 0 100 100" className="greenhouse-preview" aria-hidden>
            {strokes.map((stroke, index) => (
              <polyline
                key={index}
                fill="none"
                stroke="#ddd"
                strokeWidth="1.5"
                points={stroke.map((point) => `${point.x * 100},${point.y * 100}`).join(' ')}
              />
            ))}
          </svg>
        </div>
        <div className="gray-box">
          <h2>BreathDetector</h2>
          <button ref={breathRef} type="button" className="gray-hit">
            후— 길게
          </button>
          <p>
            {loud}ms / {BREATH_NEED_MS} · 실패 {fails} · {fallback ? '길게 누르기로' : '입김'}
          </p>
          <button
            type="button"
            onClick={() => {
              const breath = new BreathDetector();
              void breath.armMic((ms) => setLoud(ms)).then((ok) => {
                setMic(ok ? '마이크 켬' : '마이크 없음');
                window.setTimeout(() => breath.disarmMic(), 4000);
              });
            }}
          >
            마이크 4초
          </button>
          <p>{mic}</p>
        </div>
      </section>
    </main>
  );
}
