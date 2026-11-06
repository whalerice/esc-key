'use client';

/**
 * Try 19-13 step 4. Gray boxes only. Not a theme.
 * Beam angle, rhythm spans, and morse stay on screen — never in the save.
 * Does not request fullscreen.
 */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { claimTwoFinger, releaseTwoFinger } from '@/engine/input/gestures';
import { BeamMask } from '@/engine/fx/BeamMask';
import { MorseInput } from '@/engine/widgets/MorseInput';
import { RhythmPress, type RhythmSpan } from '@/engine/widgets/RhythmPress';
import { FloorNav } from '@/engine/ui/FloorNav';
import { layoutContain, type ViewportLayout } from '@/engine/stage/Viewport';
import type { FloorStop } from '@/engine/types';

const BEAM_WIDTH = 24;
const FLOORS: FloorStop[] = [
  { id: '1', name: '당직실', band: '#3a6ea5' },
  { id: '2', name: '무적실', band: '#3d7a4a' },
  { id: '3', name: '창고', band: '#d8d4cc' },
  { id: '4', name: '위 당직실', band: '#1c1c1c' },
  { id: '5', name: '기계실', band: '#c4a024' },
  { id: '6', name: '등실', band: '#8c2f2f' },
];
const MARKS = [
  { id: 'a', deg: 60 },
  { id: 'b', deg: 100 },
  { id: 'c', deg: 150 },
];
const GUIDE: RhythmSpan[] = [
  { kind: 'press', ms: 2000 },
  { kind: 'rest', ms: 2000 },
  { kind: 'press', ms: 2000 },
];

export default function LighthouseLabPage() {
  const padRef = useRef<HTMLDivElement>(null);
  const rhythmRef = useRef<HTMLButtonElement>(null);
  const shutterRef = useRef<HTMLButtonElement>(null);
  const beamRef = useRef<BeamMask | null>(null);
  const rhythmApi = useRef<RhythmPress | null>(null);
  const morseRef = useRef<MorseInput | null>(null);

  const [layout, setLayout] = useState<ViewportLayout | null>(null);
  const [deg, setDeg] = useState(40);
  const [inside, setInside] = useState('—');
  const [hit, setHit] = useState('—');
  const [held, setHeld] = useState('—');
  const [particles, setParticles] = useState(true);
  const [quiet, setQuiet] = useState(false);
  const [markB, setMarkB] = useState(100);
  const [pinch, setPinch] = useState('빔이 두 손가락 회전을 잡고 있다');
  const [spans, setSpans] = useState<RhythmSpan[]>([]);
  const [holdMs, setHoldMs] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [letter, setLetter] = useState('—');
  const [visited, setVisited] = useState<string[]>(['1']);
  const [floor, setFloor] = useState('1');

  useEffect(() => {
    const fit = () => setLayout(layoutContain(window.innerWidth, window.innerHeight));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    const rhythmEl = rhythmRef.current;
    const shutter = shutterRef.current;
    if (!pad || !rhythmEl || !shutter) return;

    const beam = new BeamMask({
      min: 40,
      max: 180,
      widthDeg: BEAM_WIDTH,
      targets: MARKS.map((m) => ({ ...m })),
      onChange: (next) => setDeg(next),
      onInBeam: (id) => setHit(id),
      onHeld: (id, ms) => setHeld(`${id} ${ms}ms`),
    });
    const rhythm = new RhythmPress({
      onChange: (next) => setSpans(next.map((span) => ({ ...span }))),
    });
    const morse = new MorseInput({
      onChange: (next) => setCode(next),
      onLetter: (next) => setLetter(next),
    });
    beamRef.current = beam;
    rhythmApi.current = rhythm;
    morseRef.current = morse;
    setDeg(beam.deg);

    const offBeam = beam.attach(pad);
    const offRhythm = rhythm.attach(rhythmEl);
    const offMorse = morse.attach(shutter);
    pad.dataset.live = 'yes';
    const timer = window.setInterval(() => {
      const now = performance.now();
      beam.sample(now);
      morse.tick(now);
      setInside(beam.inside().join(' ') || '—');
      setParticles(beam.showParticles());
      setHoldMs(rhythm.holding(now));
    }, 100);

    return () => {
      window.clearInterval(timer);
      offBeam();
      offRhythm();
      offMorse();
      beamRef.current = null;
      rhythmApi.current = null;
      morseRef.current = null;
    };
  }, []);

  function tryPinch() {
    const owner = {};
    try {
      claimTwoFinger(owner, 'pinch');
      releaseTwoFinger(owner);
      setPinch('회전 클레임이 없어 핀치가 통과했다');
    } catch (err) {
      setPinch(err instanceof Error ? err.message : '핀치 거부');
    }
  }

  function toggleQuiet() {
    const beam = beamRef.current;
    const next = !quiet;
    setQuiet(next);
    if (beam) {
      beam.reduceEffects = next;
      setParticles(beam.showParticles());
    }
  }

  const from = deg - BEAM_WIDTH / 2;
  const soft = Math.max(0, BEAM_WIDTH - 6);

  return (
    <main className="lab lab-wide">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>등대 위젯</h1>
      <p>회색 상자. 빔·리듬·모스는 값만 내고 저장하지 않는다. 맞았는지는 여기 없다.</p>

      <section
        className="lab-stage"
        data-logical="1920x1080"
        style={layout ? { width: layout.width } : undefined}
      >
        <div className="lab-frame">
          <article className="gray-box">
            <h2>BeamMask</h2>
            <div ref={padRef} className="beam-pad" aria-label="탐조등">
              <div
                className="beam-wedge"
                style={{
                  background: `conic-gradient(from ${from}deg, rgba(230,230,230,0.95) 0deg, rgba(170,170,170,0.35) ${soft}deg, transparent ${BEAM_WIDTH}deg, transparent 360deg)`,
                }}
              />
              {particles &&
                [0, 1, 2, 3].map((i) => (
                  <span key={i} className="beam-dot" style={polar(deg, 16 + i * 9)} />
                ))}
              {MARKS.map((mark) => (
                <span
                  key={mark.id}
                  className="beam-mark"
                  data-lit={inside.split(' ').includes(mark.id) ? 'yes' : 'no'}
                  style={polar(mark.id === 'b' ? markB : mark.deg, 42)}
                >
                  {mark.id}
                </span>
              ))}
            </div>
            <div className="lab-row">
              <button type="button" onClick={() => beamRef.current?.nudge(-10)}>
                −10°
              </button>
              <button type="button" onClick={() => beamRef.current?.nudge(10)}>
                +10°
              </button>
              <button type="button" onClick={tryPinch}>
                핀치 시도
              </button>
            </div>
            <label className="lab-range">
              표적 b
              <input
                type="range"
                min={40}
                max={180}
                value={markB}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setMarkB(next);
                  beamRef.current?.setTarget('b', next);
                }}
              />
            </label>
            <p data-deg={deg.toFixed(1)}>방위 {deg.toFixed(1)}° (저장 안 함)</p>
            <p data-inside={inside}>빛 안 {inside}</p>
            <p>들어옴 {hit} · 유지 {held}</p>
            <p>{pinch}</p>
          </article>

          <article className="gray-box">
            <h2>RhythmPress</h2>
            <div className="rhythm-bar" aria-hidden>
              {GUIDE.map((span, i) => (
                <i key={`g${i}`} className={span.kind} style={{ width: barWidth(span.ms) }} />
              ))}
            </div>
            <div className="rhythm-bar" data-spans={spans.length}>
              {spans.map((span, i) => (
                <i key={`${span.kind}${i}`} className={span.kind} style={{ width: barWidth(span.ms) }} />
              ))}
              {holdMs != null && <i className="press live" style={{ width: barWidth(holdMs) }} />}
            </div>
            <button ref={rhythmRef} type="button" className="gray-hit">
              누르기
            </button>
            <button type="button" onClick={() => rhythmApi.current?.clear()}>
              비우기
            </button>
            <p>{spans.map((s) => `${s.kind === 'press' ? '눌림' : '쉼'} ${(s.ms / 1000).toFixed(1)}초`).join(' · ') || '아직 없음'}</p>
          </article>

          <article className="gray-box">
            <h2>MorseInput</h2>
            <p className="morse-read" data-code={code}>
              {code || '대기'}
            </p>
            <button ref={shutterRef} type="button" className="gray-hit">
              셔터
            </button>
            <button
              type="button"
              onClick={() => {
                morseRef.current?.clear();
                setLetter('—');
              }}
            >
              비우기
            </button>
            <p data-letter={letter}>신호 {letter}</p>
          </article>

          <article className="gray-box">
            <h2>FloorNav</h2>
            <FloorNav
              floors={FLOORS}
              visited={visited}
              current={floor}
              reduceEffects={quiet}
              onGo={setFloor}
            />
            <div className="lab-row">
              <button
                type="button"
                onClick={() => {
                  const next = FLOORS.find((item) => !visited.includes(item.id));
                  if (next) setVisited((list) => [...list, next.id]);
                }}
              >
                다음 층 개방
              </button>
              <button type="button" onClick={toggleQuiet}>
                효과 줄이기 {quiet ? '켬' : '끔'}
              </button>
            </div>
            <p data-floor={floor}>현재 {floor}층</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function barWidth(ms: number): string {
  return `${Math.max(4, Math.round(ms / 40))}px`;
}

/** Compass: 0° is up. `radius` is % of the pad. */
function polar(deg: number, radius: number): { left: string; top: string } {
  const rad = (deg * Math.PI) / 180;
  return {
    left: `${50 + Math.sin(rad) * radius}%`,
    top: `${50 - Math.cos(rad) * radius}%`,
  };
}
