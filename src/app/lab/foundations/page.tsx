'use client';

/**
 * Try the 19-13 steps 1–3. Not a theme.
 * Frequency stays in this component — never in the save.
 */
import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { claimTwoFinger, releaseTwoFinger } from '@/engine/input/gestures';
import { MultiPointerRoles } from '@/engine/input/multiPointerRoles';
import { resolveOnZero, timerFace } from '@/engine/systems/Timer';
import { TimerFace } from '@/engine/ui/TimerFace';
import { DISTANCE, RadioBed } from '@/engine/audio/RadioBed';
import { playHtml5Clip, stopHtml5Clips } from '@/engine/audio/html5Clip';
import { unlockAudio } from '@/engine/audio/SoundManager';
import { TuningKnob } from '@/engine/widgets/TuningKnob';

const DURATION = 30 * 60_000;
const JUMPS = [
  ['0분', 0],
  ['20분 (10분 남음)', 20 * 60_000],
  ['29분 (1분 남음)', 29 * 60_000],
  ['30분', 30 * 60_000],
] as const;

export default function FoundationsPage() {
  const [elapsed, setElapsed] = useState(0);
  const [p7, setP7] = useState(false);
  const [freeze, setFreeze] = useState(false);
  const [freq, setFreq] = useState(87);
  const [signal, setSignal] = useState(0);
  const [hit, setHit] = useState('—');
  const [locked, setLocked] = useState('—');
  const [clue, setClue] = useState('대기');
  const [cueName, setCueName] = useState('—');
  const [pinchMsg, setPinchMsg] = useState('노브가 두 손가락 회전을 잡고 있다');
  const [roles, setRoles] = useState('손가락을 대 보세요');
  const knobEl = useRef<HTMLDivElement>(null);
  const bedRef = useRef<RadioBed | null>(null);
  const rolesRef = useRef(new MultiPointerRoles());
  const urls = useRef<{ bed: string; later: string; clue: string } | null>(null);
  const clockRef = useRef<number | null>(null);

  useEffect(() => {
    const el = knobEl.current;
    if (!el) return;
    const knob = new TuningKnob({
      min: 87,
      max: 89,
      perTurn: 1,
      snap: 0.1,
      stations: [{ freq: 87.9, width: 0.15, soundId: 'old-broadcast' }],
      onChange: (value) => setFreq(value),
      onSignal: (next) => {
        setSignal(next);
        bedRef.current?.setSignal(next);
      },
      onFirstHit: (station) => setHit(station.soundId),
      onLock: (station) => {
        setLocked(station.soundId);
        const url = urls.current?.clue;
        if (url) {
          playHtml5Clip(url);
          setClue('HTML5 재생');
        }
      },
    });
    const off = knob.attach(el);
    return () => {
      off();
      if (clockRef.current != null) window.clearInterval(clockRef.current);
      bedRef.current?.dispose();
      bedRef.current = null;
      stopHtml5Clips();
    };
  }, []);

  const faces = [
    {
      title: 'onair-clock',
      model: timerFace({
        skin: 'onair-clock',
        durationMs: DURATION,
        elapsedMs: elapsed,
        startClock: '02:00',
      }),
      ending: resolveOnZero('B', {}),
    },
    {
      title: 'watch-clock',
      model: timerFace({
        skin: 'watch-clock',
        durationMs: DURATION,
        elapsedMs: elapsed,
        startClock: '02:00',
        watchLamp: 'standby',
      }),
      ending: resolveOnZero(
        [
          { if: { solved: 'P7' }, ending: 'B2' },
          { ending: 'B1' },
        ],
        p7 ? { P7: true } : {},
      ),
    },
    {
      title: 'thread-spool',
      model: timerFace({
        skin: 'thread-spool',
        durationMs: DURATION,
        elapsedMs: elapsed,
        startClock: '21:00',
        displayOverride: freeze ? '21:30' : undefined,
      }),
      ending: resolveOnZero(
        [
          { if: { solved: 'P7' }, ending: 'B2' },
          { ending: 'B1' },
        ],
        p7 ? { P7: true } : {},
      ),
    },
  ];

  const deg = (freq - 87) * 360;

  function startBed() {
    unlockAudio();
    if (!urls.current) {
      urls.current = {
        bed: toneWav(220, 1.2),
        later: toneWav(330, 1.2),
        clue: toneWav(660, 0.35),
      };
    }
    bedRef.current?.dispose();
    const bed = new RadioBed(
      {
        cues: [
          { at: '02:00', soundId: 'bed' },
          { at: '02:00:08', soundId: 'later' },
        ],
      },
      { sounds: { bed: urls.current.bed, later: urls.current.later }, startClock: '02:00' },
    );
    bed.setSignal(signal);
    bed.sync(0);
    bedRef.current = bed;
    setCueName(bed.activeSoundId() ?? '—');
    if (clockRef.current != null) window.clearInterval(clockRef.current);
    const started = performance.now();
    clockRef.current = window.setInterval(() => {
      const ms = performance.now() - started;
      bed.sync(ms);
      setCueName(bed.activeSoundId() ?? '—');
    }, 250);
  }

  function onRolePointer(e: PointerEvent<HTMLDivElement>, kind: 'down' | 'up') {
    const pad = e.currentTarget;
    pad.setPointerCapture(e.pointerId);
    const rect = pad.getBoundingClientRect();
    const rolesNow = rolesRef.current;
    if (kind === 'down') {
      rolesNow.down(
        e.pointerId,
        e.clientX - rect.left,
        e.clientY - rect.top,
        rect.width,
        rect.height,
      );
    } else {
      rolesNow.up(e.pointerId);
    }
    const pedal = rolesNow.ids('pedal').length;
    const cloth = rolesNow.ids('cloth').length;
    setRoles(`페달 ${pedal} · 천 ${cloth}`);
  }

  function tryPinch() {
    const owner = {};
    try {
      claimTwoFinger(owner, 'pinch');
      releaseTwoFinger(owner);
      setPinchMsg('회전 클레임이 없어 핀치가 통과했다');
    } catch (err) {
      setPinchMsg(err instanceof Error ? err.message : '핀치 거부');
    }
  }

  return (
    <main className="lab">
      <p>
        <Link href="/">← 허브</Link>
      </p>
      <h1>엔진 시험</h1>
      <p>두 손가락 회전, 시계 스킨 3종, 라디오 베드. 테마·퍼즐 아님. 주파수는 저장하지 않는다.</p>

      <section>
        <h2>시계</h2>
        <div className="lab-row">
          {JUMPS.map(([label, ms]) => (
            <button key={label} type="button" onClick={() => setElapsed(ms)}>
              {label}
            </button>
          ))}
          <button type="button" onClick={() => setP7((v) => !v)}>
            P7 {p7 ? '해결' : '미해결'}
          </button>
          <button type="button" onClick={() => setFreeze((v) => !v)}>
            displayOverride {freeze ? '21:30' : '끔'}
          </button>
        </div>
        <div className="lab-row">
          {faces.map((face) => (
            <article key={face.title} className="lab-card">
              <h2>{face.title}</h2>
              <TimerFace model={face.model} />
              <p>
                0이면 {face.ending} · 실 {face.model.step}/6
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>TuningKnob + RadioBed</h2>
        <p>한 손가락은 노브 중심 기준. 두 손가락은 잇는 선의 각도만. 핀치 줌은 이 화면에서 꺼져 있다.</p>
        <div className="lab-row">
          <div ref={knobEl} className="knob" aria-label="주파수 노브">
            <div className="knob-mark" style={{ transform: `rotate(${deg}deg)` }} />
          </div>
          <div className="meter" aria-hidden>
            <span style={{ height: `${Math.round(signal * 100)}%` }} />
          </div>
          <div>
            <p data-freq={freq.toFixed(2)}>주파수 {freq.toFixed(2)} (저장 안 함)</p>
            <p data-signal={signal.toFixed(2)}>신호 {signal.toFixed(2)}</p>
            <p>firstHit {hit}</p>
            <p>lock {locked}</p>
            <p>단서 {clue} · 베드 곡 {cueName}</p>
            <p>잡음·거리 필터만 Web Audio. 옛 방송은 HTML5.</p>
          </div>
        </div>
        <div className="lab-row">
          <button type="button" onClick={startBed}>
            베드 시작
          </button>
          {(
            [
              ['또렷', DISTANCE.clear],
              ['가까이', DISTANCE.near],
              ['멀리', DISTANCE.far],
              ['묻힘', DISTANCE.buried],
            ] as const
          ).map(([label, preset]) => (
            <button key={label} type="button" onClick={() => bedRef.current?.setDistance(preset)}>
              {label}
            </button>
          ))}
          <button type="button" onClick={tryPinch}>
            핀치 시도
          </button>
        </div>
        <p>{pinchMsg}</p>
      </section>

      <section>
        <h2>역할 나눈 두 손가락</h2>
        <p>왼쪽 아래 1/3 페달, 오른쪽 2/3 천. 시작한 위치가 역할을 고정한다.</p>
        <div
          className="role-pad"
          onPointerDown={(e) => onRolePointer(e, 'down')}
          onPointerUp={(e) => onRolePointer(e, 'up')}
          onPointerCancel={(e) => onRolePointer(e, 'up')}
        >
          <div className="role-pedal">페달</div>
          <div className="role-cloth">천</div>
        </div>
        <p data-roles={roles}>{roles}</p>
      </section>
    </main>
  );
}

function toneWav(freq: number, seconds: number): string {
  const sr = 8000;
  const n = Math.floor(sr * seconds);
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, 'RIFF');
  view.setUint32(4, 36 + n * 2, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const sample = Math.sin((2 * Math.PI * freq * i) / sr) * 0.25;
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}
