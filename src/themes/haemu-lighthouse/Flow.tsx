'use client';

import { useEffect, useRef, useState, type ComponentProps, type MutableRefObject, type ReactNode } from 'react';
import { Howl } from 'howler';
import { DISTANCE, RadioBed } from '@/engine/audio/RadioBed';
import { playHtml5Clip } from '@/engine/audio/html5Clip';
import { isAudioUnlocked } from '@/engine/audio/SoundManager';
import { BeamMask } from '@/engine/fx/BeamMask';
import { useAppStore } from '@/engine/save/appStore';
import { LetterCard } from '@/engine/ui/LetterCard';
import { FloorNav } from '@/engine/ui/FloorNav';
import { nearestSnap } from '@/engine/widgets/DragSnap';
import { markFound } from '@/engine/widgets/FindTap';
import { Keypad } from '@/engine/widgets/Keypad';
import { longPressMs } from '@/engine/widgets/LongPress';
import { MorseInput } from '@/engine/widgets/MorseInput';
import { RhythmPress, type RhythmSpan } from '@/engine/widgets/RhythmPress';
import { SequenceTap } from '@/engine/widgets/SequenceTap';
import { endingBeats, line, type ScriptKey } from './data/script';
import { BED_SRC, CLUE_SRC, ROOM_SRC, SFX_SRC } from './art';
import { themeHaemuLighthouse } from './index';
import {
  BEAM_HOLD_MS,
  BEAM_MAX,
  BEAM_MIN,
  BEAM_WIDTH,
  FOCUS_HOLD_MS,
  HORN_TARGET,
  LEVERS,
  MARKS,
  MORSE_U,
  P2_ORDER,
  P8_CARDS,
  P8_SLOTS,
  PRESSURE_TARGET,
  TABS,
  TUBE_DOYUN,
  WEDGE_ID,
  airOpen,
  captainAt10,
  captainAt20,
  captainAt25,
  captainAt29,
  drainShut,
  focusAligned,
  hornStepKept,
  judgeBlank,
  judgeHold,
  judgeHorn,
  judgeLevers,
  judgeLight,
  judgeP1,
  judgeRhythm,
  judgeSignal,
  judgeTab,
  judgeWedge,
  logClock,
  logComplete,
  pressureAt,
  shadowOf,
  shipBearingSince,
  type LogTab,
} from './puzzles/answers';
import { useLighthouseStore } from './store';

const ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'] as const;

const ROOM: Record<string, string> = {
  f1: '당직실',
  panel: '계단 배전반',
  f2: '무적실',
  f3: '창고',
  f4: '위 당직실',
  f5: '기계실',
  f6: '등실',
  rail: '난간',
};

const CLIMB = ['f1', 'panel', 'f2', 'f3', 'f4', 'f5', 'f6', 'rail'];

const SCENE_FLOOR: Record<string, string | undefined> = {
  f1: '1',
  f2: '2',
  f3: '3',
  f4: '4',
  f5: '5',
  f6: '6',
  rail: '6',
};

const FLOOR_SCENE: Record<string, string> = {
  '1': 'f1',
  '2': 'f2',
  '3': 'f3',
  '4': 'f4',
  '5': 'f5',
  '6': 'f6',
};

const DISTANCE_BY: Record<string, (typeof DISTANCE)[keyof typeof DISTANCE]> = {
  f1: DISTANCE.clear,
  panel: DISTANCE.near,
  f2: DISTANCE.near,
  f3: DISTANCE.near,
  f4: DISTANCE.far,
  f5: DISTANCE.far,
  f6: DISTANCE.buried,
  rail: DISTANCE.buried,
};

const LOOK: Record<string, ScriptKey> = {
  gull: 'p4.gull',
  boatA: 'p4.a',
  buoy: 'p4.buoy',
  boatB: 'p4.b',
  red: 'p4.red',
  rock: 'p4.rock',
};

let fairMs = 0;

const sfxHowls = new Map<string, Howl>();

function lhSfx(url: string) {
  if (!isAudioUnlocked()) return;
  let howl = sfxHowls.get(url);
  if (!howl) {
    howl = new Howl({ src: [url], volume: 0.35 });
    sfxHowls.set(url, howl);
  }
  howl.play();
}

function hear(kind: keyof typeof CLUE_SRC) {
  playHtml5Clip(CLUE_SRC[kind]);
}

function Prop({
  icon,
  nav,
  className,
  children,
  ...rest
}: ComponentProps<'button'> & { icon?: string; nav?: boolean; children?: ReactNode }) {
  const cls = [nav ? 'lh-nav' : 'lh-prop', className].filter(Boolean).join(' ');
  return (
    <button type="button" {...rest} className={cls}>
      {icon ? <img src={`/themes/haemu-lighthouse/props/${icon}.svg`} alt="" /> : null}
      {children}
    </button>
  );
}

type Stamp = (id: 'P3' | 'P6' | 'P7') => void;

export function LighthouseFlow({
  say,
  clockRef,
  selectedItem,
  onUseRef,
}: {
  say: (text: string) => void;
  clockRef: MutableRefObject<(ms: number) => void>;
  selectedItem: string | null;
  onUseRef: MutableRefObject<(itemId: string | null, targetId: string) => void>;
}) {
  const scene = useLighthouseStore((s) => s.scene);
  const solved = useLighthouseStore((s) => s.solved);
  const flags = useLighthouseStore((s) => s.flags);
  const quiet = useAppStore((s) => s.settings.reduceEffects);
  const elapsedRef = useRef(0);
  const [beat, setBeat] = useState<number | null>(null);
  const sayRef = useRef(say);
  sayRef.current = say;

  const stamp = (id: 'P3' | 'P6' | 'P7') => {
    const s = useLighthouseStore.getState();
    s.patchExtra({ solvedAt: { ...s.extra.solvedAt, [id]: elapsedRef.current } });
  };

  useEffect(() => {
    const s = useLighthouseStore.getState();
    const next = hornStepKept(s.extra.hornStep, false, !!s.solved.P6);
    if (next !== s.extra.hornStep) s.patchExtra({ hornStep: next });
  }, []);

  useEffect(() => {
    const s = useLighthouseStore.getState();
    const next = hornStepKept(s.extra.hornStep, scene === 'f2', !!s.solved.P6);
    if (next !== s.extra.hornStep) s.patchExtra({ hornStep: next });
    const floor = SCENE_FLOOR[scene];
    if (floor && !s.flags[`v${floor}`]) s.setFlag(`v${floor}`);
    if (scene === 'f3' && !useLighthouseStore.getState().flags.said3) {
      useLighthouseStore.getState().setFlag('said3');
      sayRef.current(line('f3.line'));
    }
    if (scene === 'f5' && !useLighthouseStore.getState().flags.said5) {
      useLighthouseStore.getState().setFlag('said5');
      sayRef.current(line('f5.line'));
    }
    if (scene === 'f4' && !useLighthouseStore.getState().flags.p5hello) {
      useLighthouseStore.getState().setFlag('p5hello');
      hear('tube');
      sayRef.current(line('p5.tube'));
    }
    if (scene === 'f4' && s.solved.P7 && !s.solved.P8 && !useLighthouseStore.getState().flags.p8ask) {
      useLighthouseStore.getState().setFlag('p8ask');
      hear('tube');
      sayRef.current(line('p8.go1'));
      sayRef.current(line('p8.go2'));
    }
  }, [scene]);

  useEffect(() => {
    const sounds = { ...BED_SRC };
    const bed = new RadioBed(themeHaemuLighthouse.radioBed, { sounds, startClock: '02:00' });
    let prev = '';
    let horn: Howl | null = null;
    const tellCaptain = (text: string | null) => {
      if (!text) return;
      hear('captain');
      sayRef.current(text);
    };
    clockRef.current = (ms) => {
      elapsedRef.current = ms;
      fairMs = ms;
      bed.sync(ms);
      const s = useLighthouseStore.getState();
      const distance = DISTANCE_BY[s.scene] ?? DISTANCE.near;
      const key = String(distance.cutoffHz);
      if (key !== prev) {
        prev = key;
        bed.setDistance(distance);
      }
      bed.setSignal(ms >= 20 * 60_000 ? 0.62 : 1);
      if (s.solved.P6 && !horn && isAudioUnlocked()) {
        horn = new Howl({ src: [SFX_SRC.horn], loop: true, volume: 0.16 });
        horn.play();
      }
      if (horn) horn.volume(s.scene === 'rail' ? 0.42 : 0.16);
      once('c10', ms >= 10 * 60_000, () => {
        tellCaptain(captainAt10(useLighthouseStore.getState().solved));
      });
      once('c20', ms >= 20 * 60_000, () => {
        const live = useLighthouseStore.getState();
        tellCaptain(captainAt20(live.solved));
        hear('doyun');
        sayRef.current(TUBE_DOYUN);
      });
      once('c25', ms >= 25 * 60_000, () => {
        tellCaptain(captainAt25(useLighthouseStore.getState().solved));
      });
      once('c29', ms >= 29 * 60_000, () => {
        tellCaptain(captainAt29(useLighthouseStore.getState().solved));
      });
      const live = useLighthouseStore.getState();
      if (live.solved.P6 && ms >= live.extra.solvedAt.P6 + 10_000) {
        once('redLight', true, () => {
          hear('captain');
          sayRef.current(line('p7.warn'));
          hear('tube');
          sayRef.current(line('p7.tube1'));
          sayRef.current(line('p7.tube2'));
        });
      }
    };
    return () => {
      clockRef.current = () => undefined;
      bed.dispose();
      horn?.unload();
      for (const howl of sfxHowls.values()) howl.unload();
      sfxHowls.clear();
    };
  }, [clockRef]);

  const applyWedge = (itemId: string | null) => {
    const s = useLighthouseStore.getState();
    const result = judgeWedge(itemId, HORN_TARGET, s.items, s.extra.hornStep);
    if (result === 'ignore') return;
    if (result === 'ok') {
      if (s.solved.P6) return;
      stamp('P6');
      useLighthouseStore.getState().markSolved('P6');
      hear('captain');
      say(line('p6.solved'));
      hear('tube');
      say(line('p6.tube'));
      say(line('horn.loop'));
      return;
    }
    const key = result === 'early' ? 'p6.early' : result === 'wrong' ? 'p6.wrong' : 'p6.need';
    say(line(key));
  };
  onUseRef.current = (itemId, targetId) => {
    if (targetId && targetId !== HORN_TARGET) return;
    applyWedge(itemId);
  };

  const go = (dir: -1 | 1) => {
    const s = useLighthouseStore.getState();
    const index = CLIMB.indexOf(s.scene);
    const to = CLIMB[index + dir];
    if (!to) return;
    if (dir > 0 && s.scene === 'f1' && !s.solved.P1) return say(line('need.door'));
    if (dir > 0 && s.scene === 'panel' && !s.solved.P2) return say(line('need.power'));
    if (dir > 0 && s.scene === 'f6' && !s.solved.P3) return say(line('need.lamp'));
    s.setScene(to);
  };

  const visited = ['1', '2', '3', '4', '5', '6'].filter((id) => flags[`v${id}`]);
  const floors = themeHaemuLighthouse.hud.floorNav?.floors ?? [];
  const next = ORDER.find((id) => !solved[id]) ?? '끝';
  const roomSrc = scene === 'f6' && solved.P3 ? ROOM_SRC.f6main : (ROOM_SRC[scene] ?? ROOM_SRC.f1);

  return (
    <div className="lighthouse-flow" data-scene={scene} data-next={next} data-lamp={solved.P3 ? 'main' : 'spare'}>
      <img className="lighthouse-scene" src={roomSrc} alt="" />
      {solved.P3 && (scene === 'f6' || scene === 'rail') ? <div className="lighthouse-main-glow" aria-hidden /> : null}
      <p className="radio-room">
        {ROOM[scene] ?? scene} · {next} · {solved.P3 ? '주등' : '예비등'}
        {solved.P6 ? ` · ${line('horn.loop')}` : ''}
      </p>
      <FloorNav
        floors={floors}
        visited={visited}
        current={SCENE_FLOOR[scene]}
        reduceEffects={quiet}
        onGo={(id) => {
          const to = FLOOR_SCENE[id];
          if (to) useLighthouseStore.getState().setScene(to);
        }}
      />
      <div className="radio-row">
        {CLIMB.indexOf(scene) > 0 && (
          <Prop nav icon="stair" onClick={() => go(-1)}>
            아래로
          </Prop>
        )}
        {CLIMB.indexOf(scene) < CLIMB.length - 1 && (
          <Prop nav icon="stair" onClick={() => go(1)}>
            위로
          </Prop>
        )}
      </div>

      {scene === 'f1' && <Duty say={say} />}
      {scene === 'panel' && <Panel say={say} />}
      {scene === 'f2' && <Horn say={say} selectedItem={selectedItem} onWedge={applyWedge} />}
      {scene === 'f4' && <Logs say={say} onSign={() => setBeat(0)} />}
      {scene === 'f6' && <Lamp say={say} stamp={stamp} />}
      {scene === 'rail' && solved.P3 && (
        <BeamPlay say={say} mode={solved.P6 ? 'p7' : 'p4'} stamp={stamp} />
      )}

      {beat != null && !solved.P8 && (
        <div className="lighthouse-ending" role="dialog">
          <p>{line(endingBeats[beat] ?? 'end.title')}</p>
          <button
            type="button"
            onClick={() => {
              if (beat >= endingBeats.length - 1) {
                const s = useLighthouseStore.getState();
                if (!s.solved.P8) {
                  s.markSolved('P8');
                  s.setScene('f1');
                }
                return;
              }
              setBeat(beat + 1);
            }}
          >
            {beat >= endingBeats.length - 1 ? '끝' : '다음'}
          </button>
        </div>
      )}
    </div>
  );
}

function once(flag: string, ready: boolean, run: () => void) {
  if (!ready) return;
  const s = useLighthouseStore.getState();
  if (s.flags[flag]) return;
  s.setFlag(flag);
  run();
}

function addNote(id: string, text: string) {
  const s = useLighthouseStore.getState();
  if (s.notebook.some((note) => note.id === id)) return;
  useLighthouseStore.setState({ notebook: [...s.notebook, { id, text }] });
}

function Duty({ say }: { say: (text: string) => void }) {
  const solved = useLighthouseStore((s) => !!s.solved.P1);
  const [code, setCode] = useState('');
  const clue = (key: ScriptKey, note?: string) => {
    say(line(key));
    if (note) addNote(key, line(key));
  };
  return (
    <section>
      <div className="radio-row">
        <Prop icon="door" onClick={() => clue('p1.door')}>철문</Prop>
        <Prop icon="lid" onClick={() => clue('p1.lid', 'lid')}>열쇠함 뚜껑</Prop>
        <Prop icon="plate" className="lh-wide" onClick={() => clue('p1.plate', 'plate')}>계단 명판</Prop>
        <Prop icon="window" className="lh-wide" onClick={() => clue('p1.window', 'window')}>창문</Prop>
        <Prop icon="chart" className="lh-wide" onClick={() => clue('p1.chart')}>옛 해도</Prop>
        <Prop icon="plan" onClick={() => clue('p1.plan')}>계획서</Prop>
        <Prop icon="receipt" onClick={() => clue('p1.receipt')}>영수증</Prop>
        <Prop icon="radio" onClick={() => clue('p1.radio')}>라디오</Prop>
      </div>
      {!solved && (
        <Keypad
          mode="numeric"
          value={code}
          onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 4))}
          onSubmit={() => {
            const result = judgeP1(code);
            if (result === 'ok') {
              lhSfx(SFX_SRC.door);
              useLighthouseStore.getState().markSolved('P1');
              say(line('p1.solved'));
              return;
            }
            if (result === 'chart') {
              useLighthouseStore.getState().patchExtra({ trapOldChart: true });
              say(line('p1.chartWrong'));
              return;
            }
            say(line('p1.no'));
          }}
        />
      )}
    </section>
  );
}

function Panel({ say }: { say: (text: string) => void }) {
  const order = useLighthouseStore((s) => s.extra.breakerUp);
  const solved = useLighthouseStore((s) => !!s.solved.P2);
  const downAt = useRef(0);
  const pull = (id: string) => {
    const lever = LEVERS.find((item) => item.id === id);
    if (!lever?.down) return say(line('p2.up'));
    const s = useLighthouseStore.getState();
    if (s.extra.breakerUp.includes(id) || s.solved.P2) return;
    lhSfx(SFX_SRC.lever);
    const next = [...s.extra.breakerUp, id];
    const verdict = judgeLevers(next);
    if (verdict === 'ok' && !new SequenceTap([...P2_ORDER]).check(next)) return;
    if (verdict === 'reset') {
      s.patchExtra({ breakerUp: [] });
      say(line('p2.drop'));
      return;
    }
    s.patchExtra({ breakerUp: next });
    if (verdict === 'ok') {
      s.markSolved('P2');
      say(line('p2.solved'));
      say(line('p2.tubeSilent'));
    }
  };
  return (
    <section>
      <img
        className="lh-figure"
        src="/themes/haemu-lighthouse/props/floors.svg"
        alt="1 파랑 당직실, 2 초록 무적실, 3 흰색 창고, 4 검정 위 당직실, 5 노랑 기계실, 6 빨강 등실"
      />
      <div className="radio-row">
        <Prop
          icon="tube"
          onPointerDown={() => {
            downAt.current = performance.now();
          }}
          onPointerUp={() => {
            if (performance.now() - downAt.current < longPressMs()) {
              say(line('p2.short'));
              return;
            }
            useLighthouseStore.getState().setFlag('tube');
            hear('tube');
            say(line('p2.tube'));
          }}
        >
          전성관 구멍
        </Prop>
        <Prop icon="note" onClick={() => say(line('p2.note'))}>쪽지</Prop>
        <Prop
          icon="floors"
          onClick={() => {
            addNote('floors', line('p2.floors'));
            say(line('p2.floors'));
          }}
        >
          층 안내판
        </Prop>
      </div>
      <p>{line('p2.levers')}</p>
      <div className="radio-row">
        {LEVERS.map((lever) => {
          const raised = !lever.down || order.includes(lever.id) || solved;
          return (
            <Prop key={lever.id} icon="lever" data-lever={lever.id} onClick={() => pull(lever.id)}>
              {lever.label} {raised ? '올림' : '내림'}
            </Prop>
          );
        })}
      </div>
    </section>
  );
}

function Lamp({ say, stamp }: { say: (text: string) => void; stamp: Stamp }) {
  const slot = useLighthouseStore((s) => s.extra.changerSlot);
  const focus = useLighthouseStore((s) => s.extra.focus);
  const solved = useLighthouseStore((s) => !!s.solved.P3);
  const [lit, setLit] = useState(false);
  const [tapped4, setTapped4] = useState(false);
  const flipped = useRef(false);
  const stampRef = useRef(stamp);
  stampRef.current = stamp;
  const shadow = shadowOf(focus);

  useEffect(() => {
    if (solved || !lit || !focusAligned(focus)) return;
    const timer = window.setTimeout(() => {
      const s = useLighthouseStore.getState();
      if (s.solved.P3 || !focusAligned(s.extra.focus)) return;
      stampRef.current('P3');
      useLighthouseStore.getState().markSolved('P3');
      say(line('p3.solved'));
      hear('captain');
      say(line('p3.cap1'));
      say(line('p3.cap2'));
      hear('tube');
      say(line('p3.tube'));
    }, FOCUS_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [focus, lit, solved, say]);

  const setFocus = (axis: 'x' | 'y', raw: number) => {
    if (!flipped.current) {
      flipped.current = true;
      say(line('p3.flip'));
    }
    const s = useLighthouseStore.getState();
    s.patchExtra({ focus: { ...s.extra.focus, [axis]: raw / 100 } });
  };

  return (
    <section>
      <p>{line('p3.room')}</p>
      <div className="radio-row">
        <Prop icon="note" onClick={() => say(line('p3.note'))}>교환기 쪽지</Prop>
        <Prop icon="plaque" onClick={() => say(line('p3.plate'))}>확인창 명판</Prop>
      </div>
      {!solved && (
        <>
          <label>
            교환기
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              aria-label="전구 교환기"
              value={slot}
              onChange={(event) => {
                setLit(false);
                useLighthouseStore.getState().patchExtra({ changerSlot: Number(event.target.value) });
              }}
            />
          </label>
          <div className="radio-row">
            {([1, 2, 3, 4] as const).map((n) => (
              <Prop
                key={n}
                icon={(['bulb-dead', 'bulb-soot', 'bulb-ok', 'bulb-loose'] as const)[n - 1]}
                onClick={() => {
                  if (n === 4 && tapped4) say(line('p3.b4b'));
                  else say(line(`p3.b${n}` as ScriptKey));
                  if (n === 4) setTapped4(true);
                }}
              >
                {n}번 보기
              </Prop>
            ))}
            <Prop
              icon="bulb-ok"
              onClick={() => {
                const result = judgeLight(slot);
                if (result === 'ok') {
                  lhSfx(SFX_SRC.lamp);
                  setLit(true);
                  say(line('p3.spread'));
                  return;
                }
                setLit(false);
                say(line(result === 'dead' ? 'p3.dead' : result === 'dim' ? 'p3.dim' : 'p3.flash'));
              }}
            >
              점등
            </Prop>
          </div>
          {lit && (
            <>
              <div className="lighthouse-focus" aria-hidden>
                <i className="lighthouse-cross" />
                <i
                  className="lighthouse-shadow"
                  style={{
                    left: `${50 + shadow.x * 40}%`,
                    top: `${50 + shadow.y * 40}%`,
                  }}
                />
              </div>
              <label>
                가로 나사
                <input
                  type="range"
                  min={-100}
                  max={100}
                  aria-label="가로 나사"
                  value={Math.round(focus.x * 100)}
                  onChange={(event) => setFocus('x', Number(event.target.value))}
                />
              </label>
              <label>
                세로 나사
                <input
                  type="range"
                  min={-100}
                  max={100}
                  aria-label="세로 나사"
                  value={Math.round(focus.y * 100)}
                  onChange={(event) => setFocus('y', Number(event.target.value))}
                />
              </label>
            </>
          )}
        </>
      )}
    </section>
  );
}

function BeamPlay({
  say,
  mode,
  stamp,
}: {
  say: (text: string) => void;
  mode: 'p4' | 'p7';
  stamp: Stamp;
}) {
  const padRef = useRef<HTMLDivElement>(null);
  const shutterRef = useRef<HTMLButtonElement>(null);
  const modeRef = useRef(mode);
  const sayRef = useRef(say);
  const stampRef = useRef(stamp);
  modeRef.current = mode;
  sayRef.current = say;
  stampRef.current = stamp;
  const [deg, setDeg] = useState(BEAM_MIN);
  const [inside, setInside] = useState<string[]>([]);
  const [shipDeg, setShipDeg] = useState(135);
  const [code, setCode] = useState('');
  const [cardOpen, setCardOpen] = useState(false);
  const insideRef = useRef<string[]>([]);

  useEffect(() => {
    const s = useLighthouseStore.getState();
    if (!s.flags.beamGuide) {
      s.setFlag('beamGuide');
      say(line('p4.guide'));
    }
    if (!s.flags.p4brief) {
      s.setFlag('p4brief');
      hear('captain');
      say(line('p4.cap'));
    }
    if (mode === 'p7' && !useLighthouseStore.getState().flags.p7moved) {
      useLighthouseStore.getState().setFlag('p7moved');
      hear('captain');
      say(line('p7.moved'));
    }
  }, [mode, say]);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    const said = new Set<string>();
    const beam = new BeamMask({
      min: BEAM_MIN,
      max: BEAM_MAX,
      widthDeg: BEAM_WIDTH,
      holdMs: BEAM_HOLD_MS,
      targets: MARKS.map((mark) => ({ id: mark.id, deg: mark.deg })),
      onChange: (next) => setDeg(next),
      onInBeam: (id) => {
        if (said.has(id)) return;
        said.add(id);
        const key = LOOK[id];
        if (key) sayRef.current(line(key));
      },
      onHeld: (id) => {
        if (modeRef.current !== 'p4') return;
        const verdict = judgeHold(id);
        const s = useLighthouseStore.getState();
        if (verdict === 'ok' && !s.solved.P4) {
          s.markSolved('P4');
          addNote('ship', line('p4.solved'));
          hear('captain');
          sayRef.current(line('p4.solved'));
          sayRef.current(line('p4.fog'));
          hear('tube');
          sayRef.current(line('p4.tube'));
        }
        if (verdict === 'trap') {
          s.patchExtra({ trapBoat8: true });
          hear('captain');
          sayRef.current(line('p4.trap'));
        }
      },
    });
    const off = beam.attach(pad);
    const timer = window.setInterval(() => {
      const live = useLighthouseStore.getState();
      const bearing = shipBearingSince(0, 0);
      const started = live.extra.solvedAt.P6 + 10_000;
      const ship = live.solved.P6 ? shipBearingSince(elapsedNow(), started) : bearing;
      setShipDeg(ship);
      beam.setTarget('boatB', modeRef.current === 'p7' ? ship : 110);
      beam.reduceEffects = useAppStore.getState().settings.reduceEffects;
      beam.sample(performance.now());
      const lit = beam.inside();
      insideRef.current = lit;
      setInside(lit);
    }, 100);
    return () => {
      window.clearInterval(timer);
      off();
    };
  }, []);

  useEffect(() => {
    const el = shutterRef.current;
    if (!el || mode !== 'p7') return;
    const morse = new MorseInput({
      onChange: (next) => setCode(next),
      onLetter: (next) => {
        const verdict = judgeSignal(next, insideRef.current);
        if (verdict === 'ok') {
          const s = useLighthouseStore.getState();
          if (s.solved.P7) return;
          stampRef.current('P7');
          useLighthouseStore.getState().markSolved('P7');
          hear('captain');
          sayRef.current(line('p7.solved'));
          sayRef.current(line('p7.chart'));
          hear('tube');
          sayRef.current(line('p7.tube'));
          return;
        }
        if (verdict === 'red') {
          useLighthouseStore.getState().patchExtra({ trapRedSignal: true });
          hear('tube');
          sayRef.current(line('p7.red'));
          return;
        }
        if (verdict === 'no') hear('captain');
        sayRef.current(line(verdict === 'miss' ? 'p7.miss' : 'p7.no'));
      },
    });
    const off = morse.attach(el);
    const timer = window.setInterval(() => morse.tick(performance.now()), 100);
    return () => {
      window.clearInterval(timer);
      off();
    };
  }, [mode]);

  const from = deg - BEAM_WIDTH / 2;
  return (
    <section>
      <div ref={padRef} className="beam-pad" aria-label="탐조등">
        <div
          className="beam-wedge"
          style={{
            background: `conic-gradient(from ${from}deg, rgba(230,230,230,0.95) 0deg, rgba(170,170,170,0.35) ${Math.max(0, BEAM_WIDTH - 6)}deg, transparent ${BEAM_WIDTH}deg, transparent 360deg)`,
          }}
        />
        {MARKS.map((mark) => (
          <span
            key={mark.id}
            className="beam-mark"
            data-mark={mark.id}
            data-lit={inside.includes(mark.id) ? 'yes' : 'no'}
            style={polar(mark.id === 'boatB' ? shipDeg : mark.deg, 42)}
          />
        ))}
      </div>
      <p data-deg={deg.toFixed(0)}>방위 {deg.toFixed(0)}°</p>
      {mode === 'p7' && (
        <>
          <Prop
            icon="card"
            onClick={() => {
              setCardOpen(true);
              say(line('p7.card'));
            }}
          >
            덮개 카드
          </Prop>
          {cardOpen ? (
            <img className="lh-figure" src="/themes/haemu-lighthouse/props/card.svg" alt="국제신호 U. 짧게, 짧게, 길게." />
          ) : null}
          <p className="morse-read" data-code={code}>
            {code || '대기'} {code === MORSE_U ? '' : ''}
          </p>
          <button ref={shutterRef} type="button" className="lh-prop">
            <img src="/themes/haemu-lighthouse/props/shutter.svg" alt="" />
            셔터
          </button>
        </>
      )}
    </section>
  );
}

function elapsedNow(): number {
  return fairMs;
}

function Logs({ say, onSign }: { say: (text: string) => void; onSign: () => void }) {
  const solved = useLighthouseStore((s) => s.solved);
  const items = useLighthouseStore((s) => s.items);
  const [page, setPage] = useState<LogTab | null>(null);
  const open = (tab: LogTab) => {
    const s = useLighthouseStore.getState();
    const first = !s.extra.tabsOpened.includes(tab.id);
    const seenBlue = s.extra.tabsOpened.some((id) => TABS.find((item) => item.id === id)?.color === 'blue');
    const targets = TABS.map((item) => ({ id: item.id, found: s.extra.tabsOpened.includes(item.id) }));
    const opened = markFound(targets, tab.id)
      .filter((item) => item.found)
      .map((item) => item.id);
    s.patchExtra({ tabsOpened: opened });
    lhSfx(SFX_SRC.page);
    setPage(tab);
    const verdict = judgeTab(tab);
    if (verdict === 'ok') {
      if (!s.solved.P5) {
        s.markSolved('P5');
        addNote('procedure', '무적 수동 기동. 압축기, 압력 7, 배수, 공기, 2초·2초·2초, 쐐기.');
        addNote('blues', '파란 띠지 287장');
        say(line('p5.solved'));
        say(line('p5.flip'));
        hear('tube');
        say(line('p5.reason'));
      }
      return;
    }
    if (!first) {
      if (tab.color === 'blue') say(line('p5.short'));
      return;
    }
    if (tab.color === 'red') say(line('p5.red'));
    if (tab.id === 'y-2009') say(line('p5.yellow'));
    if (tab.id === 'y-2026') say(line('p5.blank'));
    if (tab.color === 'blue') say(line(seenBlue ? 'p5.short' : 'p5.blue'));
  };
  return (
    <section>
      <p>{line('p5.room')}</p>
      <div className="radio-row">
        <Prop icon="manual" onClick={() => say(line('p5.manual'))}>매뉴얼</Prop>
        <Prop
          icon="plaque"
          onClick={() => {
            addNote('plate', line('p5.plate'));
            say(line('p5.plate'));
          }}
        >
          준공 명판
        </Prop>
        {solved.P5 && !items.includes(WEDGE_ID) && (
          <Prop
            icon="drawer"
            onClick={() => {
              lhSfx(SFX_SRC.wedge);
              useLighthouseStore.getState().addItem(WEDGE_ID);
              say(line('p5.wedge'));
            }}
          >
            선반 서랍
          </Prop>
        )}
      </div>
      <div className="radio-row">
        {TABS.map((tab) => (
          <Prop
            key={tab.id}
            icon={tab.color === 'red' ? 'ribbon-red' : tab.color === 'blue' ? 'ribbon-blue' : 'ribbon-yellow'}
            data-tab={tab.id}
            onClick={() => open(tab)}
          >
            {tab.color === 'red' ? '빨강' : tab.color === 'blue' ? '파랑' : '노랑'} {tab.shape} {tab.date}
            {tab.old ? ' 낮은 칸' : ''}
          </Prop>
        ))}
      </div>
      <LetterCard
        open={!!page}
        title={page ? `${page.date} ${page.shape}` : undefined}
        body={page?.body ?? ''}
        onClose={() => setPage(null)}
      />
      {solved.P7 && !solved.P8 && <LogBoard say={say} onSign={onSign} />}
    </section>
  );
}

function LogBoard({ say, onSign }: { say: (text: string) => void; onSign: () => void }) {
  const blanks = useLighthouseStore((s) => s.extra.logBlanks);
  const solvedAt = useLighthouseStore((s) => s.extra.solvedAt);
  const notes = useLighthouseStore((s) => s.notebook);
  const boardRef = useRef<HTMLDivElement>(null);
  const told = useRef(false);
  const drop = (label: string, clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((clientX - rect.left) / rect.width) * 320;
    const y = ((clientY - rect.top) / rect.height) * 80;
    const hit = nearestSnap(x, y, P8_SLOTS);
    if (!hit) return;
    const index = Number(hit.id);
    const s = useLighthouseStore.getState();
    if (s.extra.logBlanks[index]) return;
    if (judgeBlank(index, label) !== 'ok') {
      say(line('p8.no'));
      return;
    }
    const next = [...s.extra.logBlanks];
    next[index] = label;
    s.patchExtra({ logBlanks: next });
    if (!told.current) {
      told.current = true;
      say(line('p8.time'));
    }
    if (logComplete(next)) say(line('p8.sum'));
  };
  return (
    <section>
      <p>{line('p8.page')}</p>
      <p>
        주등 {logClock(solvedAt.P3)} · 무적 {logClock(solvedAt.P6)} · 입항 {logClock(solvedAt.P7)}
      </p>
      <div ref={boardRef} className="lighthouse-board" data-log-board>
        {P8_SLOTS.map((slot, index) => (
          <span key={slot.id} className="lighthouse-blank" data-blank={slot.id} style={{ left: slot.x - 36, top: 8 }}>
            {blanks[index] ?? '빈칸'}
          </span>
        ))}
      </div>
      <div className="radio-row">
        {P8_CARDS.map((card) => (
          <Card key={card} label={card} onDrop={drop} />
        ))}
      </div>
      {notes.length > 0 && (
        <ul className="radio-notes">
          {notes.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}
      {logComplete(blanks) && (
        <Prop
          icon="sign"
          onClick={() => {
            hear('tube');
            say(line('p8.sign'));
            say(line('p8.tube'));
            onSign();
          }}
        >
          인수 · 주무관
        </Prop>
      )}
    </section>
  );
}

function Card({
  label,
  onDrop,
}: {
  label: string;
  onDrop: (label: string, x: number, y: number) => void;
}) {
  return (
    <Prop
      icon="slip"
      data-card={label}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const pointerId = event.pointerId;
        const up = (ev: PointerEvent) => {
          if (ev.pointerId !== pointerId) return;
          window.removeEventListener('pointerup', up);
          onDrop(label, ev.clientX, ev.clientY);
        };
        window.addEventListener('pointerup', up);
      }}
    >
      {label}
    </Prop>
  );
}

function Horn({
  say,
  selectedItem,
  onWedge,
}: {
  say: (text: string) => void;
  selectedItem: string | null;
  onWedge: (itemId: string | null) => void;
}) {
  const step = useLighthouseStore((s) => s.extra.hornStep);
  const known = useLighthouseStore((s) => !!s.solved.P5);
  const solved = useLighthouseStore((s) => !!s.solved.P6);
  const [needle, setNeedle] = useState(0);
  const [drain, setDrain] = useState(0);
  const [air, setAir] = useState(0);

  useEffect(() => {
    if (step !== 0) return;
    setNeedle(0);
    setDrain(0);
    setAir(0);
  }, [step]);

  useEffect(() => {
    if (step !== 1) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const next = pressureAt(performance.now() - started);
      setNeedle(next);
      if (next < PRESSURE_TARGET) return;
      const s = useLighthouseStore.getState();
      if (s.extra.hornStep === 1) s.patchExtra({ hornStep: 2 });
    }, 100);
    return () => window.clearInterval(timer);
  }, [step]);

  if (!known) {
    return (
      <section>
        <p>{line('p6.room')}</p>
        <Prop icon="horn" onClick={() => say(line('p6.unknown'))}>
          무적 손잡이
        </Prop>
      </section>
    );
  }
  if (solved) {
    return (
      <section>
        <p>{line('horn.loop')}</p>
      </section>
    );
  }

  const act = (action: 'compressor' | 'drain' | 'air' | 'sound') => {
    const s = useLighthouseStore.getState();
    const verdict = judgeHorn(s.extra.hornStep, action, needle);
    if (verdict.step !== s.extra.hornStep) s.patchExtra({ hornStep: verdict.step });
    if (verdict.result === 'water') say(line('p6.water'));
    if (verdict.result === 'weak') say(line('p6.weak'));
    if (verdict.result === 'wait') say(line('p6.wait'));
    if (verdict.result === 'advance' && action === 'compressor') say(line('p6.comp'));
    if (verdict.result === 'ready' && action === 'air') say(line('p6.air'));
  };

  return (
    <section>
      <p>{line('p6.known')}</p>
      <p data-needle={needle.toFixed(1)}>압력 {needle.toFixed(1)}</p>
      {step === 0 && (
        <Prop
          icon="compressor"
          onClick={() => {
            lhSfx(SFX_SRC.machine);
            act('compressor');
          }}
        >
          압축기
        </Prop>
      )}
      <label>
        배수 밸브
        <input
          type="range"
          min={0}
          max={180}
          aria-label="배수 밸브"
          value={drain}
          onChange={(event) => {
            const value = Number(event.target.value);
            setDrain(value);
            if (drainShut(value)) act('drain');
          }}
        />
      </label>
      <label>
        공기 밸브
        <input
          type="range"
          min={0}
          max={180}
          aria-label="공기 밸브"
          value={air}
          onChange={(event) => {
            const value = Number(event.target.value);
            setAir(value);
            if (airOpen(value)) act('air');
          }}
        />
      </label>
      {step < 4 && (
        <Prop icon="horn" onClick={() => act('sound')}>
          무적 손잡이
        </Prop>
      )}
      {step === 4 && (
        <RhythmPad
          onDone={() => {
            const s = useLighthouseStore.getState();
            if (s.extra.hornStep === 4) s.patchExtra({ hornStep: 5 });
          }}
          onBad={() => {
            hear('tube');
            say(line('p6.miss'));
          }}
        />
      )}
      {step === 5 && (
        <div className="radio-row">
          <Prop
            icon="wedge"
            data-use-target={HORN_TARGET}
            onClick={() => {
              lhSfx(SFX_SRC.wedge);
              const owned = useLighthouseStore.getState().items;
              onWedge(selectedItem ?? (owned.includes(WEDGE_ID) ? WEDGE_ID : null));
            }}
          >
            손잡이에 쐐기
          </Prop>
          <Prop
            icon="horn"
            onClick={() => {
              useLighthouseStore.getState().patchExtra({ hornStep: 4 });
              say(line('p6.letgo'));
            }}
          >
            손 뗌
          </Prop>
        </div>
      )}
    </section>
  );
}

function RhythmPad({ onDone, onBad }: { onDone: () => void; onBad: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(onDone);
  const badRef = useRef(onBad);
  doneRef.current = onDone;
  badRef.current = onBad;
  const [spans, setSpans] = useState<RhythmSpan[]>([]);
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rhythm = new RhythmPress({
      onChange: (next) => {
        setSpans(next);
        if (next.length === 0) return;
        if (next.filter((span) => span.kind === 'press').length < 2) return;
        if (judgeRhythm(next) === 'ok') {
          lhSfx(SFX_SRC.horn);
          doneRef.current();
          rhythm.clear();
          return;
        }
        badRef.current();
        rhythm.clear();
      },
    });
    const off = rhythm.attach(el);
    const timer = window.setInterval(() => setLive(rhythm.holding(performance.now())), 100);
    return () => {
      window.clearInterval(timer);
      off();
    };
  }, []);

  return (
    <div>
      <div className="rhythm-bar" aria-hidden>
        <i className="press" style={{ width: '50px' }} />
        <i className="rest" style={{ width: '50px' }} />
        <i className="press" style={{ width: '50px' }} />
      </div>
      <div className="rhythm-bar" data-spans={spans.length}>
        {spans.map((span, index) => (
          <i key={`${span.kind}${index}`} className={span.kind} style={{ width: `${Math.max(4, Math.round(span.ms / 40))}px` }} />
        ))}
        {live != null && <i className="press live" style={{ width: `${Math.max(4, Math.round(live / 40))}px` }} />}
      </div>
      <p>━━ · ━━</p>
      <button ref={ref} type="button" className="lh-prop">
        <img src="/themes/haemu-lighthouse/props/horn.svg" alt="" />
        무적 손잡이
      </button>
    </div>
  );
}

function polar(deg: number, radius: number): { left: string; top: string } {
  const rad = (deg * Math.PI) / 180;
  return {
    left: `${50 + Math.sin(rad) * radius}%`,
    top: `${50 - Math.cos(rad) * radius}%`,
  };
}
