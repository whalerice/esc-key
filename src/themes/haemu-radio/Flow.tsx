'use client';

import { useEffect, useRef, useState, type ComponentProps, type MutableRefObject, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { SayFn } from '@/engine/ui/caption';
import { Howl } from 'howler';
import { DISTANCE, RadioBed } from '@/engine/audio/RadioBed';
import { playHtml5Clip } from '@/engine/audio/html5Clip';
import { isAudioUnlocked } from '@/engine/audio/SoundManager';
import { useAppStore } from '@/engine/save/appStore';
import { longPressMs } from '@/engine/widgets/LongPress';
import { nearestSnap, type SnapTarget } from '@/engine/widgets/DragSnap';
import { DragSort } from '@/engine/widgets/DragSort';
import { Keypad } from '@/engine/widgets/Keypad';
import { SafeDial } from '@/engine/widgets/SafeDial';
import { TuningKnob, type TuningStation } from '@/engine/widgets/TuningKnob';
import { VerticalFader } from '@/engine/widgets/VerticalFader';
import { P6_CALL, line, spoken } from './data/script';
import { themeHaemuRadio } from './index';
import {
  CARTS,
  LETTERS,
  P2_HOLD_MS,
  P2_HZ,
  P2_TOL,
  P3_TARGET_SEC,
  cartQueueSecs,
  formatCartClock,
  P5_HOLD_MS,
  P5_STATIONS,
  P6_BOXES,
  P6_ORIGIN,
  P7_HOLD_MS,
  P7_TAGS,
  P8_HOLD_MS,
  P8_HZ,
  P8_PER_TURN,
  P8_TOL,
  ROOF_LOCK_ID,
  inBand,
  isP2Tease,
  judgeFader,
  judgeItemUse,
  judgeKey,
  KEYRING_ID,
  judgeP1,
  judgeP3,
  judgeP4,
  judgeP5,
  judgeP6Box,
  judgeP6Counter,
  p5Tol,
  rewindRate,
  slot2Rejects,
  stationAt,
  windowDigit,
} from './puzzles/answers';
import { BED_SRC, CLUE_SRC, DJ_SRC, PROP_SRC, ROOM_SRC, SFX_SRC, propArt } from './art';
import { useRadioStore } from './store';

const ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'] as const;

const ROOM: Record<string, string> = {
  control: '부조정실',
  booth: '부스',
  desk: '작가석',
  archive: '아카이브실',
  roof: '옥상',
};

const DISTANCE_BY: Record<string, (typeof DISTANCE)[keyof typeof DISTANCE]> = {
  booth: DISTANCE.clear,
  control: DISTANCE.near,
  desk: DISTANCE.near,
  archive: DISTANCE.far,
  roof: DISTANCE.buried,
};

const P2_STATIONS: TuningStation[] = [{ freq: P2_HZ, width: 0.2, soundId: 'aircheck' }];
const P5_KNOB: TuningStation[] = P5_STATIONS.map((s) => ({ freq: s.freq, width: 0.3, soundId: s.id }));
const P8_STATIONS: TuningStation[] = [{ freq: P8_HZ, width: 0.2, soundId: 'tx' }];

const P3_SLOTS: SnapTarget[] = [0, 1, 2, 3, 4].map((i) => ({ id: String(i), x: 70 + i * 140, y: 36, r: 68 }));
const P4_SLOTS: SnapTarget[] = [0, 1, 2, 3].map((i) => ({ id: String(i), x: 80 + i * 160, y: 40, r: 70 }));

const KEY_ICON: Record<string, string> = {
  배: 'key-boat',
  부표: 'key-buoy',
  갈매기: 'key-gull',
  '빨간 등대': 'key-red',
  '큰 등대': 'key-big',
};

type Mode = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'lock' | 'p6' | 'keys' | 'tx' | 'fader' | null;

function Prop({
  icon,
  nav,
  className,
  children,
  ...rest
}: ComponentProps<'button'> & { icon?: string; nav?: boolean; children?: ReactNode }) {
  const cls = [nav ? 'radio-nav' : 'radio-prop', className].filter(Boolean).join(' ');
  return (
    <button type="button" {...rest} className={cls}>
      {icon ? <img src={propArt(icon)} alt="" /> : null}
      {children}
    </button>
  );
}

const sfxHowls = new Map<string, Howl>();

function radioSfx(url: string) {
  if (!isAudioUnlocked()) return;
  let howl = sfxHowls.get(url);
  if (!howl) {
    howl = new Howl({ src: [url], volume: 0.35 });
    sfxHowls.set(url, howl);
  }
  howl.play();
}

export function RadioFlow({
  say,
  clockRef,
  selectedItem,
  onUseRef,
}: {
  say: SayFn;
  clockRef: MutableRefObject<(ms: number) => void>;
  selectedItem: string | null;
  onUseRef: MutableRefObject<(itemId: string | null, targetId: string) => void>;
}) {
  const scene = useRadioStore((s) => s.scene);
  const solved = useRadioStore((s) => s.solved);
  const extra = useRadioStore((s) => s.extra);
  const items = useRadioStore((s) => s.items);
  const [mode, setMode] = useState<Mode>(null);
  const [armed, setArmed] = useState(false);
  const [call, setCall] = useState<readonly string[] | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const bedRef = useRef<RadioBed | null>(null);
  const clips = useRef<Record<string, string>>({});
  const tuning = useRef(false);
  const signal = useRef(1);
  const tease = useRef(false);
  const other = useRef(false);
  const rewind = useRef(0);

  useEffect(() => {
    setMode(null);
  }, [scene]);

  useEffect(() => {
    if (scene !== 'control' || !extra.txLocked || extra.letterPlaced) return;
    if (items.includes('팔칠구의 편지')) return;
    useRadioStore.getState().addItem('팔칠구의 편지');
    say(spoken('p8.letter'));
  }, [scene, extra.txLocked, extra.letterPlaced, items, say]);

  useEffect(() => {
    const urls = { ...BED_SRC };
    clips.current = { ...CLUE_SRC };
    const bed = new RadioBed(themeHaemuRadio.radioBed, { sounds: urls, startClock: '02:00' });
    bedRef.current = bed;
    let prevDistance = '';
    let prevSignal = -1;
    clockRef.current = (ms) => {
      bed.sync(ms);
      const s = useRadioStore.getState();
      const alarm = !s.solved.P3 && ms >= 3 * 60_000;
      if (alarm && !s.flags.silence) {
        s.setFlag('silence');
        say(spoken('p3.alarm'));
      }
      const distance = s.scene === 'roof' && s.extra.txLocked ? DISTANCE.clear : (DISTANCE_BY[s.scene] ?? DISTANCE.near);
      const key = `${distance.cutoffHz}`;
      if (key !== prevDistance) {
        prevDistance = key;
        bed.setDistance(distance);
      }
      let next = tuning.current ? signal.current : 1;
      if (alarm) next = 0;
      else if (s.solved.P6 && !s.extra.txLocked) next = Math.min(next, 0.55);
      if (Math.abs(prevSignal - next) > 0.02) {
        prevSignal = next;
        bed.setSignal(next);
      }
    };
    return () => {
      clockRef.current = () => undefined;
      bed.dispose();
      bedRef.current = null;
    };
  }, [clockRef, say]);

  useEffect(() => {
    return () => {
      for (const howl of sfxHowls.values()) howl.unload();
      sfxHowls.clear();
    };
  }, []);

  const next = ORDER.find((id) => !solved[id]) ?? '끝';
  const go = (to: string) => {
    const s = useRadioStore.getState();
    if (to === 'desk' && !s.solved.P3) return say(spoken('need.desk'));
    if (to === 'archive' && !s.solved.P5) return say(spoken('p5.locked'));
    if (to === 'roof' && !s.solved.P7) return say(spoken('p7.door'));
    s.setScene(to);
  };

  onUseRef.current = (itemId, targetId) => {
    const result = judgeItemUse(itemId, targetId, useRadioStore.getState().items);
    if (result === 'ignore') return;
    if (result === 'keys') {
      setArmed(true);
      setMode('keys');
      return;
    }
    setMode('keys');
    say(spoken(result === 'wrong' ? 'p7.wrongItem' : 'p7.need'));
  };

  const onCoffee = () => {
    const s = useRadioStore.getState();
    if (s.extra.radioCallStep >= 3 && !s.items.includes(KEYRING_ID)) {
      s.addItem(KEYRING_ID);
      say(spoken('p7.keys'));
      return;
    }
    say(spoken('p1.coffee'));
  };

  const seated = scene === 'booth' && (extra.letterPlaced || !!solved.P8);
  const controlHits = scene === 'control';
  const boothHits = scene === 'booth';
  const deskHits = scene === 'desk';
  const archiveHits = scene === 'archive';
  const roofHits = scene === 'roof';
  const showRoofKey = controlHits && !solved.P7 && items.includes(KEYRING_ID);
  const showRoofHint = controlHits && !items.includes(KEYRING_ID) && !!solved.P6;
  const showLetterPlace = deskHits && items.includes('팔칠구의 편지') && !extra.letterPlaced;
  const showArchiveTape = archiveHits && !solved.P6;
  const showArchiveWalkie = archiveHits && !!solved.P6 && !solved.P7;
  const showRoofTx = roofHits && !extra.txLocked;

  const onBoothRadio = () => {
    if (!solved.P2) return setMode('p2');
    if (solved.P4 && !solved.P5) return setMode('p5');
    say(spoken('p2.fixed'));
  };

  return (
    <>
    <div className="radio-stage">
      <div className="radio-frame">
        <img
          className="radio-scene"
          src={ROOM_SRC[scene] ?? ROOM_SRC.control}
          alt=""
          data-scene={scene}
        />
        {seated && <img className="radio-dj" src={DJ_SRC} alt="" />}
      </div>
    </div>
    {controlHits && !mode && (
      <div className="radio-hits-layer">
        <div className="radio-frame">
          <div className="radio-hits">
            <button
              type="button"
              className="radio-hit"
              data-hit="door"
              aria-label="부스 문"
              onClick={() => {
                if (!solved.P1) return setMode('p1');
                useRadioStore.getState().setScene('booth');
              }}
            />
            <button
              type="button"
              className="radio-hit"
              data-hit="envelope"
              aria-label="뜯긴 봉투"
              onClick={() => say(spoken('p1.envelope'))}
            />
            <button
              type="button"
              className="radio-hit"
              data-hit="coffee"
              aria-label="커피"
              onClick={onCoffee}
            />
          </div>
        </div>
      </div>
    )}
    {boothHits && !mode && (
      <div className="radio-hits-layer">
        <div className="radio-frame">
          <div className="radio-hits">
            <button
              type="button"
              className="radio-hit"
              data-hit="radio"
              aria-label={!solved.P2 ? '탁상 라디오' : solved.P4 && !solved.P5 ? '시험 송출' : '라디오 87.9 고정'}
              onClick={onBoothRadio}
            />
            {solved.P2 && !solved.P3 && (
              <button
                type="button"
                className="radio-hit"
                data-hit="cart"
                aria-label="카트리지"
                onClick={() => setMode('p3')}
              />
            )}
            {extra.letterPlaced && !solved.P8 && (
              <button
                type="button"
                className="radio-hit"
                data-hit="fader"
                aria-label="페이더"
                onClick={() => setMode('fader')}
              />
            )}
          </div>
        </div>
      </div>
    )}
    {deskHits && !mode && (
      <div className="radio-hits-layer">
        <div className="radio-frame">
          <div className="radio-hits">
            {!solved.P4 && (
              <button
                type="button"
                className="radio-hit"
                data-hit="board"
                aria-label="원고 보드"
                onClick={() => setMode('p4')}
              />
            )}
            {showLetterPlace && (
              <button
                type="button"
                className="radio-hit"
                data-hit="letter"
                aria-label="2번 칸에 오늘 편지"
                onClick={() => placeToday(say)}
              />
            )}
          </div>
        </div>
      </div>
    )}
    {archiveHits && !mode && (showArchiveTape || showArchiveWalkie) && (
      <div className="radio-hits-layer">
        <div className="radio-frame">
          <div className="radio-hits">
            {showArchiveTape && (
              <button
                type="button"
                className="radio-hit"
                data-hit="tape"
                aria-label="2011년 11월 선반"
                onClick={() => setMode('p6')}
              />
            )}
            {showArchiveWalkie && (
              <WalkieHit say={say} step={extra.radioCallStep} />
            )}
          </div>
        </div>
      </div>
    )}
    {showRoofTx && !mode && (
      <div className="radio-hits-layer">
        <div className="radio-frame">
          <div className="radio-hits">
            <button
              type="button"
              className="radio-hit"
              data-hit="tower"
              aria-label="송신기"
              onClick={() => setMode('tx')}
            />
          </div>
        </div>
      </div>
    )}
    {/* Above .radio-hits-layer (26): booth cart / other scene hits must not steal room nav taps. */}
    <div className="radio-nav-layer" data-scene={scene} data-next={next}>
      <p className="radio-room">
        {ROOM[scene] ?? scene} · {next}
      </p>
      <div className="radio-row">
        {scene !== 'control' && <Prop nav onClick={() => go('control')}>부조정실</Prop>}
        {scene !== 'desk' && <Prop nav onClick={() => go('desk')}>작가석</Prop>}
        {solved.P5 && scene !== 'archive' && <Prop nav onClick={() => go('archive')}>아카이브실</Prop>}
        {solved.P4 && !solved.P5 && <Prop nav icon="door" onClick={() => setMode('lock')}>아카이브 문</Prop>}
        {solved.P7 && scene !== 'roof' && <Prop nav onClick={() => go('roof')}>옥상</Prop>}
      </div>
      {(showRoofKey || showRoofHint) && (
        <div className="radio-row">
          {showRoofKey && (
            <Prop icon="door" data-use-target={ROOF_LOCK_ID} onClick={() => setMode('keys')}>
              옥상 문
            </Prop>
          )}
          {showRoofHint && (
            <Prop icon="door" onClick={() => say(spoken('p7.door'))}>옥상 문</Prop>
          )}
        </div>
      )}
    </div>
    <div
      className="radio-flow"
      data-scene={scene}
      data-next={next}
      data-open={mode ? 'yes' : undefined}
    >
      {mode && (
        <>
          <button
            type="button"
            className="radio-popup-scrim"
            aria-label="닫기"
            onClick={() => setMode(null)}
          />
          <div className="radio-popup" role="dialog" aria-modal="true" aria-label="퍼즐">
            <div className="radio-popup-panel">
              <header className="radio-popup-head">
                <span className="radio-popup-title">조작반</span>
                <button
                  type="button"
                  className="radio-popup-close"
                  onClick={() => setMode(null)}
                >
                  닫기
                </button>
              </header>
              <div className="radio-popup-scroll">
                {mode === 'p1' && <P1 say={say} />}
                {mode === 'p2' && (
                  <TunePanel
                    start={87}
                    perTurn={1}
                    stations={P2_STATIONS}
                    holdMs={P2_HOLD_MS}
                    match={(freq) => (inBand(freq, P2_HZ, P2_TOL) ? 'air' : null)}
                    onFreq={(freq, sig) => {
                      signal.current = sig;
                      tuning.current = true;
                      if (!tease.current && isP2Tease(freq)) {
                        tease.current = true;
                        const url = clips.current.tease;
                        if (url) playHtml5Clip(url);
                        say(spoken('p2.tease'));
                      }
                    }}
                    onStop={() => {
                      tuning.current = false;
                    }}
                    onHold={() => {
                      const s = useRadioStore.getState();
                      if (s.solved.P2) return;
                      s.markSolved('P2');
                      radioSfx(SFX_SRC.beep);
                      say(spoken('p2.solved'));
                      setMode(null);
                    }}
                    note={line('p2.guide')}
                  />
                )}
                {mode === 'p3' && <P3 say={say} queue={extra.cartQueue} onClose={() => setMode(null)} />}
                {mode === 'p4' && <P4 say={say} board={extra.scriptBoard} onClose={() => setMode(null)} />}
                {mode === 'p5' && (
                  <TunePanel
                    start={87.9}
                    perTurn={1}
                    stations={P5_KNOB}
                    holdMs={P5_HOLD_MS}
                    match={(freq) => {
                      const hit = stationAt(freq, p5Tol(useAppStore.getState().settings.hearingAssist));
                      if (!hit) return null;
                      if (useRadioStore.getState().extra.heardFragments.includes(hit.id)) return null;
                      return hit.id;
                    }}
                    onFreq={(_freq, sig) => {
                      signal.current = sig;
                      tuning.current = true;
                    }}
                    onStop={() => {
                      tuning.current = false;
                    }}
                    onHold={(id) => {
                      const s = useRadioStore.getState();
                      if (s.extra.heardFragments.includes(id)) return;
                      const station = P5_STATIONS.find((st) => st.id === id);
                      if (!station) return;
                      const heard = [...s.extra.heardFragments, id];
                      s.patchExtra({ heardFragments: heard });
                      const url = clips.current[id];
                      if (url) playHtml5Clip(url);
                      say(station.caption);
                      if (heard.length === 1) say(spoken('p5.first'));
                      if (heard.length === P5_STATIONS.length) say(spoken('p5.all'));
                    }}
                    note={line('p5.memo')}
                  />
                )}
                {mode === 'p5' && extra.heardFragments.length > 0 && (
                  <ul className="radio-notes" data-sheet="board">
                    {extra.heardFragments.map((id) => {
                      const station = P5_STATIONS.find((s) => s.id === id);
                      return <li key={id}>{station?.caption}</li>;
                    })}
                  </ul>
                )}
                {mode === 'lock' && <Lock say={say} onClose={() => setMode(null)} />}
                {mode === 'p6' && (
                  <P6
                    say={say}
                    counter={scrub ?? extra.tapeCounter}
                    stopped={extra.deckStopped}
                    onScrub={setScrub}
                    rewind={rewind}
                    onCall={() => setCall(P6_CALL)}
                    onClose={() => setMode(null)}
                  />
                )}
                {mode === 'keys' && (
                  <Keys
                    say={say}
                    postit={extra.trapPostit}
                    armed={armed}
                    selectedItem={selectedItem}
                    onUse={(itemId) => onUseRef.current(itemId, ROOF_LOCK_ID)}
                  />
                )}
                {mode === 'tx' && (
                  <TunePanel
                    start={88.4}
                    perTurn={P8_PER_TURN}
                    stations={P8_STATIONS}
                    holdMs={P8_HOLD_MS}
                    match={(freq) => (inBand(freq, P8_HZ, P8_TOL) ? 'tx' : null)}
                    onFreq={(freq, sig) => {
                      signal.current = sig;
                      tuning.current = true;
                      if (!other.current && freq >= 88.5) {
                        other.current = true;
                        say(spoken('p8.other'));
                      }
                    }}
                    onStop={() => {
                      tuning.current = false;
                    }}
                    onHold={() => {
                      const s = useRadioStore.getState();
                      if (s.extra.txLocked) return;
                      s.patchExtra({ txLocked: true });
                      say(spoken('p8.locked'));
                      setMode(null);
                    }}
                    note={line('p8.guide')}
                  />
                )}
                {mode === 'fader' && <Fader say={say} />}
              </div>
            </div>
          </div>
        </>
      )}

      {call && (
        <div className="radio-call" role="dialog" data-call="center">
          {call.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <button
            type="button"
            onClick={() => {
              setCall(null);
              say(spoken('p6.alive'));
            }}
          >
            받았다
          </button>
        </div>
      )}

    </div>
    </>
  );
}

function placeToday(say: SayFn) {
  const hit = nearestSnap(P4_SLOTS[1]!.x, P4_SLOTS[1]!.y, P4_SLOTS);
  if (!hit || hit.id !== '1') return;
  useRadioStore.getState().patchExtra({ letterPlaced: true });
  say(spoken('p8.placed'));
}

function P1({ say }: { say: SayFn }) {
  const [code, setCode] = useState('');
  return (
    <section className="radio-sheet">
      <img className="cuesheet" src={PROP_SRC.cuesheet} alt="" />
      <p>{line('p1.memo')}</p>
      <p>{line('p1.sheet')}</p>
      <p>{line('p1.window')}</p>
      <Keypad
        mode="numeric"
        value={code}
        onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 4))}
        onSubmit={() => {
          radioSfx(SFX_SRC.beep);
          const result = judgeP1(code);
          if (result === 'ok') {
            const s = useRadioStore.getState();
            s.markSolved('P1');
            s.setScene('booth');
            say(spoken('p1.solved'));
            return;
          }
          if (result === 'postit') {
            useRadioStore.getState().patchExtra({ trapPostit: true });
            say(spoken('p1.postit'));
            return;
          }
          say(spoken('p1.no'));
        }}
      />
    </section>
  );
}

function TunePanel({
  start,
  perTurn,
  stations,
  holdMs,
  match,
  onFreq,
  onHold,
  onStop,
  note,
}: {
  start: number;
  perTurn: number;
  stations: TuningStation[];
  holdMs: number;
  match: (freq: number) => string | null;
  onFreq: (freq: number, signal: number) => void;
  onHold: (id: string) => void;
  onStop: () => void;
  note: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const freqRef = useRef(start);
  const matchRef = useRef(match);
  const holdRef = useRef(onHold);
  const freqCb = useRef(onFreq);
  matchRef.current = match;
  holdRef.current = onHold;
  freqCb.current = onFreq;
  const [freq, setFreq] = useState(start);
  const [meter, setMeter] = useState(0);
  const [held, setHeld] = useState(0);
  const done = useRef(new Set<string>());
  const stopRef = useRef(onStop);
  stopRef.current = onStop;

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const knob = new TuningKnob({
      min: 87,
      max: 89,
      perTurn,
      snap: 0.1,
      inertiaMs: 0,
      stations,
      onChange: (value) => {
        freqRef.current = value;
        setFreq(value);
        const reading = knob.reading();
        setMeter(reading.signal);
        freqCb.current(value, reading.signal);
      },
    });
    knob.set(start);
    const off = knob.attach(node);
    const since = { id: '', at: 0 };
    const timer = window.setInterval(() => {
      const hit = matchRef.current(freqRef.current);
      if (!hit) {
        since.id = '';
        setHeld(0);
        return;
      }
      if (since.id !== hit) {
        since.id = hit;
        since.at = performance.now();
      }
      const ms = performance.now() - since.at;
      setHeld(ms);
      if (ms >= holdMs && !done.current.has(hit)) {
        done.current.add(hit);
        holdRef.current(hit);
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
      off();
      stopRef.current();
    };
  }, [holdMs, perTurn, start, stations]);

  const deg = ((freq - 87) / perTurn) * 360;
  return (
    <section className="radio-row radio-sheet" data-sheet="radio">
      <div ref={el} className="knob" aria-label="주파수 노브" data-freq={freq.toFixed(2)}>
        <div className="knob-mark" style={{ transform: `rotate(${deg}deg)` }} />
      </div>
      <div className="meter" aria-hidden>
        <span style={{ height: `${Math.round(meter * 100)}%` }} />
      </div>
      <div className="radio-sheet-readout">
        <p>숫자 창 {windowDigit(freq)}</p>
        <p>바늘 {Math.round(meter * 100)}</p>
        <p>
          유지 {(held / 1000).toFixed(1)} / {(holdMs / 1000).toFixed(0)}초
        </p>
        <p>{note}</p>
      </div>
    </section>
  );
}

function P3({
  say,
  queue,
  onClose,
}: {
  say: SayFn;
  queue: (string | null)[];
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const secs = cartQueueSecs(queue);
  const ready = judgeP3(queue) === 'ok';
  const place = (index: number) => {
    if (!picked) return;
    const hit = nearestSnap(P3_SLOTS[index]!.x, P3_SLOTS[index]!.y, P3_SLOTS);
    if (!hit) return;
    const at = Number(hit.id);
    const next = queue.map((id) => (id === picked ? null : id));
    next[at] = picked;
    useRadioStore.getState().patchExtra({ cartQueue: next });
  };
  const pct = Math.min(100, Math.round((secs / P3_TARGET_SEC) * 100));
  return (
    <section className="radio-sheet" data-sheet="cart">
      <p>{line('p3.manual')}</p>
      <p>목표 곡 시작 시각 02:03 · 채울 길이 2분 30초(150초).</p>
      <div className="radio-row">
        {CARTS.map((c) => (
          <Prop key={c.id} icon="cart" data-on={picked === c.id} onClick={() => setPicked(c.id)}>
            {c.label}
            {c.ad ? ' ·광고' : ''} {formatCartClock(c.sec)}
          </Prop>
        ))}
      </div>
      <div className="radio-row radio-sheet-slots">
        {queue.map((id, i) => {
          const cart = CARTS.find((c) => c.id === id);
          return (
            <button key={i} type="button" onClick={() => place(i)}>
              {i + 1}. {cart ? `${cart.label}${cart.ad ? ' ·광고' : ''} ${formatCartClock(cart.sec)}` : '빈 칸'}
            </button>
          );
        })}
      </div>
      <div className="radio-cart-meter" data-ready={ready ? 'yes' : 'no'}>
        <div className="radio-cart-meter-track" aria-hidden>
          <span className="radio-cart-meter-fill" style={{ width: `${pct}%` }} />
          <span className="radio-cart-meter-goal" />
        </div>
        <p>
          {formatCartClock(secs)} / 2:30
          {secs === P3_TARGET_SEC ? ' · 딱 맞음' : secs < P3_TARGET_SEC ? ` · 부족 ${P3_TARGET_SEC - secs}초` : ` · 초과 ${secs - P3_TARGET_SEC}초`}
        </p>
      </div>
      <button
        type="button"
        data-ready={ready ? 'yes' : 'no'}
        onClick={() => {
          radioSfx(SFX_SRC.cart);
          const result = judgeP3(queue);
          if (result === 'ok') {
            useRadioStore.getState().markSolved('P3');
            say(spoken('p3.solved'));
            onClose();
            return;
          }
          say(
            spoken(
              result === 'close'
                ? 'p3.close'
                : result === 'short'
                  ? 'p3.short'
                  : result === 'long'
                    ? 'p3.long'
                    : 'p3.rule',
            ),
          );
        }}
      >
        {ready ? '송출 · 2:30' : '송출'}
      </button>
    </section>
  );
}

function P4({
  say,
  board,
  onClose,
}: {
  say: SayFn;
  board: (string | null)[];
  onClose: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const place = (index: number) => {
    if (!picked) return;
    const hit = nearestSnap(P4_SLOTS[index]!.x, P4_SLOTS[index]!.y, P4_SLOTS);
    if (!hit) return;
    const at = Number(hit.id);
    if (slot2Rejects(at)) {
      say(spoken('p4.slot2'));
      return;
    }
    const next = board.map((id) => (id === picked ? null : id));
    next[at] = picked;
    useRadioStore.getState().patchExtra({ scriptBoard: next });
  };
  const shown = LETTERS.find((l) => l.id === open);
  return (
    <section className="radio-sheet" data-sheet="letter">
      <p>{line('p4.rules')}</p>
      <p>포스터: 해무 불꽃축제 10/18.</p>
      <div className="radio-row">
        {LETTERS.map((l) => (
          <Prop key={l.id} icon="letter" onClick={() => { setOpen(l.id); setPicked(l.id); }}>
            {l.id}. {l.face}
          </Prop>
        ))}
      </div>
      {shown && <p className="radio-sheet-letterback">{shown.back}</p>}
      <div className="radio-row radio-sheet-slots">
        {board.map((id, i) => (
          <button key={i} type="button" onClick={() => place(i)}>
            {i + 1}칸 {id ?? (i === 1 ? '비움' : '빈칸')}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          const result = judgeP4(board);
          if (result === 'ok') {
            useRadioStore.getState().markSolved('P4');
            say(spoken('p4.solved'));
            onClose();
            return;
          }
          say(spoken(result === 'morning' ? 'p4.morning' : result === 'same' ? 'p4.same' : 'p4.no'));
        }}
      >
        원고 확정
      </button>
    </section>
  );
}

function Lock({ say, onClose }: { say: SayFn; onClose: () => void }) {
  const dials = useRef([0, 1, 2, 3].map(() => new SafeDial(10)));
  const [pos, setPos] = useState([0, 0, 0, 0]);
  const spin = (i: number, dir: number) => {
    const dial = dials.current[i]!;
    dial.set(dial.position + dir);
    setPos(dials.current.map((d) => d.position));
  };
  return (
    <section className="radio-sheet" data-sheet="lock">
      <p>{line('p5.memo')}</p>
      <div className="radio-row radio-sheet-dials">
        {pos.map((n, i) => (
          <span key={i} className="radio-sheet-dial">
            <button type="button" onClick={() => spin(i, -1)} aria-label={`${i + 1} 감소`}>−</button>
            <b>{n}</b>
            <button type="button" onClick={() => spin(i, 1)} aria-label={`${i + 1} 증가`}>+</button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          radioSfx(SFX_SRC.lock);
          const result = judgeP5(pos.join(''));
          if (result === 'ok') {
            const s = useRadioStore.getState();
            s.markSolved('P5');
            s.setScene('archive');
            say(spoken('p5.solved'));
            onClose();
            return;
          }
          say(spoken(result === 'order' ? 'p5.order' : 'p5.no'));
        }}
      >
        자물쇠
      </button>
    </section>
  );
}

function P6({
  say,
  counter,
  stopped,
  onScrub,
  rewind,
  onCall,
  onClose,
}: {
  say: SayFn;
  counter: number;
  stopped: boolean;
  onScrub: (n: number | null) => void;
  rewind: MutableRefObject<number>;
  onCall: () => void;
  onClose: () => void;
}) {
  const shelf = useRef(new DragSort(P6_BOXES.map((b) => b.id)));
  const [order, setOrder] = useState(() => [...shelf.current.order]);
  const seen = useRadioStore((s) => !!s.flags.box1103);
  const live = useRef(counter);
  const shift = (i: number, dir: number) => {
    const to = i + dir;
    if (to < 0 || to >= order.length) return;
    shelf.current.move(i, to);
    setOrder([...shelf.current.order]);
  };
  const open = (id: string) => {
    const result = judgeP6Box(id);
    if (result === 'ok') {
      useRadioStore.getState().setFlag('box1103');
      say(spoken('p6.note'));
      return;
    }
    say(spoken(result === 'trap' ? 'p6.trap' : 'p6.no'));
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!stopped) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const origin = useRadioStore.getState().extra.tapeCounter;
    const t0 = performance.now();
    let last = t0;
    let value = origin;
    live.current = origin;
    window.clearInterval(rewind.current);
    rewind.current = window.setInterval(() => {
      const now = performance.now();
      value = Math.max(0, value - rewindRate(now - t0) * ((now - last) / 1000));
      last = now;
      live.current = Math.round(value);
      onScrub(live.current);
    }, 50);
  };
  const up = () => {
    window.clearInterval(rewind.current);
    useRadioStore.getState().patchExtra({ tapeCounter: live.current });
    onScrub(null);
  };
  return (
    <section className="radio-sheet" data-sheet="tape">
      <p>2011년 11월. 목요일마다 하나. 1027 바로 다음 칸. 그 다음 번진 칸은 수능 날.</p>
      <div className="radio-row radio-sheet-shelf">
        {order.map((id, i) => {
          const box = P6_BOXES.find((b) => b.id === id);
          return (
            <span key={id} className="radio-sheet-box">
              <button type="button" onClick={() => shift(i, -1)} aria-label="왼쪽">‹</button>
              <Prop icon="tape" onClick={() => open(id)}>{box?.label}</Prop>
              <button type="button" onClick={() => shift(i, 1)} aria-label="오른쪽">›</button>
            </span>
          );
        })}
      </div>
      {seen && (
        <>
          <p className="radio-sheet-counter">데크 2 · 카운터 {counter}</p>
          {!stopped && (
            <button
              type="button"
              onClick={() => {
                useRadioStore.getState().patchExtra({ deckStopped: true, tapeCounter: P6_ORIGIN });
                say(spoken('p6.stop'));
              }}
            >
              정지
            </button>
          )}
          {stopped && (
            <div className="radio-row radio-sheet-deck">
              <button type="button" onPointerDown={down} onPointerUp={up} onPointerCancel={up}>
                되감기
              </button>
              <button type="button" aria-label="카운터 감소" onClick={() => nudge(-1)}>
                −1
              </button>
              <button type="button" aria-label="카운터 증가" onClick={() => nudge(1)}>
                +1
              </button>
              <button
                type="button"
                onClick={() => {
                  radioSfx(SFX_SRC.tape);
                  const n = useRadioStore.getState().extra.tapeCounter;
                  if (!judgeP6Counter(n)) {
                    say(spoken('p6.miss'));
                    return;
                  }
                  useRadioStore.getState().markSolved('P6');
                  say(spoken('p6.play'));
                  onCall();
                  onClose();
                }}
              >
                재생
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function nudge(dir: number) {
  const s = useRadioStore.getState();
  const n = Math.min(P6_ORIGIN, Math.max(0, s.extra.tapeCounter + dir));
  s.patchExtra({ tapeCounter: n });
}

function WalkieHit({ say, step }: { say: SayFn; step: number }) {
  const downAt = useRef(0);
  return (
    <button
      type="button"
      className="radio-hit"
      data-hit="walkie"
      aria-label={step >= 3 ? '무전기 · 커피잔 밑' : `무전 PTT (${step}/3)`}
      onClick={() => {
        if (step >= 3) say(spoken('p1.coffee'));
      }}
      onPointerDown={(e) => {
        if (step >= 3) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        downAt.current = performance.now();
      }}
      onPointerUp={() => {
        if (step >= 3) return;
        const ms = performance.now() - downAt.current;
        if (ms < longPressMs(P7_HOLD_MS)) {
          say(spoken('p7.short'));
          return;
        }
        const s = useRadioStore.getState();
        const at = s.extra.radioCallStep;
        if (at >= 3) return;
        s.patchExtra({ radioCallStep: at + 1 });
        const keys = ['p7.1', 'p7.2', 'p7.3'] as const;
        say(spoken(keys[at] ?? 'p7.3'));
      }}
    />
  );
}

function Keys({
  say,
  postit,
  armed,
  selectedItem,
  onUse,
}: {
  say: SayFn;
  postit: boolean;
  armed: boolean;
  selectedItem: string | null;
  onUse: (itemId: string | null) => void;
}) {
  const held = useRadioStore((s) => s.items.includes(KEYRING_ID));
  return (
    <section className="radio-lock radio-sheet" data-sheet="tower" data-use-target={ROOF_LOCK_ID}>
      <p>{line('p7.need')}</p>
      {!armed && (
        <button type="button" onClick={() => onUse(selectedItem)}>
          {selectedItem ? `${selectedItem} 사용` : '가방에서 사용'}
        </button>
      )}
      {armed && held && (
        <div className="radio-row">
          {P7_TAGS.map((tag) => (
            <Prop
              key={tag}
              icon={KEY_ICON[tag]}
              onClick={() => {
                if (!useRadioStore.getState().items.includes(KEYRING_ID)) {
                  say(spoken('p7.need'));
                  return;
                }
                radioSfx(SFX_SRC.lock);
                const result = judgeKey(tag);
                if (result === 'ok') {
                  const s = useRadioStore.getState();
                  s.markSolved('P7');
                  s.setScene('roof');
                  say(spoken('p7.solved'));
                  return;
                }
                if (result === 'red') {
                  useRadioStore.getState().patchExtra({ trapRedKey: true });
                  say(spoken('p7.red'));
                  if (postit) say(spoken('p7.red.note'));
                  return;
                }
                say(spoken('p7.miss'));
              }}
            >
              {tag}
            </Prop>
          ))}
        </div>
      )}
    </section>
  );
}

function Fader({ say }: { say: SayFn }) {
  const fader = useRef(new VerticalFader());
  return (
    <section className="radio-sheet" data-sheet="fader">
      <img className="radio-sheet-glyph" src={PROP_SRC.fader} alt="" width={64} height={64} />
      <p>{line('p8.fader')}</p>
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={0}
        aria-label="마지막 곡 페이더"
        onChange={(e) => {
          fader.current.set(Number(e.target.value) / 100);
          if (!judgeFader(fader.current.value)) return;
          const s = useRadioStore.getState();
          if (s.solved.P8) return;
          radioSfx(SFX_SRC.beep);
          s.markSolved('P8');
          say(spoken('p8.ending'));
        }}
      />
    </section>
  );
}
