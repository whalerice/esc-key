'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import type { SayFn } from '@/engine/ui/caption';
import { useAppStore } from '@/engine/save/appStore';
import { suppress } from '@/engine/boot/orientation';
import { DarknessMask } from '@/engine/fx/DarknessMask';
import { MaskAccumulator } from '@/engine/fx/MaskAccumulator';
import { ScreenFilter } from '@/engine/fx/ScreenFilter';
import { FaceDownDetector } from '@/engine/sensors/FaceDownDetector';
import { nearestSnap } from '@/engine/widgets/DragSnap';
import { allFound, markFound, type FindTarget } from '@/engine/widgets/FindTap';
import { fingerForTarget, Loupe, type LoupePlace } from '@/engine/widgets/Loupe';
import { longPressMs } from '@/engine/widgets/LongPress';
import { NumberDial } from '@/engine/widgets/NumberDial';
import { PathFollow, reelTolerance, spiralPath } from '@/engine/widgets/PathFollow';
import { TuningKnob } from '@/engine/widgets/TuningKnob';
import type { ThemeTimerApi } from '@/engine/ui/ThemePlay';
import styles from './art.module.css';
import { roomArt } from './art';
import { playClue, playSeat, stopBeds, syncBed, syncSteps } from './audio';
import { line, spoken, NOTEBOOK_PAGES } from './data/script';
import {
  BANDS,
  CONFIRM_MS,
  DEVELOP_MS,
  DODGE_MS,
  DURATION_MS,
  ENVELOPE,
  EXPOSE_OK,
  FACES,
  FINGER_R,
  LOUPE_GAP,
  LOUPE_RADIUS,
  MISS_LINE,
  PENALTY_MS,
  PHOTOS,
  PRINT_MS,
  REEL_BOX,
  SLEEVE_H,
  SLEEVE_W,
  SPIRAL_TURNS,
  SPIRAL_TURNS_ONE_HAND,
  TANK_MS,
  WOMAN_CUTS,
  clipSlots,
  cutNote,
  envelopesIn,
  hangPhoto,
  judgeChem,
  judgeCrank,
  judgeCut,
  judgeDevelopHold,
  judgeDodge,
  judgeEnvelope,
  judgeExposure,
  judgeLine,
  judgeLock,
  sleeveCells,
  type PhotoId,
} from './puzzles/answers';
import { useDarkroomStore } from './store';

const ROOM: Record<string, string> = { darkroom: '암실', shop: '매장' };

export function DarkroomFlow({
  say,
  clockRef,
  timerRef,
  notebookRef,
}: {
  say: SayFn;
  clockRef: MutableRefObject<(ms: number) => void>;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
  notebookRef: MutableRefObject<() => void>;
}) {
  const scene = useDarkroomStore((s) => s.scene);
  const solved = useDarkroomStore((s) => s.solved);
  const endingA = useDarkroomStore((s) => !!s.flags.endingA);
  const extra = useDarkroomStore((s) => s.extra);
  const notebook = useDarkroomStore((s) => s.notebook);
  const [notes, setNotes] = useState(false);
  const sayRef = useRef(say);
  sayRef.current = say;
  const onSafeRef = useRef<(on: boolean) => void>(() => undefined);
  const filter = useRef(new ScreenFilter());
  filter.current.set(extra.safelightOn ? 'safelight' : 'none');

  useEffect(() => {
    notebookRef.current = () => setNotes((open) => !open);
  }, [notebookRef]);

  useEffect(() => {
    if (navigator.maxTouchPoints === 0) {
      useDarkroomStore.getState().patchExtra({ faceDownFallback: true });
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.safelight = extra.safelightOn ? 'yes' : 'no';
    return () => {
      delete document.documentElement.dataset.safelight;
    };
  }, [extra.safelightOn]);

  useEffect(() => {
    clockRef.current = (elapsed) => {
      const s = useDarkroomStore.getState();
      const rem = Math.max(0, DURATION_MS - (elapsed + s.timer.penaltyMs - s.timer.bonusPausedMs));
      if (rem <= 10 * 60_000 && rem > 5 * 60_000) once('tick10', () => {
        playSeat('tick');
        sayRef.current(spoken('tick.10'));
      });
      if (rem > 0 && rem <= 5 * 60_000) once('tick5', () => {
        playSeat('tick');
        sayRef.current(spoken('tick.5'));
      });
    };
    return () => {
      clockRef.current = () => undefined;
    };
  }, [clockRef]);

  useEffect(() => {
    syncBed({ tick: true, wind: true });
    return () => stopBeds();
  }, []);

  function toggleSafe() {
    const on = !useDarkroomStore.getState().extra.safelightOn;
    useDarkroomStore.getState().patchExtra({ safelightOn: on });
    playSeat('safelight');
    if (on) say(spoken('safe.on'));
    onSafeRef.current(on);
  }

  function useFallback(on: boolean) {
    useDarkroomStore.getState().patchExtra({ faceDownFallback: on });
    if (on) say(spoken('hand.ok'));
  }

  return (
    <>
      <div
        className={`darkroom-flow ${styles.flow}`}
        data-scene={scene}
        data-safe={extra.safelightOn ? 'yes' : 'no'}
        data-filter={filter.current.kind}
        data-puzzle={puzzleId(solved)}
      >
        <img className={styles.scene} src={roomArt(scene, extra.safelightOn, endingA)} alt="" />
        <p>
          {ROOM[scene] ?? scene}
          {extra.safelightOn ? ' · 안전등' : ' · 암'}
        </p>
        <button type="button" className="darkroom-switch" data-on={extra.safelightOn ? 'yes' : 'no'} onClick={toggleSafe}>
          <Mark name="safelight" />
          안전등 {extra.safelightOn ? '켬' : '끔'}
        </button>
        {scene === 'darkroom' && !solved.P1 && <P1 safelight={extra.safelightOn} say={say} />}
        {scene === 'darkroom' && solved.P1 && !solved.P2 && (
          <P2 safelight={extra.safelightOn} say={say} timerRef={timerRef} onSafeRef={onSafeRef} />
        )}
        {scene === 'darkroom' && solved.P2 && !solved.P3 && <P3 say={say} timerRef={timerRef} />}
        {scene === 'darkroom' && solved.P3 && !solved.P4 && <P4 say={say} />}
        {scene === 'darkroom' && solved.P4 && !solved.P5 && (
          <P5 safelight={extra.safelightOn} fallback={extra.faceDownFallback} say={say} timerRef={timerRef} />
        )}
        {scene === 'darkroom' && solved.P5 && !solved.P6 && <P6 say={say} />}
        {scene === 'darkroom' && solved.P6 && !solved.P7 && <AfterLine safelight={extra.safelightOn} say={say} />}
        {scene === 'shop' && solved.P6 && !solved.P7 && <P7 safelight={extra.safelightOn} say={say} />}
        {scene === 'darkroom' && solved.P7 && !solved.P8 && (
          <P8 fallback={extra.faceDownFallback} say={say} />
        )}
        <p className="radio-row">
          <button type="button" onClick={() => setNotes((open) => !open)}><Mark name="note" />수첩</button>
          <button type="button" onClick={() => useFallback(!extra.faceDownFallback)}>
            엎어두기 {extra.faceDownFallback ? '버튼' : '센서'}
          </button>
          {scene === 'shop' && (
            <button type="button" onClick={() => useDarkroomStore.getState().setScene('darkroom')}>암실</button>
          )}
        </p>
      </div>
      {notes && (
        <aside className={`darkroom-sheet ${styles.sheet}`}>
          <h2>수첩 · 작업 노트</h2>
          <pre>{NOTEBOOK_PAGES}</pre>
          {solved.P4 && <p>시험 띠부터. 회색이 끊기지 않는 첫 칸. 컬러 인화지는 안전등도 싫어한다.</p>}
          {solved.P6 && <p>골목 컷마다 같은 사람이 걸린다. 목도리 색이 그 사람 것과 같다.</p>}
          {solved.P7 && <p>이번엔 가게 안이다. 무섭지 않다. 스무 해 동안 이 방에 혼자 있었다.</p>}
          {solved.P7 && <p>어두운 얼굴은 손으로 가려 빛을 덜 줘라. 이번엔 같이 찍혀야겠다.</p>}
          <ul>
            {notebook.length === 0 && <li>비어 있다.</li>}
            {notebook.map((note) => (
              <li key={note.id}>{note.text}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setNotes(false)}>닫기</button>
        </aside>
      )}
    </>
  );
}

function puzzleId(solved: Record<string, boolean>): string {
  const order = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
  return order.find((id) => !solved[id]) ?? 'end';
}

function P1({ safelight, say }: { safelight: boolean; say: SayFn }) {
  const dial = useRef(new NumberDial(3));
  const [vals, setVals] = useState<number[]>([0, 0, 0]);

  function bump(index: number, dir: number) {
    dial.current.setDigit(index, dial.current.values[index]! + dir);
    setVals([...dial.current.values]);
  }

  return (
    <section className={styles.panel}>
      <h2>P1 암실 수칙</h2>
      <Clue name={safelight ? 'rules-safe' : 'rules'} />
      <p>{safelight ? line('p1.rules') : line('p1.scribble')}</p>
      <div className="radio-row">
        {vals.map((n, i) => (
          <span key={i}>
            <button type="button" onClick={() => bump(i, 1)}>{n} +</button>
            <button type="button" onClick={() => bump(i, -1)}>{n} −</button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => {
            if (!judgeLock(vals)) {
              say(spoken('p1.no'));
              return;
            }
            const s = useDarkroomStore.getState();
            s.markSolved('P1');
            s.addItem('탱크');
            s.addItem('노트');
            addNote('rules', line('p1.rules'));
            playSeat('lock');
            say(spoken('p1.solved'));
          }}
        >
          <Mark name="cabinet" />약품장
        </button>
      </div>
      <button type="button" onClick={() => say(spoken('open.ledger'))}><Mark name="ledger" />접수 장부</button>
      <button type="button" onClick={() => say(spoken('open.note'))}><Mark name="camera" />수리 카메라</button>
    </section>
  );
}

function P2({
  safelight,
  say,
  timerRef,
  onSafeRef,
}: {
  safelight: boolean;
  say: SayFn;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
  onSafeRef: MutableRefObject<(on: boolean) => void>;
}) {
  const oneHand = useAppStore((s) => s.settings.oneHand);
  const turnsN = oneHand ? SPIRAL_TURNS_ONE_HAND : SPIRAL_TURNS;
  const points = useMemo(() => spiralPath(turnsN, REEL_BOX), [turnsN]);
  const [phase, setPhase] = useState<'crank' | 'lid' | 'spiral'>('crank');
  const [turns, setTurns] = useState(0);
  const [progress, setProgress] = useState(0);
  const [glow, setGlow] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const knob = useRef(new TuningKnob({ min: 0, max: 1, perTurn: 1, inertiaMs: 0, snap: 0.25 }));
  const crankRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<PathFollow | null>(null);
  const dark = useRef(new DarknessMask());
  dark.current.enabled = phase === 'spiral' && !safelight;

  useEffect(() => {
    onSafeRef.current = (on) => {
      if (!on || phaseRef.current !== 'spiral') return;
      phaseRef.current = 'lid';
      setPhase('lid');
      setProgress(0);
      penalize(timerRef);
      playSeat('burn');
      say(spoken('p2.burn'));
    };
    return () => {
      onSafeRef.current = () => undefined;
    };
  }, [onSafeRef, say, timerRef]);

  useEffect(() => {
    const el = crankRef.current;
    if (!el || phase !== 'crank') return;
    return knob.current.attach(el);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'spiral') return;
    const path = new PathFollow({
      path: points,
      tolerance: reelTolerance(REEL_BOX),
      onChange: (next) => setProgress(next),
      onStray: () => {
        playSeat('tangle');
        say(spoken('p2.tangle'));
      },
      onComplete: () => {
        const s = useDarkroomStore.getState();
        if (s.solved.P2) return;
        s.markSolved('P2');
        playSeat('lock');
        say(spoken('p2.solved'));
        say(spoken('p2.sound'));
      },
    });
    pathRef.current = path;
    const el = padRef.current;
    const off = el ? path.attach(el) : undefined;
    return () => {
      off?.();
      path.detach();
    };
  }, [phase, points, say]);

  return (
    <section className={styles.panel} data-dark={dark.current.enabled ? 'yes' : 'no'}>
      <h2>P2 필름 감기</h2>
      {phase === 'crank' && (
        <>
          <p>{line('p2.crank')}</p>
          <div ref={crankRef} className="darkroom-knob" data-live="crank" />
          <button
            type="button"
            onClick={() => {
              const next = Math.min(1, Math.round((knob.current.value + 0.25) * 4) / 4);
              knob.current.set(next);
              setTurns(next);
              if (judgeCrank(next)) {
                setPhase('lid');
                playSeat('crank');
                say(spoken('p2.full'));
              }
            }}
          >
            <Mark name="crank" />크랭크 {turns.toFixed(2)}
          </button>
        </>
      )}
      {phase === 'lid' && (
        <>
          <p>{line('p2.rule')}</p>
          <button
            type="button"
            onClick={() => {
              if (safelight) {
                penalize(timerRef);
                playSeat('burn');
                say(spoken('p2.burn'));
                return;
              }
              setPhase('spiral');
              playSeat('drag');
              say(spoken('p2.dark'));
            }}
          >
            <Mark name="lid" />뒷덮개
          </button>
        </>
      )}
      {phase === 'spiral' && (
        <>
          <p>
            {turnsN}바퀴 · {Math.round(progress * 100)}%
            {dark.current.enabled ? ' · 암흑' : ''}
          </p>
          <div ref={padRef} className="darkroom-pad" data-glow={glow ? 'high' : 'low'} data-live="spiral">
            {points.filter((_, i) => i % 4 === 0).map((p, i) => (
              <i key={i} className="darkroom-dot" style={{ left: p.x, top: p.y }} />
            ))}
          </div>
          <div className="radio-row">
            <button
              type="button"
              onClick={() => {
                const path = pathRef.current;
                if (!path) return;
                for (const p of points) {
                  if (path.progress >= 1) break;
                  path.move(p.x, p.y);
                }
              }}
            >
              점을 따라 감는다
            </button>
            <button type="button" onClick={() => setGlow((v) => !v)}>야광 {glow ? '밝게' : '희미'}</button>
          </div>
        </>
      )}
    </section>
  );
}

function P3({
  say,
  timerRef,
}: {
  say: SayFn;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
}) {
  const knob = useRef(new TuningKnob({ min: 20, max: 50, perTurn: 10, snap: 0.5, inertiaMs: 0 }));
  const [temp, setTemp] = useState(20);
  const [kit, setKit] = useState('');
  const [shook, setShook] = useState(false);
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(TANK_MS);
  const kitRef = useRef(kit);
  const tempRef = useRef(temp);
  const shookRef = useRef(shook);
  kitRef.current = kit;
  tempRef.current = temp;
  shookRef.current = shook;
  const said = useRef(false);

  useEffect(() => {
    if (!busy) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const remain = TANK_MS - (performance.now() - start);
      setLeft(Math.max(0, remain));
      if (remain > 0) return;
      window.clearInterval(id);
      setBusy(false);
      const result = judgeChem(kitRef.current, tempRef.current, shookRef.current);
      if (result === 'ok') {
        useDarkroomStore.getState().markSolved('P3');
        addNote('chem', line('p3.note'));
        playSeat('splash');
        say(spoken('p3.solved'));
        return;
      }
      if (result === 'shake') {
        say(spoken('p3.shake'));
        return;
      }
      penalize(timerRef);
      if (result === 'bw') say(spoken('p3.clear'));
      if (result === 'cold') say(spoken('p3.cold'));
      if (result === 'hot') say(spoken('p3.hot'));
      say(spoken('p3.again'));
      setShook(false);
    }, 100);
    return () => window.clearInterval(id);
  }, [busy, say, timerRef]);

  function nudge(dir: number) {
    const next = Math.round((knob.current.value + dir) * 2) / 2;
    knob.current.set(next);
    setTemp(knob.current.value);
  }

  return (
    <section className={styles.panel}>
      <h2>P3 현상 약품</h2>
      <p>{line('p3.label')}</p>
      <p>{line('p3.note')}</p>
      <div className="radio-row">
        <button type="button" onClick={() => { setKit('bw'); say(spoken('p3.bw')); }}><Mark name="kit-bw" />흑백 키트</button>
        <button type="button" onClick={() => setKit('color')}><Mark name="kit-color" />컬러 키트</button>
        <button type="button" onClick={() => nudge(-0.5)}>온도 −</button>
        <button type="button" onClick={() => nudge(0.5)}>온도 +</button>
      </div>
      <p><Mark name="thermo" />{kit || '키트 없음'} · {temp.toFixed(1)}°C {busy ? `· ${Math.ceil(left / 1000)}초` : ''}</p>
      <div className="radio-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            said.current = false;
            setShook(false);
            setBusy(true);
          }}
        >
          <Mark name="tank" />탱크 타이머
        </button>
        <button
          type="button"
          disabled={!busy}
          onClick={() => {
            setShook(true);
            playSeat('water');
            if (!said.current) {
              said.current = true;
              say(spoken('p3.shake'));
            }
          }}
        >
          <Mark name="shake" />흔들기
        </button>
      </div>
    </section>
  );
}

function P4({ say }: { say: SayFn }) {
  const cells = useMemo(() => sleeveCells(), []);
  const loupe = useRef(new Loupe());
  const [place, setPlace] = useState<LoupePlace | null>(null);
  const [found, setFound] = useState<FindTarget[]>(WOMAN_CUTS.map((id) => ({ id, found: false })));

  function pick(id: string) {
    const cell = cells.find((item) => item.id === id);
    if (!cell) return;
    const finger = fingerForTarget(cell.x, cell.y, SLEEVE_W, SLEEVE_H, LOUPE_RADIUS, LOUPE_GAP);
    setPlace(loupe.current.place(finger.x, finger.y, SLEEVE_W, SLEEVE_H, LOUPE_RADIUS, LOUPE_GAP));
    if (!loupe.current.covers(cell.x, cell.y)) return;
    const kind = judgeCut(id);
    if (kind !== 'woman') {
      const note = cutNote(id);
      addNote(`cut-${id}`, note);
      say(note);
      return;
    }
    if (found.some((item) => item.id === id && item.found)) return;
    const next = markFound(found, id);
    setFound(next);
    const n = next.filter((item) => item.found).length;
    if (n === 1) say(spoken('p4.person'));
    else if (n < 4) say(spoken('p4.again'));
    if (!allFound(next)) return;
    const s = useDarkroomStore.getState();
    s.markSolved('P4');
    addNote('cuts', line('p4.solved'));
    playSeat('lock');
    say(spoken('p4.solved'));
  }

  return (
    <section className={styles.panel}>
      <h2>P4 네거티브</h2>
      <Clue name="sleeve" />
      <p>{line('p4.look')}</p>
      <div className="darkroom-sleeve" style={{ width: SLEEVE_W, height: SLEEVE_H }}>
        {place && (
          <div
            className="darkroom-glass"
            data-flip={place.flipped ? 'yes' : 'no'}
            style={{
              left: place.x - LOUPE_RADIUS,
              top: place.y - LOUPE_RADIUS,
              width: LOUPE_RADIUS * 2,
              height: LOUPE_RADIUS * 2,
            }}
          />
        )}
        {cells.map((cell) => {
          const open = place != null && loupe.current.covers(cell.x, cell.y);
          const kind = open ? judgeCut(cell.id) : null;
          return (
            <button
              key={cell.id}
              type="button"
              className="darkroom-cell"
              style={{ left: cell.x - 34, top: cell.y - 18 }}
              onClick={() => pick(cell.id)}
            >
              {cell.id}
              {kind === 'woman' && <Pip name="scarf" />}
              {kind === 'trap' && <Pip name={trapIcon(cell.id)} />}
              {kind === 'woman' ? ' 청록' : kind === 'trap' || kind === 'no' ? ' ·' : ''}
            </button>
          );
        })}
      </div>
      <p>체크 {found.filter((item) => item.found).map((item) => item.id).join(' ') || '없음'}</p>
    </section>
  );
}

function P5({
  safelight,
  fallback,
  say,
  timerRef,
}: {
  safelight: boolean;
  fallback: boolean;
  say: SayFn;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
}) {
  const knob = useRef(new TuningKnob({ min: 5, max: 25, perTurn: 20, snap: 5, inertiaMs: 0 }));
  const [sec, setSec] = useState(5);
  const [phase, setPhase] = useState<'paper' | 'dunk'>('paper');

  function nudge(dir: number) {
    knob.current.set(Math.min(25, Math.max(5, knob.current.value + dir)));
    setSec(knob.current.value);
  }

  return (
    <section className={styles.panel}>
      <h2>P5 첫 인화</h2>
      <p>{line('p5.strip')}</p>
      {phase === 'paper' && (
        <div className="radio-row">
          <button type="button" onClick={() => nudge(-5)}>노출 −</button>
          <button type="button" onClick={() => nudge(5)}>노출 +</button>
          <button
            type="button"
            onClick={() => {
              if (safelight) {
                penalize(timerRef);
                playSeat('burn');
                say(spoken('p5.burn'));
                return;
              }
              setPhase('dunk');
              say(spoken('p5.dunk'));
            }}
          >
            <Mark name="enlarger" />확대기 {sec}초
          </button>
        </div>
      )}
      {phase === 'dunk' && (
        <DevelopHold
          fallback={fallback}
          onDone={() => {
            const result = judgeExposure(sec);
            if (result !== 'ok') {
              say(result === 'thin' ? line('p5.thin') : line('p5.dark'));
              setPhase('paper');
              return;
            }
            const s = useDarkroomStore.getState();
            s.markSolved('P5');
            s.addItem('사진');
            addNote('expose', `${EXPOSE_OK}초`);
            playSeat('splash');
            say(spoken('p5.solved'));
          }}
          onFail={(why) => {
            say(why === 'light' ? line('p5.light') : line('p5.early'));
            setPhase('paper');
          }}
        />
      )}
    </section>
  );
}

function P6({ say }: { say: SayFn }) {
  const saved = useDarkroomStore((s) => s.extra.clotheslineOrder);
  const slots = lineOf(saved);
  const [picked, setPicked] = useState<PhotoId | null>(null);
  const [zoom, setZoom] = useState<PhotoId | null>(null);
  const [misses, setMisses] = useState(0);
  const clips = clipSlots();
  const zoomed = PHOTOS.find((photo) => photo.id === zoom);

  function drop(index: number) {
    if (!picked) return;
    const clip = clips[index];
    if (!clip || !nearestSnap(clip.x, clip.y, clips)) return;
    const next = hangPhoto(slots, picked, index);
    useDarkroomStore.getState().patchExtra({ clotheslineOrder: next });
    const result = judgeLine(next);
    if (result === 'short') return;
    if (result !== 'ok') {
      say(MISS_LINE[misses % MISS_LINE.length] ?? MISS_LINE[0]);
      setMisses((n) => n + 1);
      return;
    }
    const s = useDarkroomStore.getState();
    s.markSolved('P6');
    if (!s.items.includes('사진')) s.addItem('사진');
    playSeat('door');
    say(spoken('p6.solved'));
    say(spoken('p6.door'));
  }

  return (
    <section className={styles.panel}>
      <h2>P6 빨랫줄</h2>
      <p>{line('p6.look')}</p>
      <div className="radio-row">
        {PHOTOS.map((photo) => (
          <button key={photo.id} type="button" onClick={() => { setPicked(photo.id); setZoom(photo.id); }}>
            <Mark name={`photo-${photo.id}`} />{photo.name}{slots.includes(photo.id) ? ' ·걸림' : ''}
          </button>
        ))}
      </div>
      {zoomed && (
        <>
          <Clue name={`photo-${zoomed.id}`} />
          <p>{zoomed.clue} 여자: {zoomed.woman}</p>
        </>
      )}
      <div className="radio-row">
        {clips.map((clip, index) => (
          <button key={clip.id} type="button" onClick={() => drop(index)}>
            <Mark name="clip" />집게 {index + 1} {nameOf(slots[index] ?? '')}
          </button>
        ))}
      </div>
    </section>
  );
}

function AfterLine({ safelight, say }: { safelight: boolean; say: SayFn }) {
  const solved = useDarkroomStore((s) => s.solved);
  return (
    <section className={styles.panel}>
      <p>{line('p6.solved')}</p>
      <Receipt safelight={safelight} say={say} />
      {!solved.P7 && (
        <LongHold
          label="암실 문"
          mark="door"
          onHold={() => {
            playSeat('door');
            say(spoken('p7.door'));
            useDarkroomStore.getState().setScene('shop');
          }}
        />
      )}
    </section>
  );
}

function Receipt({ safelight, say }: { safelight: boolean; say: SayFn }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (safelight) {
            addNote('0741', line('p7.num'));
            say(spoken('p7.num'));
          } else {
            say(spoken('p7.slip'));
          }
        }}
      >
        <Mark name="photo" />증명사진 확대
      </button>
      {open && <Clue name={safelight ? 'slip-safe' : 'slip'} />}
      {open && <p>{safelight ? String(ENVELOPE).padStart(4, '0') : '빨간 볼펜'}</p>}
    </>
  );
}

function P7({ safelight, say }: { safelight: boolean; say: SayFn }) {
  const [band, setBand] = useState<number | null>(null);
  const packs = band == null ? [] : envelopesIn(band);
  return (
    <section className={styles.panel}>
      <h2>P7 찾아가지 않은 사진</h2>
      <Receipt safelight={safelight} say={say} />
      <div className="radio-row">
        {BANDS.map((n) => (
          <button key={n} type="button" onClick={() => setBand(n)}>
            {String(n).padStart(4, '0')}
          </button>
        ))}
      </div>
      <div className="radio-row">
        {packs.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              if (judgeEnvelope(n) !== 'ok') {
                say(spoken('p7.other'));
                return;
              }
              const s = useDarkroomStore.getState();
              s.markSolved('P7');
              s.addItem('봉투');
              addNote('jeonghee', line('p7.solved'));
              playClue('phone');
              say(spoken('p7.solved'));
              say(spoken('p7.call'));
              say(spoken('p7.wait'));
            }}
          >
            <Mark name="envelope" />{String(n).padStart(4, '0')}
          </button>
        ))}
      </div>
    </section>
  );
}

function P8({ fallback, say }: { fallback: boolean; say: SayFn }) {
  const saved = useDarkroomStore((s) => s.extra.dodgeMask);
  const ready = judgeDodge(saved?.left ?? 0, saved?.right ?? 0) === 'ok';
  const [step, setStep] = useState<'dodge' | 'develop' | 'choice' | 'fog'>(ready ? 'develop' : 'dodge');

  return (
    <section className={styles.panel}>
      <h2>P8 마지막 컷</h2>
      <Clue name="faces" />
      <p>{line('p8.note')}</p>
      {step === 'dodge' && (
        <Dodge
          onOk={() => setStep('develop')}
          onMiss={(kind) => say(kind === 'one' ? line('p8.one') : line('p5.dark'))}
        />
      )}
      {step === 'develop' && (
        <>
          <p>{line('p5.dunk')}</p>
          <DevelopHold
            fallback={fallback}
            onDone={() => {
              say(spoken('p8.together'));
              say(spoken('p8.choice'));
              setStep('choice');
            }}
            onFail={(why) => say(why === 'light' ? line('p5.light') : line('p5.early'))}
          />
        </>
      )}
      {step === 'choice' && <Choice say={say} onFog={() => setStep('fog')} />}
      {step === 'fog' && (
        <Fog
          onEnd={() => {
            const s = useDarkroomStore.getState();
            if (s.flags.endingA || s.flags.endingB) return;
            s.setFlag('endingB');
            playSeat('shutter');
          }}
        />
      )}
    </section>
  );
}

function Dodge({
  onOk,
  onMiss,
}: {
  onOk: () => void;
  onMiss: (kind: 'one' | 'no') => void;
}) {
  const mask = useRef<MaskAccumulator | null>(null);
  if (!mask.current) {
    const next = new MaskAccumulator();
    next.define(FACES.map((face) => ({ ...face })));
    const saved = useDarkroomStore.getState().extra.dodgeMask;
    if (saved) {
      next.seed('left', saved.left);
      next.seed('right', saved.right);
    }
    mask.current = next;
  }
  const [ratios, setRatios] = useState({
    left: mask.current.ratio('left'),
    right: mask.current.ratio('right'),
  });
  const [run, setRun] = useState(false);
  const [leftMs, setLeftMs] = useState(DODGE_MS);
  const onOkRef = useRef(onOk);
  const onMissRef = useRef(onMiss);
  onOkRef.current = onOk;
  onMissRef.current = onMiss;

  function paint(id: 'left' | 'right') {
    const face = FACES.find((item) => item.id === id);
    if (!face || !mask.current) return;
    mask.current.dab(face.x, face.y, FINGER_R);
    const next = { left: mask.current.ratio('left'), right: mask.current.ratio('right') };
    setRatios(next);
    useDarkroomStore.getState().patchExtra({ dodgeMask: next });
  }

  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const remain = DODGE_MS - (performance.now() - start);
      setLeftMs(Math.max(0, remain));
      if (remain > 0) return;
      window.clearInterval(id);
      setRun(false);
      const next = {
        left: mask.current?.ratio('left') ?? 0,
        right: mask.current?.ratio('right') ?? 0,
      };
      useDarkroomStore.getState().patchExtra({ dodgeMask: next });
      const result = judgeDodge(next.left, next.right);
      if (result === 'ok') onOkRef.current();
      else onMissRef.current(result);
    }, 100);
    return () => window.clearInterval(id);
  }, [run]);

  return (
    <>
      <p>왼쪽 {Math.round(ratios.left * 100)}% · 오른쪽 {Math.round(ratios.right * 100)}% {run ? `· ${Math.ceil(leftMs / 1000)}초` : ''}</p>
      <div className="radio-row">
        <button type="button" disabled={!run} onClick={() => paint('left')}><Mark name="photo" />왼쪽 얼굴</button>
        <button type="button" disabled={!run} onClick={() => paint('right')}><Pip name="scarf" />오른쪽 얼굴</button>
        <button type="button" disabled={run} onClick={() => setRun(true)}>노출</button>
      </div>
    </>
  );
}

function DevelopHold({
  fallback,
  onDone,
  onFail,
}: {
  fallback: boolean;
  onDone: () => void;
  onFail: (why: 'light' | 'early') => void;
}) {
  const det = useRef(new FaceDownDetector());
  const [black, setBlack] = useState(false);
  const [left, setLeft] = useState(DEVELOP_MS);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  const onFailRef = useRef(onFail);
  onDoneRef.current = onDone;
  onFailRef.current = onFail;

  useEffect(() => {
    const detector = det.current;
    detector.start();
    return () => detector.stop();
  }, []);

  useEffect(() => {
    if (!black) return;
    suppress(true);
    syncSteps(true);
    return () => {
      suppress(false);
      syncSteps(false);
    };
  }, [black]);

  useEffect(() => {
    if (fallback) return;
    const detector = det.current;
    const onOri = (e: DeviceOrientationEvent) => {
      detector.push(e.beta ?? 0, e.gamma ?? 0, performance.now());
    };
    window.addEventListener('deviceorientation', onOri);
    return () => window.removeEventListener('deviceorientation', onOri);
  }, [fallback]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (done.current) return;
      const detector = det.current;
      const now = performance.now();
      if (fallback) {
        if (!detector.faceDown) return;
        const held = detector.buttonHeld(now);
        setLeft(Math.max(0, DEVELOP_MS - held));
        if (judgeDevelopHold(held) !== 'ok') return;
        done.current = true;
        setBlack(false);
        onDoneRef.current();
        return;
      }
      if (detector.faceDown) {
        setBlack(true);
        setLeft(Math.max(0, DEVELOP_MS - detector.heldMs));
        return;
      }
      if (detector.lastHeld <= 0) return;
      done.current = true;
      setBlack(false);
      if (judgeDevelopHold(detector.lastHeld) === 'ok') onDoneRef.current();
      else onFailRef.current('early');
    }, 100);
    return () => window.clearInterval(id);
  }, [fallback]);

  if (fallback && !black) {
    return (
      <button
        type="button"
        onClick={() => {
          det.current.beginButton(performance.now());
          setBlack(true);
        }}
      >
        <Mark name="tray" />엎어두기
      </button>
    );
  }
  if (!black) return <p>폰을 엎어 두세요.</p>;
  return (
    <div
      className="darkroom-blackout"
      onPointerDown={() => {
        if (!fallback || done.current) return;
        det.current.cancelButton();
        done.current = true;
        setBlack(false);
        onFailRef.current('light');
      }}
    >
      <p>화면을 만지지 마세요. {Math.ceil(left / 1000)}초</p>
    </div>
  );
}

function Fog({ onEnd }: { onEnd: () => void }) {
  const [shot, setShot] = useState(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (!shot) return;
    const id = window.setTimeout(() => onEndRef.current(), PRINT_MS);
    return () => window.clearTimeout(id);
  }, [shot]);

  return (
    <>
      <p>{line('end.b2')}</p>
      {!shot && (
        <button
          type="button"
          onClick={() => {
            setShot(true);
            playSeat('shutter');
          }}
        >
          <Mark name="camera" />셔터
        </button>
      )}
      {shot && <Clue name="alley" />}
      {shot && <p>{line('end.b4')}</p>}
      {shot && <p>{line('end.b5')}</p>}
    </>
  );
}

function Choice({ say, onFog }: { say: SayFn; onFog: () => void }) {
  const [held, setHeld] = useState(false);
  return (
    <div className="radio-row">
      <button type="button" onClick={() => { setHeld(true); say(spoken('p8.hand')); }}>
        <Mark name="photo" />젖은 사진
      </button>
      <LongHold
        mark="tray"
        label="정착액 대야"
        onHold={() => {
          if (!held) {
            say(spoken('p8.hand'));
            return;
          }
          const tray = [{ id: 'tray', x: 40, y: 40, r: 30 }];
          if (!nearestSnap(40, 40, tray)) return;
          const s = useDarkroomStore.getState();
          if (s.flags.endingA || s.flags.endingB) return;
          s.setFlag('endingA');
          playSeat('splash');
          playClue('ending');
        }}
      />
      <LongHold
        mark="bulb"
        label="백열등"
        onHold={() => {
          const s = useDarkroomStore.getState();
          if (s.flags.endingA || s.flags.endingB) return;
          playSeat('burn');
          say(spoken('end.b1'));
          say(spoken('end.b2'));
          say(spoken('end.b3'));
          onFog();
        }}
      />
    </div>
  );
}

function LongHold({ label, mark, onHold }: { label: string; mark?: string; onHold: () => void }) {
  const started = useRef(0);
  return (
    <button
      type="button"
      onPointerDown={() => {
        started.current = performance.now();
      }}
      onPointerUp={() => {
        if (performance.now() - started.current >= longPressMs(CONFIRM_MS)) onHold();
      }}
    >
      {mark && <Mark name={mark} />}
      {label} 길게
    </button>
  );
}

function Mark({ name }: { name: string }) {
  return <img className={styles.mark} src={`/themes/neulbom-darkroom/props/${name}.svg`} alt="" />;
}

function Pip({ name }: { name: string }) {
  return <img className={styles.pip} src={`/themes/neulbom-darkroom/props/${name}.svg`} alt="" />;
}

function Clue({ name }: { name: string }) {
  return <img className={styles.clue} src={`/themes/neulbom-darkroom/props/${name}.svg`} alt="" />;
}

function trapIcon(id: string): string {
  if (id === 'A2') return 'mailbox';
  if (id === 'C3') return 'hydrant';
  return 'basin';
}

function lineOf(order: readonly string[]): string[] {
  return Array.from({ length: 6 }, (_, i) => order[i] ?? '');
}

function nameOf(id: string): string {
  return PHOTOS.find((photo) => photo.id === id)?.name ?? '';
}

function penalize(timerRef: MutableRefObject<ThemeTimerApi | null>) {
  timerRef.current?.penalty(PENALTY_MS);
}

function once(flag: string, run: () => void) {
  const s = useDarkroomStore.getState();
  if (s.flags[flag]) return;
  s.setFlag(flag);
  run();
}

function addNote(id: string, text: string) {
  const s = useDarkroomStore.getState();
  if (s.notebook.some((note) => note.id === id)) return;
  useDarkroomStore.setState({ notebook: [...s.notebook, { id, text }] });
}
