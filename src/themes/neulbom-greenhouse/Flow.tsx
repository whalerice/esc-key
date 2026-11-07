'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { unlockAudio } from '@/engine/audio/SoundManager';
import { useAppStore } from '@/engine/save/appStore';
import { DarknessMask } from '@/engine/fx/DarknessMask';
import { ScreenFilter } from '@/engine/fx/ScreenFilter';
import { longPressMs } from '@/engine/widgets/LongPress';
import { nearestSnap } from '@/engine/widgets/DragSnap';
import { DragSort } from '@/engine/widgets/DragSort';
import { Keypad } from '@/engine/widgets/Keypad';
import { SafeDial } from '@/engine/widgets/SafeDial';
import { SequenceTap } from '@/engine/widgets/SequenceTap';
import { BreathDetector, BREATH_NEED_MS } from '@/engine/sensors/BreathDetector';
import { StrokePad, type Stroke } from '@/engine/widgets/StrokePad';
import { thermometerC } from '@/engine/systems/Timer';
import type { ThemeTimerApi } from '@/engine/ui/ThemePlay';
import { JOURNAL, line } from './data/script';
import { playSeat } from './art';
import {
  BLOOM_NAME,
  P2_ORDER,
  BLOOM_OPEN_MS,
  BLOOM_STEP_MS,
  BREATH_HOLD_MS,
  CRAYON,
  DURATION_MS,
  HEATER_PAUSE_MS,
  MAT_SCALE,
  MONTH,
  P7_LABEL,
  P7_ORDER,
  PLANTS,
  VALVES,
  bloomStage,
  judgeDate,
  judgeFinale,
  judgeMat,
  judgeP1,
  judgeP8,
  judgeShelf,
  judgeSpecies,
  judgeStickers,
  judgeValves,
  judgeWrap,
  monthSlots,
  potSlots,
  stickerNote,
  type PlantId,
} from './puzzles/answers';
import { useGreenhouseStore } from './store';

const ROOM: Record<string, string> = {
  foyer: '전실',
  boiler: '보일러실',
  hall: '중앙홀',
  glass: '육묘실 앞',
  nursery: '육묘실',
};

export function GreenhouseFlow({
  say,
  clockRef,
  selectedItem,
  onUseRef,
  timerRef,
  notebookRef,
}: {
  say: (text: string) => void;
  clockRef: MutableRefObject<(ms: number) => void>;
  selectedItem: string | null;
  onUseRef: MutableRefObject<(itemId: string | null, targetId: string) => void>;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
  notebookRef: MutableRefObject<() => void>;
}) {
  const scene = useGreenhouseStore((s) => s.scene);
  const solved = useGreenhouseStore((s) => s.solved);
  const extra = useGreenhouseStore((s) => s.extra);
  const quiet = useAppStore((s) => s.settings.reduceEffects);
  const sayRef = useRef(say);
  sayRef.current = say;
  const origin = useRef<number | null>(null);
  const [notes, setNotes] = useState(false);
  const [temp, setTemp] = useState(14);
  const [hole, setHole] = useState({ x: 960, y: 540 });
  const [lightOff, setLightOff] = useState(false);
  const [lamp, setLamp] = useState(false);
  const [gapOpen, setGapOpen] = useState(false);
  const [gapPlugged, setGapPlugged] = useState(false);
  const [notches, setNotches] = useState(0);
  const [finaleOn, setFinaleOn] = useState(false);
  const mask = useRef(new DarknessMask());
  const frost = useRef(new ScreenFilter());
  const notebook = useGreenhouseStore((s) => s.notebook);

  useEffect(() => {
    notebookRef.current = () => setNotes((open) => !open);
  }, [notebookRef]);

  useEffect(() => {
    onUseRef.current = (itemId, targetId) => {
      if (targetId === 'gap') plugRef.current(itemId);
      if (targetId === 'door') leave(sayRef.current);
    };
  }, [onUseRef]);

  const plugRef = useRef<(itemId: string | null) => void>(() => undefined);
  plugRef.current = (itemId) => {
    if (!gapOpen || gapPlugged) {
      sayRef.current(line('p8.wind'));
      return;
    }
    if (itemId && itemId !== '신문') {
      sayRef.current('신문 뭉치다.');
      return;
    }
    if (!useGreenhouseStore.getState().items.includes('신문')) {
      sayRef.current('신문이 소지품에 없다.');
      return;
    }
    setGapPlugged(true);
    sayRef.current(line('p8.paper'));
  };

  useEffect(() => {
    if (!solved.P7 || solved.P8) return;
    if (judgeP8(gapPlugged, notches, lightOff) !== 'ok') return;
    once('p8done', () => {
      const s = useGreenhouseStore.getState();
      s.markSolved('P8');
      s.patchExtra({ bloomStage: 4 });
      playSeat('bloom');
      sayRef.current(line('p8.solved'));
    });
  }, [gapPlugged, lightOff, notches, solved.P7, solved.P8]);

  useEffect(() => {
    const tell = sayRef.current;
    if (scene === 'boiler' && !useGreenhouseStore.getState().flags.p2radio) {
      once('p2radio', () => tell(line('p2.radio')));
    }
    if (scene === 'nursery' && useGreenhouseStore.getState().solved.P4 && !useGreenhouseStore.getState().flags.p5cut) {
      once('p5cut', () => tell(line('p5.cut')));
    }
    if (scene === 'foyer' && useGreenhouseStore.getState().solved.P7 && !useGreenhouseStore.getState().solved.P8 && !useGreenhouseStore.getState().flags.p8look) {
      once('p8look', () => tell(line('p8.look')));
    }
  }, [scene]);

  useEffect(() => {
    clockRef.current = (elapsed) => {
      const s = useGreenhouseStore.getState();
      const rem = Math.max(0, DURATION_MS - (elapsed + s.timer.penaltyMs - s.timer.bonusPausedMs));
      const c = thermometerC(rem, DURATION_MS);
      setTemp((prev) => (prev === c ? prev : c));
      frost.current.set(c <= 7 ? 'frost' : 'none');
      if (c <= 7 && c > 3) once('frost7', () => sayRef.current(line('frost.7')));
      if (c > 0 && c <= 3) once('frost3', () => sayRef.current(line('frost.3')));
      if (s.solved.P1 && origin.current == null) origin.current = elapsed;
      const heater = s.flags.heaterPause ? HEATER_PAUSE_MS : 0;
      const game = origin.current == null ? 0 : Math.max(0, elapsed - origin.current - heater);
      const next = Math.max(s.extra.bloomStage, bloomStage(game, !!s.solved.P8));
      if (next !== s.extra.bloomStage) s.patchExtra({ bloomStage: next });
    };
    return () => {
      clockRef.current = () => undefined;
    };
  }, [clockRef]);

  useEffect(() => {
    if (!solved.P8) return;
    const id = window.setTimeout(() => setFinaleOn(true), BLOOM_OPEN_MS);
    return () => window.clearTimeout(id);
  }, [solved.P8]);

  const frostAlpha = quiet ? 0.2 : Math.min(0.75, (14 - temp) / 14);
  const recede = !!solved.P7 && !solved.P8;
  const dark = lightOff && scene === 'foyer' && !!solved.P7 && !solved.P8;
  mask.current.enabled = dark && lamp;
  mask.current.fingerX = hole.x;
  mask.current.fingerY = hole.y;
  mask.current.holeRatio = 0.15;

  return (
    <>
      <div
        className="greenhouse-frost"
        data-quiet={quiet ? 'yes' : 'no'}
        data-recede={recede ? 'yes' : 'no'}
        data-filter={frost.current.kind}
        style={{ ['--frost' as string]: String(recede ? frostAlpha * 0.35 : frostAlpha) }}
      />
      {dark && (
        <div
          className="greenhouse-dark"
          data-lamp={lamp && mask.current.enabled ? 'yes' : 'no'}
          style={{
            ['--lx' as string]: `${hole.x}px`,
            ['--ly' as string]: `${hole.y}px`,
          }}
        />
      )}
      <div
        className="greenhouse-flow"
        data-scene={scene}
        onPointerMove={(event) => setHole({ x: event.clientX, y: event.clientY })}
      >
        <p>
          {ROOM[scene] ?? scene}
          {solved.P1 ? ` · 봉오리 ${BLOOM_NAME[extra.bloomStage] ?? extra.bloomStage}` : ''}
          {` · ${temp.toFixed(1)}°C`}
        </p>
        <Nav />
        {scene === 'foyer' && (
          <Foyer
            say={say}
            selectedItem={selectedItem}
            lightOff={lightOff}
            lamp={lamp}
            gapOpen={gapOpen}
            gapPlugged={gapPlugged}
            notches={notches}
            finaleOn={finaleOn}
            onLight={() => {
              setLightOff(true);
              setLamp(false);
              say(line('p8.dark'));
            }}
            onLamp={() => setLamp((on) => !on)}
            onPlug={(itemId) => plugRef.current(itemId)}
            onGap={() => {
              setGapOpen(true);
              say(line('p8.gap'));
            }}
            onNotch={setNotches}
          />
        )}
        {scene === 'boiler' && <Boiler say={say} timerRef={timerRef} />}
        {scene === 'hall' && <Hall say={say} />}
        {scene === 'glass' && <Glass say={say} />}
        {scene === 'nursery' && <Nursery say={say} />}
        <p className="radio-row">
          <button type="button" onClick={() => setNotes((open) => !open)}>
            수첩
          </button>
          <button
            type="button"
            onClick={() =>
              useAppStore.getState().setSettings({ reduceEffects: !quiet })
            }
          >
            성에 {quiet ? '가장자리만' : '번짐'}
          </button>
        </p>
      </div>
      {notes && (
        <aside className="greenhouse-sheet">
          <h2>수첩 · 육묘 기록</h2>
          {solved.P3 && (
            <ul>
              {PLANTS.map((plant) => (
                <li key={plant.id}>
                  {plant.name} · {plant.clue}
                  {solved.P5 ? ` · ${MONTH[plant.id]}월` : ''}
                </li>
              ))}
            </ul>
          )}
          <ul>
            {notebook.length === 0 && <li>비어 있다.</li>}
            {notebook.map((note) => (
              <li key={note.id}>{note.text}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setNotes(false)}>
            닫기
          </button>
        </aside>
      )}
    </>
  );
}

function Nav() {
  const solved = useGreenhouseStore((s) => s.solved);
  const go = (id: string) => useGreenhouseStore.getState().setScene(id);
  return (
    <div className="radio-row">
      <button type="button" onClick={() => go('foyer')}>전실</button>
      {solved.P1 && (
        <button type="button" onClick={() => go('boiler')}>보일러실</button>
      )}
      {solved.P2 && (
        <button type="button" onClick={() => go('hall')}>중앙홀</button>
      )}
      {solved.P3 && (
        <button type="button" onClick={() => go('glass')}>육묘실 앞</button>
      )}
      {solved.P4 && (
        <button type="button" onClick={() => go('nursery')}>육묘실</button>
      )}
    </div>
  );
}

function Foyer({
  say,
  selectedItem,
  lightOff,
  lamp,
  gapOpen,
  gapPlugged,
  notches,
  finaleOn,
  onLight,
  onLamp,
  onPlug,
  onGap,
  onNotch,
}: {
  say: (text: string) => void;
  selectedItem: string | null;
  lightOff: boolean;
  lamp: boolean;
  gapOpen: boolean;
  gapPlugged: boolean;
  notches: number;
  finaleOn: boolean;
  onLight: () => void;
  onLamp: () => void;
  onPlug: (itemId: string | null) => void;
  onGap: () => void;
  onNotch: (n: number) => void;
}) {
  const solved = useGreenhouseStore((s) => s.solved);
  const [mat, setMat] = useState(false);
  const [pot, setPot] = useState(false);
  const blocked = lightOff && !lamp && !!solved.P7 && !solved.P8;
  const dial = useRef(new SafeDial(MAT_SCALE));

  if (!solved.P1) {
    return (
      <section className="gray-box">
        <h2>P1 하룻밤 꽃</h2>
        <p>{line('p1.pot')}</p>
        <div className="radio-row">
          <button type="button" onClick={() => { setMat(true); say(line('p1.cold')); }}>
            매트 펼치기
          </button>
          <button
            type="button"
            onClick={() => {
              const slots = [{ id: 'mat', x: 40, y: 40, r: 30 }];
              if (!mat || !nearestSnap(40, 40, slots)) {
                say(line('p1.pot'));
                return;
              }
              setPot(true);
            }}
          >
            화분을 매트에
          </button>
          <button type="button" onClick={() => plug('grey', mat, pot, say)}>
            회색 콘센트
          </button>
          <button type="button" onClick={() => plug('yellow', mat, pot, say)}>
            노란 콘센트
          </button>
        </div>
      </section>
    );
  }

  if (!solved.P7) {
    return (
      <section className="gray-box">
        <p>{solved.P2 ? '중앙홀 열쇠가 있다.' : line('p1.locked')}</p>
        <button type="button" onClick={() => say(`${BLOOM_NAME[useGreenhouseStore.getState().extra.bloomStage]} · ${BLOOM_STEP_MS / 60000}분마다`)}>
          봉오리 보기
        </button>
      </section>
    );
  }

  if (!solved.P8) {
    const matJudge = judgeMat(notches);
    return (
      <section className="gray-box">
        <h2>P8 꽃이 멈췄다</h2>
        <p>반개. 순서 없음. 바람, 매트 22도, 불.</p>
        <div className="radio-row">
          <BreathHold
            label="유리문 후—"
            disabled={blocked}
            onReveal={onGap}
            onFallback={() => say(line('p4.fail'))}
          />
          <LongHold label="유리문 길게" disabled={blocked} onReveal={onGap} />
          <button
            type="button"
            data-use-target="gap"
            disabled={!gapOpen || gapPlugged || blocked}
            onClick={() => onPlug(selectedItem)}
          >
            틈에 신문
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={() => {
              dial.current.set(notches + 1);
              onNotch(dial.current.position);
              if (judgeMat(dial.current.position) === 'hot') say(line('p8.hot'));
            }}
          >
            매트 다이얼 +1
          </button>
          <button type="button" disabled={blocked} onClick={onLight}>
            보온등 끄기
          </button>
          {lightOff && (
            <button type="button" className="greenhouse-lamp" onClick={onLamp}>
              휴대폰 불빛 {lamp ? '켬' : '끔'}
            </button>
          )}
        </div>
        <p>
          틈 {gapPlugged ? '막힘' : gapOpen ? '보임' : '안 보임'}
          {' · '}
          다이얼 +{notches} {matJudge === 'ok' ? '초록 22도' : matJudge === 'hot' ? '빨강' : '차다'}
          {' · '}
          불 {lightOff ? '꺼짐' : '켜짐'}
        </p>
        <p>테이프 보관 14 / 피는 밤 +8</p>
      </section>
    );
  }

  return (
    <section className="gray-box">
      <h2>피날레 네 차례</h2>
      {!finaleOn ? <p>만개. {BLOOM_OPEN_MS / 1000}초.</p> : <Finale say={say} />}
    </section>
  );
}

function plug(outlet: string, mat: boolean, pot: boolean, say: (text: string) => void) {
  const slots = [
    { id: 'grey', x: 10, y: 10, r: 20 },
    { id: 'yellow', x: 80, y: 10, r: 20 },
  ];
  const hit = nearestSnap(outlet === 'yellow' ? 80 : 10, 10, slots);
  const result = judgeP1(mat, pot, hit?.id ?? null);
  if (result === 'wait') {
    say(line('p1.pot'));
    return;
  }
  if (result === 'dead') {
    say(line('p1.dead'));
    return;
  }
  const s = useGreenhouseStore.getState();
  s.markSolved('P1');
  playSeat('heater-on');
  say(line('p1.solved'));
  say(line('p1.locked'));
}

function Boiler({
  say,
  timerRef,
}: {
  say: (text: string) => void;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
}) {
  const solved = useGreenhouseStore((s) => s.solved);
  const filled = useGreenhouseStore((s) => !!s.flags.waterFilled);
  const [openGauge, setOpenGauge] = useState(false);
  const [taps, setTaps] = useState<string[]>([]);

  return (
    <section className="gray-box">
      <h2>P2 비상 온풍기</h2>
      {!solved.P2 && (
        <>
          <p>{line('p2.note')}</p>
          <button type="button" onClick={() => { setOpenGauge(true); say(line('p2.floor')); }}>
            계기판 확대
          </button>
          <div className="radio-row">
            {VALVES.map((valve) => (
              <button
                key={valve.id}
                type="button"
                onClick={() => {
                  const next = [...taps, valve.id];
                  const result = judgeValves(next);
                  if (result === 'ok' && !new SequenceTap([...P2_ORDER]).check(next)) return;
                  if (result === 'back') {
                    setTaps([]);
                    playSeat('valve-fail');
                    say(line('p2.back'));
                    return;
                  }
                  setTaps(next);
                  if (result === 'ok') {
                    const s = useGreenhouseStore.getState();
                    s.markSolved('P2');
                    s.addItem('열쇠');
                    if (!s.flags.heaterPause) {
                      s.setFlag('heaterPause');
                      timerRef.current?.pause(HEATER_PAUSE_MS);
                    }
                    playSeat('heater-on');
                    say(line('p2.solved'));
                  }
                }}
              >
                {valve.label}
                {openGauge ? ` ${valve.pressure}` : ''}
              </button>
            ))}
          </div>
        </>
      )}
      {solved.P2 && <p>공구함이 열렸다. 열쇠꾸러미.</p>}
      {solved.P6 && !solved.P7 && (
        <button
          type="button"
          onClick={() => {
            useGreenhouseStore.getState().setFlag('waterFilled');
            say(line('p7.water'));
          }}
        >
          {filled ? '물주머니 채워짐' : '물주머니 채우기'}
        </button>
      )}
    </section>
  );
}

function Hall({ say }: { say: (text: string) => void }) {
  const solved = useGreenhouseStore((s) => s.solved);
  const [code, setCode] = useState('');
  const [flip, setFlip] = useState(false);
  return (
    <section className="gray-box">
      <h2>P3 난초 유리장</h2>
      <p>{line('p3.look')}</p>
      <div className="radio-row">
        <button type="button" onClick={() => say(line('p3.paper'))}>논문 확대</button>
        <button type="button" onClick={() => say(flip ? line('p3.stamp') : line('p3.family'))}>
          가족사진
        </button>
        <button type="button" onClick={() => setFlip((v) => !v)}>
          {flip ? '앞면' : '뒷면'}
        </button>
        <button type="button" onClick={() => say(line('p3.poster'))}>나눔 포스터</button>
      </div>
      {!solved.P3 && (
        <Keypad
          mode="alpha"
          value={code}
          onChange={(value) => setCode(value.replace(/[^A-Za-z]/g, '').slice(0, 7).toUpperCase())}
          onSubmit={() => {
            if (judgeSpecies(code) !== 'ok') {
              say(line('p3.no'));
              return;
            }
            const s = useGreenhouseStore.getState();
            s.markSolved('P3');
            s.addItem('노트');
            addNote('nursery-door', line('p3.note'));
            playSeat('lock');
            say(line('p3.solved'));
            say(line('p3.note'));
            say(line('p3.radio'));
          }}
        />
      )}
      {solved.P3 && <p>{line('p3.solved')}</p>}
    </section>
  );
}

function Glass({ say }: { say: (text: string) => void }) {
  const solved = useGreenhouseStore((s) => s.solved);
  const [marks, setMarks] = useState(false);
  const [code, setCode] = useState('');
  const fade = useRef(0);

  function reveal() {
    setMarks(true);
    addNote('breath-mark', line('p4.mark'));
    say(line('p4.mark'));
    window.clearTimeout(fade.current);
    fade.current = window.setTimeout(() => {
      setMarks(false);
      say(line('p4.fade'));
    }, 5000);
  }

  return (
    <section className="gray-box">
      <h2>P4 닦지 마시오</h2>
      <p>{line('p4.glass')}</p>
      {!solved.P4 && (
        <>
          <div className="radio-row">
            <BreathHold label="유리에 후—" onReveal={reveal} onFallback={() => say(line('p4.fail'))} />
            <LongHold label="유리 길게 누르기" onReveal={reveal} />
          </div>
          {marks && <p>하윤 · 112cm · 96.12.14</p>}
          <Keypad
            mode="numeric"
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 4))}
            onSubmit={() => {
              const result = judgeDate(code);
              if (result === 'year') return say(line('p4.year'));
              if (result === 'height') return say(line('p4.height'));
              if (result !== 'ok') return say(line('p4.no'));
              useGreenhouseStore.getState().markSolved('P4');
              playSeat('lock');
              say(line('p4.solved'));
            }}
          />
        </>
      )}
      {solved.P4 && <p>육묘실 문이 열려 있다.</p>}
    </section>
  );
}

function Nursery({ say }: { say: (text: string) => void }) {
  const solved = useGreenhouseStore((s) => s.solved);
  return (
    <>
      {!solved.P5 && <Stickers say={say} />}
      {solved.P5 && !solved.P6 && <Shelf say={say} />}
      {solved.P6 && (
        <section className="gray-box">
          <p>{line('p6.solved')}</p>
          <p>{CRAYON.join(' · ')} · 해바라기 올은 아빠 글씨</p>
          <p>{line('p6.recall')}</p>
        </section>
      )}
      {solved.P6 && !solved.P7 && <Wrap say={say} />}
      {solved.P7 && <p>상자를 안고 전실로.</p>}
    </>
  );
}

function Stickers({ say }: { say: (text: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [poured, setPoured] = useState<Record<string, boolean>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const slots = potSlots();
  return (
    <section className="gray-box">
      <h2>P5 어린잎 도감</h2>
      <div className="radio-row">
        {PLANTS.map((plant) => (
          <button key={plant.id} type="button" onClick={() => setPicked(plant.id)}>
            스티커 {plant.name}
          </button>
        ))}
      </div>
      <div className="radio-row">
        {PLANTS.map((plant) => (
          <button
            key={plant.id}
            type="button"
            onClick={() => {
              if (plant.seed && !poured[plant.id]) {
                setPoured((prev) => ({ ...prev, [plant.id]: true }));
                say(`${plant.name}. ${plant.clue}`);
                return;
              }
              if (!picked) return;
              const slot = slots.find((item) => item.id === plant.id);
              if (!slot || !nearestSnap(slot.x, slot.y, slots)) return;
              if (picked !== plant.id) {
                const note = stickerNote(plant.id, picked);
                if (note) {
                  addNote(`p5-${plant.id}`, note);
                  say(note);
                }
                return;
              }
              const next = { ...placed, [plant.id]: picked };
              setPlaced(next);
              if (judgeStickers(next) === 'ok') {
                const s = useGreenhouseStore.getState();
                s.markSolved('P5');
                s.addItem('안경');
                say(line('p5.solved'));
              }
            }}
          >
            {plant.name} · {plant.pot}
            {placed[plant.id] ? ` ← ${PLANTS.find((item) => item.id === placed[plant.id])?.name}` : ''}
          </button>
        ))}
      </div>
    </section>
  );
}

function Shelf({ say }: { say: (text: string) => void }) {
  const [pot, setPot] = useState<PlantId | null>(null);
  const [slots, setSlots] = useState<Record<number, string>>({});
  const targets = monthSlots();
  return (
    <section className="gray-box">
      <h2>P6 개화 달력</h2>
      <p>{line('p6.look')}</p>
      <div className="radio-row">
        {PLANTS.map((plant) => (
          <button key={plant.id} type="button" onClick={() => setPot(plant.id)}>
            {plant.name}
          </button>
        ))}
      </div>
      <div className="radio-row">
        {targets.map((slot) => {
          const month = Number(slot.id);
          const who = slots[month];
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                if (!pot) return;
                if (!nearestSnap(slot.x, slot.y, targets)) return;
                if (MONTH[pot] !== month) {
                  say(line('p6.miss'));
                  return;
                }
                const next = { ...slots, [month]: pot };
                setSlots(next);
                if (judgeShelf(next) === 'ok') {
                  const s = useGreenhouseStore.getState();
                  s.markSolved('P6');
                  s.addItem('신문');
                  playSeat('crayons');
                  say(line('p6.solved'));
                  say(line('p6.recall'));
                  say(line('p6.ol'));
                }
              }}
            >
              {month}월{who ? ` ${PLANTS.find((plant) => plant.id === who)?.name}` : ''}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Wrap({ say }: { say: (text: string) => void }) {
  const [order, setOrder] = useState<string[]>(['paper', 'coat', 'sides', 'water']);
  const [bright, setBright] = useState(false);
  const filled = useGreenhouseStore((s) => !!s.flags.waterFilled);
  return (
    <section className="gray-box">
      <h2>P7 2011년의 방법</h2>
      <pre className={bright ? 'greenhouse-log bright' : 'greenhouse-log'}>{JOURNAL}</pre>
      <button
        type="button"
        onClick={() => {
          addNote('night-three', line('p7.memo'));
          say(line('p7.memo'));
          say(line('p7.radio'));
        }}
      >
        마지막 장 메모
      </button>
      <ol>
        {order.map((id, index) => (
          <li key={id}>
            {P7_LABEL[id as (typeof P7_ORDER)[number]] ?? id}
            <button type="button" onClick={() => setOrder(move(order, index, -1))}>위</button>
            <button type="button" onClick={() => setOrder(move(order, index, 1))}>아래</button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => {
          const result = judgeWrap(order, filled);
          if (result === 'dry') return say(line('p7.dry'));
          if (result !== 'ok') {
            setBright(true);
            return say(line('p7.miss'));
          }
          const s = useGreenhouseStore.getState();
          s.markSolved('P7');
          s.addItem('상자');
          say(line('p7.coat'));
          say(line('p7.solved'));
        }}
      >
        이 순서로 싼다
      </button>
      {!filled && <p>물주머니는 아직 비어 있다.</p>}
    </section>
  );
}

function Finale({ say }: { say: (text: string) => void }) {
  const padRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [text, setText] = useState('');
  const [keys, setKeys] = useState(false);
  const [ready, setReady] = useState(false);
  const saved = useGreenhouseStore((s) => s.extra.nameTag);

  useEffect(() => {
    const el = padRef.current;
    if (!el) return;
    const pad = new StrokePad((next) => setStrokes(next.map((stroke) => stroke.map((point) => ({ ...point })))));
    return pad.attach(el);
  }, []);

  function commit() {
    const result = judgeFinale(text, strokes.length);
    if (result === 'empty') return say(line('end.empty'));
    if (result === 'long') return say(line('end.long'));
    useGreenhouseStore.getState().patchExtra({
      nameTag: text.trim(),
      finaleStrokes: strokes.map((stroke) => stroke.map((point) => ({ ...point }))),
    });
    setReady(true);
    say(line('end.wrote'));
  }

  return (
    <>
      <p>{line('end.tag')}</p>
      <p>{CRAYON.join(' · ')}</p>
      <div ref={padRef} className="greenhouse-pad" data-strokes={strokes.length} />
      <div className="radio-row">
        <button type="button" onClick={() => setKeys((on) => !on)}>글자로 쓰기</button>
        <button type="button" onClick={commit}>이름표 남기기</button>
        <button type="button" data-use-target="door" onClick={() => leave(say)} disabled={!ready && !saved}>
          출입문
        </button>
      </div>
      {keys && (
        <Keypad
          mode="hangul"
          value={text}
          onChange={(value) => {
            if ([...value].length > 8) return;
            setText(value);
          }}
        />
      )}
      <p>{saved ? `이름표 ${saved}` : '빈 이름표'}</p>
    </>
  );
}

function BreathHold({
  label,
  disabled,
  onReveal,
  onFallback,
}: {
  label: string;
  disabled?: boolean;
  onReveal: () => void;
  onFallback: () => void;
}) {
  const det = useRef(new BreathDetector());
  const down = useRef(false);
  const done = useRef(false);
  const [loud, setLoud] = useState(0);

  const revealRef = useRef(onReveal);
  const fallRef = useRef(onFallback);
  revealRef.current = onReveal;
  fallRef.current = onFallback;

  useEffect(() => {
    const detector = det.current;
    const finish = (ok: boolean) => {
      if (done.current) return;
      if (!ok) {
        const fell = detector.release(false);
        detector.loudMs = 0;
        if (fell) {
          useGreenhouseStore.getState().patchExtra({ breathFallback: true });
          fallRef.current();
        }
        return;
      }
      done.current = true;
      detector.release(true);
      revealRef.current();
    };
    detector.start();
    void detector.armMic((ms) => {
      setLoud(ms);
      if (ms >= BREATH_NEED_MS) finish(true);
    });
    const id = window.setInterval(() => {
      if (!down.current) return;
      detector.hold = true;
      const ms = detector.push(performance.now(), 1);
      setLoud(ms);
      if (ms >= BREATH_NEED_MS) finish(true);
    }, 100);
    return () => {
      window.clearInterval(id);
      detector.disarmMic();
      detector.stop();
      unlockAudio();
    };
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={() => {
        down.current = true;
        det.current.hold = true;
      }}
      onPointerUp={() => {
        const was = down.current;
        down.current = false;
        det.current.hold = false;
        if (!was || done.current) return;
        if (det.current.loudMs >= BREATH_NEED_MS) return;
        const fell = det.current.release(false);
        det.current.loudMs = 0;
        setLoud(0);
        if (fell) {
          useGreenhouseStore.getState().patchExtra({ breathFallback: true });
          onFallback();
        }
      }}
    >
      {label} {Math.round(loud)}ms
    </button>
  );
}

function LongHold({
  label,
  disabled,
  onReveal,
}: {
  label: string;
  disabled?: boolean;
  onReveal: () => void;
}) {
  const started = useRef(0);
  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={() => {
        started.current = performance.now();
      }}
      onPointerUp={() => {
        if (performance.now() - started.current >= longPressMs(BREATH_HOLD_MS)) onReveal();
      }}
    >
      {label}
    </button>
  );
}

function leave(say: (text: string) => void) {
  const s = useGreenhouseStore.getState();
  if (!s.extra.nameTag && !(s.extra.finaleStrokes && s.extra.finaleStrokes.length > 0)) {
    say(line('end.empty'));
    return;
  }
  if (!s.items.includes('상자')) {
    say('상자가 없다.');
    return;
  }
  if (s.flags.finale) return;
  s.setFlag('finale');
  playSeat('bloom');
  say(line('end.door'));
}

function move(order: string[], index: number, dir: number): string[] {
  const to = index + dir;
  if (to < 0 || to >= order.length) return order;
  const sort = new DragSort(order);
  sort.move(index, to);
  return [...sort.order];
}

function once(flag: string, run: () => void) {
  const s = useGreenhouseStore.getState();
  if (s.flags[flag]) return;
  s.setFlag(flag);
  run();
}

function addNote(id: string, text: string) {
  const s = useGreenhouseStore.getState();
  if (s.notebook.some((note) => note.id === id)) return;
  useGreenhouseStore.setState({ notebook: [...s.notebook, { id, text }] });
}
