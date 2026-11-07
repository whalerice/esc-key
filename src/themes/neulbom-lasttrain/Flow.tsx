'use client';

import { useEffect, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useAppStore } from '@/engine/save/appStore';
import { batteryPercent } from '@/engine/systems/Timer';
import { rectContains, Viewfinder, type ViewRect } from '@/engine/fx/Viewfinder';
import { nearestSnap } from '@/engine/widgets/DragSnap';
import { allFound, markFound } from '@/engine/widgets/FindTap';
import { Keypad, type CheonjiinScript } from '@/engine/widgets/Keypad';
import type { ThemeTimerApi } from '@/engine/ui/ThemePlay';
import styles from './art.module.css';
import { boxArt, roomArt } from './art';
import { playClue, playSeat, stopBeds, syncBed } from './audio';
import { line } from './data/script';
import {
  ALARM,
  BOX_PENALTY_MS,
  CALLS,
  CHARGERS,
  DURATION_MS,
  FINDER_PAD,
  LEDGER,
  MESSAGES,
  PHOTOS,
  PORT,
  RECEIPT,
  REPLY_PENALTY_MS,
  SISTER_2026,
  SPOTS,
  STICKER_ZOOM_MAX,
  TIMETABLE,
  boxFrame,
  judgeBox,
  judgeCharger,
  judgeDraft,
  judgeFolder,
  judgeLedger,
  judgePin,
  judgeReply,
  judgeStation,
  tapeLabel,
  warehouseBoxes,
  type SpotId,
} from './puzzles/answers';
import { useLasttrainStore } from './store';

const COUNTER_SPOTS: { id: SpotId; label: string }[] = [
  { id: 'ledger', label: '책상' },
  { id: 'timetable', label: '벽 시각표' },
  { id: 'glass', label: '창구 유리' },
];

export function LasttrainFlow({
  say,
  clockRef,
  timerRef,
  notebookRef,
}: {
  say: (text: string) => void;
  clockRef: MutableRefObject<(ms: number) => void>;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
  notebookRef: MutableRefObject<() => void>;
}) {
  const solved = useLasttrainStore((s) => s.solved);
  const flags = useLasttrainStore((s) => s.flags);
  const quiet = useAppStore((s) => s.settings.reduceEffects);
  const sayRef = useRef(say);
  sayRef.current = say;
  const [batt, setBatt] = useState(100);
  const [notes, setNotes] = useState(false);
  const [room, setRoom] = useState<'counter' | 'warehouse'>('counter');
  const [phone, setPhone] = useState(false);

  const screen = screenOf(solved, flags);
  const revealed = !!flags.revealed;

  useEffect(() => {
    syncBed({
      fluorescent: screen !== 'end',
      rail: screen !== 'end',
      hush: revealed,
    });
    return () => stopBeds();
  }, [screen, revealed]);

  useEffect(() => {
    playSeat('announce');
  }, []);

  useEffect(() => {
    notebookRef.current = () => setNotes((open) => !open);
  }, [notebookRef]);

  useEffect(() => {
    clockRef.current = (elapsed) => {
      const s = useLasttrainStore.getState();
      const rem = Math.max(0, DURATION_MS - (elapsed + s.timer.penaltyMs - s.timer.bonusPausedMs));
      const next = batteryPercent(rem, DURATION_MS);
      setBatt((prev) => (prev === next ? prev : next));
    };
    return () => {
      clockRef.current = () => undefined;
    };
  }, [clockRef]);

  useEffect(() => {
    const next = room === 'warehouse' ? 'warehouse' : 'counter';
    if (useLasttrainStore.getState().scene !== next) useLasttrainStore.getState().setScene(next);
  }, [room]);

  useEffect(() => {
    if (screen === 'p5') setRoom('warehouse');
    if (screen === 'p1' || screen === 'p4' || screen === 'p6') setRoom('counter');
  }, [screen]);

  const low = batt > 0 && batt <= 10;
  const blink = low && batt <= 5 && !quiet;

  return (
    <div className={`lasttrain-flow ${styles.flow}${low ? ' dim' : ''}`} data-screen={screen} data-battery={batt}>
      {low && <div className={`lasttrain-dim${blink ? ' blink' : ''}`} data-dim={blink ? 'blink' : 'steady'} />}
      <img className={styles.scene} src={roomArt(room, screen === 'end')} alt="" />
      <div className="radio-row">
        <button type="button" onClick={() => setRoom('counter')}><Mark name="counter" />카운터</button>
        <button type="button" onClick={() => setRoom('warehouse')} disabled={!solved.P4}><Mark name="warehouse" />창고</button>
        {solved.P1 && (
          <button type="button" onClick={() => setPhone((open) => !open)}><Mark name="phone" />폰</button>
        )}
        <button type="button" onClick={() => setNotes((open) => !open)}><Mark name="note" />수첩</button>
        <span><Mark name="sleeve" />남색 코트 소매</span>
      </div>

      {screen === 'p1' && <P1 say={say} />}
      {screen === 'p2' && <P2 say={say} />}
      {screen === 'p3' && <P3 say={say} />}
      {screen === 'p4' && <P4 say={say} />}
      {screen === 'p5' && room === 'warehouse' && <P5 say={say} timerRef={timerRef} />}
      {screen === 'p5' && room === 'counter' && <p>창고로. 상자 24.</p>}
      {screen === 'p6' && <P6 say={say} />}
      {screen === 'p7' && <P7 say={say} />}
      {screen === 'p8' && <P8 say={say} timerRef={timerRef} />}
      {screen === 'end' && <EndingA say={say} />}

      {phone && solved.P2 && screen !== 'p2' && screen !== 'p3' && (
        <PhoneBook year={solved.P7 ? '2026.12.24 23:52' : '2009.12.24 23:41'} showSister={!!solved.P7} say={say} />
      )}
      {notes && <Notebook onClose={() => setNotes(false)} say={say} />}
    </div>
  );
}

function screenOf(
  solved: Record<string, boolean | undefined>,
  flags: Record<string, boolean | undefined>,
): string {
  if (!solved.P1) return 'p1';
  if (!solved.P2) return 'p2';
  if (!solved.P3 || !flags.called) return 'p3';
  if (!solved.P4) return 'p4';
  if (!solved.P5) return 'p5';
  if (!flags.revealed) return 'p6';
  if (!solved.P7) return 'p7';
  if (!solved.P8) return 'p8';
  return 'end';
}

function P1({ say }: { say: (text: string) => void }) {
  const [held, setHeld] = useState<string | null>(null);
  const padRef = useRef<HTMLDivElement>(null);

  function drop(id: string, x: number, y: number) {
    const hit = nearestSnap(x, y, [PORT]);
    if (!hit) return;
    if (!judgeCharger(id)) {
      say(line('p1.wrong'));
      return;
    }
    const s = useLasttrainStore.getState();
    s.markSolved('P1');
    s.addItem('천지인 카드');
    addNote('cheonjiin', line('p1.card'));
    playSeat('boot');
    say(line('p1.solved'));
    say(line('p1.drain'));
  }

  function local(e: ReactPointerEvent) {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  return (
    <section className={styles.panel} data-puzzle="P1">
      <h2>P1 맞는 충전기</h2>
      <div className="radio-row">
        <button type="button" onClick={() => say(line('p1.log'))}><Mark name="log" />근무일지</button>
        <button type="button" onClick={() => say(line('p1.wall'))}><Mark name="wall" />퇴역 안내</button>
        <button type="button" onClick={() => say(line('p1.l4'))}><Mark name="l4" />온실 안내</button>
        <button type="button" onClick={() => say(line('p1.bin'))}><Mark name="bin" />반납함</button>
      </div>
      <p>{line('p1.dead')}</p>
      <div
        ref={padRef}
        className="lasttrain-pad"
        data-live="charger"
        onPointerUp={(e) => {
          if (!held) return;
          const p = local(e);
          drop(held, p.x, p.y);
          setHeld(null);
        }}
      >
        <button
          type="button"
          className="lasttrain-port"
          style={{ left: PORT.x - 40, top: PORT.y - 22 }}
          onClick={() => held && drop(held, PORT.x, PORT.y)}
        >
          단자
        </button>
        {CHARGERS.map((charger) => (
          <button
            key={charger.id}
            type="button"
            className="lasttrain-charger"
            data-charger={charger.id}
            style={{ left: charger.x, top: charger.y }}
            onPointerDown={() => setHeld(charger.id)}
            onClick={() => setHeld(charger.id)}
          >
            {charger.name}
            {held === charger.id ? ' ·듦' : ''}
          </button>
        ))}
      </div>
      <p>충전기 고른 뒤 단자에 놓는다. 손 소매는 남색.</p>
    </section>
  );
}

function P2({ say }: { say: (text: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pin, setPin] = useState('');

  return (
    <section className={styles.panel} data-puzzle="P2">
      <h2>P2 스티커 사진</h2>
      <p>비밀번호 4자리. {line('p2.lock')}</p>
      <div className="lasttrain-phone">
        <div>
          <img
            className={styles.sticker}
            src="/themes/neulbom-lasttrain/props/sticker.svg"
            alt=""
            data-clear={zoom >= 2 ? 'yes' : 'no'}
            style={{ width: `${120 + zoom * 36}px` }}
          />
          <p>뒷면 스티커 {zoom < 2 ? '흐림' : line('p2.zoom')}</p>
          <div className="radio-row">
            <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 1))}>축소</button>
            <button type="button" onClick={() => setZoom((z) => Math.min(STICKER_ZOOM_MAX, +(z + 0.5).toFixed(1)))}>
              확대
            </button>
            <span>×{zoom.toFixed(1)}</span>
          </div>
          {zoom >= 2 && (
            <p>1 누나 하나 · 2 둘 다 하나 · 2 누나 브이 · 5 누나 손바닥. 남자애 손은 주먹.</p>
          )}
        </div>
        <Keypad
          mode="numeric"
          value={pin}
          onChange={setPin}
          onSubmit={() => {
            if (!judgePin(pin)) {
              say(line('p2.wrong'));
              setPin('');
              return;
            }
            useLasttrainStore.getState().markSolved('P2');
            addNote('read', '문자 읽음 23:22 / 안 읽음 23:31·23:40');
            playSeat('sms');
            say(line('p2.solved'));
            say(line('p2.inbox'));
          }}
        />
      </div>
    </section>
  );
}

function P3({ say }: { say: (text: string) => void }) {
  const [draft, setDraft] = useState('');
  const solved = useLasttrainStore((s) => !!s.solved.P3);
  const called = useLasttrainStore((s) => !!s.flags.called);

  return (
    <section className={styles.panel} data-puzzle="P3">
      <h2>P3 숫자 모드 문자</h2>
      <PhoneBook
        year="2009.12.24 23:41"
        showSister={false}
        say={say}
        lead={
          <>
            <p>임시보관함 23:29 {DRAFT}</p>
            <p>{line('p3.draft')}</p>
          </>
        }
        pad={
          !solved ? (
            <Keypad
              mode="cheonjiin"
              script="hangul"
              value={draft}
              onChange={setDraft}
              onSubmit={() => {
                if (!judgeDraft(draft)) {
                  say(line('p3.wrong'));
                  return;
                }
                useLasttrainStore.getState().markSolved('P3');
                addNote('draft', '임시보관함: 선물 눈사람');
                say(line('p3.solved'));
              }}
            />
          ) : null
        }
      />
      {solved && !called && (
        <button
          type="button"
          onClick={() => {
            useLasttrainStore.getState().setFlag('called');
            playSeat('hangup');
            playClue('out');
            say(line('p3.call'));
            say(line('p3.mine'));
          }}
        >
          통화
        </button>
      )}
      {called && <p>{line('p3.call')}</p>}
    </section>
  );
}

const DRAFT = '8215003255 5325812551200';

function P4({ say }: { say: (text: string) => void }) {
  const [photo, setPhoto] = useState<'ledger' | 'time' | 'glass' | null>(null);
  const flags = useLasttrainStore((s) => s.flags);

  return (
    <section className={styles.panel} data-puzzle="P4">
      <h2>P4 2009년의 장부</h2>
      <p>{line('p4.odd')}</p>
      <FinderPad
        spots={COUNTER_SPOTS.map((spot) => ({ ...SPOTS[spot.id], label: spot.label }))}
        caption={(ids) => (ids.includes('ledger') ? '2009 책상' : ids.includes('timetable') ? '2009 시각표' : ids.includes('glass') ? '2009 유리' : '2009')}
        onShutter={(ids) => {
          playSeat('shutter');
          if (ids.includes('ledger')) {
            setPhoto('ledger');
            useLasttrainStore.getState().setFlag('ledgerShot');
            return;
          }
          if (ids.includes('timetable')) {
            setPhoto('time');
            useLasttrainStore.getState().setFlag('timetableShot');
            addNote('time', '2009 막차 시각표');
            if (!flags.timetableSaid) {
              useLasttrainStore.getState().setFlag('timetableSaid');
              say(line('p4.time'));
            }
            return;
          }
          if (ids.includes('glass')) {
            setPhoto('glass');
            useLasttrainStore.getState().setFlag('glassShot');
            say(line('p4.glass'));
            return;
          }
          say('거긴 아니다.');
        }}
      />
      {photo === 'ledger' && (
        <div data-live="ledger">
          <img className={styles.clue} src="/themes/neulbom-lasttrain/props/ledger.svg" alt="" />
          <p>습득물 대장 2009.12.24 막차. 담당 곽.</p>
          {LEDGER.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                if (!judgeLedger(row.id)) {
                  say(line(row.id === 'hat' ? 'p4.hat' : row.id === 'film' ? 'p4.film' : row.id === 'phone' ? 'p4.phone' : 'p4.other'));
                  return;
                }
                useLasttrainStore.getState().markSolved('P4');
                addNote('box24', '2009 막차 7칸 쇼핑백 → 상자 24');
                say(line('p4.bag'));
              }}
            >
              {row.text}
            </button>
          ))}
        </div>
      )}
      {photo === 'time' && (
        <>
          <img className={styles.clue} src="/themes/neulbom-lasttrain/props/timetable.svg" alt="" />
          <p>{TIMETABLE}</p>
        </>
      )}
      {photo === 'glass' && <img className={styles.clue} src="/themes/neulbom-lasttrain/props/glass.svg" alt="" />}
    </section>
  );
}

function P5({
  say,
  timerRef,
}: {
  say: (text: string) => void;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
}) {
  const [saw, setSaw] = useState(false);
  const boxes = warehouseBoxes();

  return (
    <section className={styles.panel} data-puzzle="P5">
      <h2>P5 옮겨진 상자</h2>
      <p>{line('p5.look')}</p>
      <FinderPad
        year="warehouse"
        spots={[{ ...SPOTS.shelf, label: '셋째 줄 둘째' }]}
        caption={(ids) => (ids.includes('shelf') ? '2009 · 24 · 파란 X · 찌그러짐' : '2009 창고')}
        onShutter={(ids) => {
          playSeat('shutter');
          if (!ids.includes('shelf')) {
            say('그 칸이 아니다.');
            return;
          }
          setSaw(true);
          addNote('boxlook', '2009 상자 24: 파란 테이프 X자, 오른쪽 위 찌그러짐');
          say(line('p5.old'));
          say(line('p5.moved'));
        }}
      />
      <div className="lasttrain-pad" data-live="shelf" style={{ height: FINDER_PAD.h }}>
        {boxes.map((box) => {
          const frame = boxFrame(box.row, box.col);
          return (
            <button
              key={box.id}
              type="button"
              className="lasttrain-box"
              data-box={box.id}
              style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h, backgroundImage: `url(${boxArt(box)})` }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                const marked = markFound([{ id: box.id, found: false }], box.id);
                if (!allFound(marked)) return;
                const result = judgeBox(box.id);
                if (result === 'ok') {
                  if (!saw) {
                    say('뷰파인더로 2009년 자리를 먼저.');
                    return;
                  }
                  useLasttrainStore.getState().markSolved('P5');
                  say(line('p5.solved'));
                  return;
                }
                timerRef.current?.penalty(BOX_PENALTY_MS);
                say(line(result === 'plus' ? 'p5.plus' : result === 'line' ? 'p5.line' : result === 'dent' ? 'p5.dent' : 'p5.other'));
              }}
            >
              {tapeLabel(box)}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function P6({ say }: { say: (text: string) => void }) {
  const solved = useLasttrainStore((s) => !!s.solved.P6);
  const joined = useLasttrainStore((s) => !!s.flags.receipt);
  const [held, setHeld] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  function join(id: string) {
    if (!held || held === id) {
      setHeld(id);
      return;
    }
    const target = RECEIPT.find((half) => half.id === id);
    if (!target || !nearestSnap(target.x, target.y, [...RECEIPT])) return;
    useLasttrainStore.getState().setFlag('receipt');
    addNote('receipt', '영수증 22:47');
    say(line('p6.slip'));
    setHeld(null);
  }

  return (
    <section className={styles.panel} data-puzzle="P6">
      <h2>P6 쇼핑백과 비밀 폴더</h2>
      <img className={styles.clue} src="/themes/neulbom-lasttrain/props/bag.svg" alt="" />
      <p>{line('p6.tag')}</p>
      <p><Mark name="card" />{line('p6.card')}</p>
      <button type="button" onClick={() => say(line('p6.glove'))}><Mark name="glove" />털장갑</button>
      {!joined && (
        <div className="radio-row" data-live="receipt">
          {RECEIPT.map((half) => (
            <button key={half.id} type="button" onClick={() => join(half.id)}>
              <Mark name={`receipt-${half.id}`} />
              영수증 {half.id === 'left' ? '왼쪽' : '오른쪽'}
              {held === half.id ? ' ·듦' : ''}
            </button>
          ))}
        </div>
      )}
      {joined && !solved && (
        <>
          <p>비밀 폴더 비밀번호</p>
          <Keypad
            mode="numeric"
            value={code}
            onChange={setCode}
            onSubmit={() => {
              if (!judgeFolder(code)) {
                say(line('p6.wrong'));
                setCode('');
                return;
              }
              const s = useLasttrainStore.getState();
              s.markSolved('P6');
              s.patchExtra({ secretFolderOpen: true });
            }}
          />
        </>
      )}
      {solved && (
        <div data-live="photos">
          {PHOTOS.map((item) => (
            <button key={item.id} type="button" onClick={() => setPhoto(item.id)}>
              <Mark name={`photo-${item.id}`} />
              사진 {item.id}
            </button>
          ))}
          {photo && <img className={styles.clue} src={`/themes/neulbom-lasttrain/props/photo-${photo}.svg`} alt="" />}
          {photo && <p>{PHOTOS.find((item) => item.id === photo)?.text}</p>}
          {photo === 'p4' && (
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                say(line('p6.quiet'));
                playSeat('station');
                playClue('kwak');
                say(line('p6.kwak'));
                say(line('p6.me'));
                say(line('p6.ask'));
                say(line('p6.blank'));
                useLasttrainStore.getState().setFlag('revealed');
              }}
            >
              셀카 닫기
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function P7({ say }: { say: (text: string) => void }) {
  const [name, setName] = useState('');
  const [finder, setFinder] = useState(false);
  const shot = useLasttrainStore((s) => !!s.flags.timetableShot);

  function submit() {
    const result = judgeStation(name);
    if (result === 'ok') {
      if (!shot) {
        say('시각표가 없다. 뷰파인더로 벽을.');
        return;
      }
      useLasttrainStore.getState().markSolved('P7');
      playSeat('sms');
      say(line('p7.solved'));
      say(line('p7.knew'));
      return;
    }
    say(line(result === 'saemal' ? 'p7.saemal' : result === 'dorae' ? 'p7.dorae' : result === 'asleep' ? 'p7.asleep' : 'p7.none'));
    setName('');
  }

  return (
    <section className={styles.panel} data-puzzle="P7">
      <h2>P7 어디서 내렸나</h2>
      <p>{line('p7.ask')}</p>
      <p><Mark name="alarm" />{line('p7.alarm')} {ALARM}</p>
      <p>{line('p7.read')}</p>
      <p>{line('p7.missed')}</p>
      {shot && (
        <>
          <img className={styles.clue} src="/themes/neulbom-lasttrain/props/timetable.svg" alt="" />
          <p>{TIMETABLE}</p>
        </>
      )}
      {!shot && (
        <button type="button" onClick={() => setFinder(true)}>카운터 벽 비추기</button>
      )}
      {finder && !shot && (
        <FinderPad
          spots={COUNTER_SPOTS.map((spot) => ({ ...SPOTS[spot.id], label: spot.label }))}
          caption={(ids) => (ids.includes('timetable') ? '2009 시각표' : '2009')}
          onShutter={(ids) => {
            if (!ids.includes('timetable')) return;
            useLasttrainStore.getState().setFlag('timetableShot');
            addNote('time', '2009 막차 시각표');
            say(line('p4.time'));
            setFinder(false);
          }}
        />
      )}
      <p>역명</p>
      <Keypad mode="hangul" value={name} onChange={setName} onSubmit={submit} />
    </section>
  );
}

function P8({
  say,
  timerRef,
}: {
  say: (text: string) => void;
  timerRef: MutableRefObject<ThemeTimerApi | null>;
}) {
  const [script, setScript] = useState<CheonjiinScript>('digit');
  const [text, setText] = useState('');
  const sent = useLasttrainStore((s) => s.extra.sentAnswers);

  function send() {
    const result = judgeReply(script, text);
    const s = useLasttrainStore.getState();
    s.patchExtra({ sentAnswers: [...s.extra.sentAnswers, `${script}:${text}`] });
    if (result === 'ok') {
      s.markSolved('P8');
      playSeat('poweroff');
      say(line('p8.sent'));
      return;
    }
    timerRef.current?.penalty(REPLY_PENALTY_MS);
    say(line(result === 'ourWay' ? 'p8.ourWay' : result === 'eungok' ? 'p8.eungok' : 'p8.wrong'));
    setText('');
  }

  return (
    <section className={styles.panel} data-puzzle="P8">
      <h2>P8 우리 방식의 대답</h2>
      <div className="lasttrain-phone">
        <div>
          <p><Mark name="phone" />시계 2026.12.24 23:52</p>
          <p>{SISTER_2026}</p>
          <p>{line('p8.ask')}</p>
          {sent.length > 0 && <p>보낸 답 {sent.length}</p>}
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setScript((mode) => (mode === 'digit' ? 'hangul' : 'digit'));
              setText('');
            }}
          >
            {script === 'digit' ? '한글 모드로' : '숫자 모드로'}
          </button>
          <Keypad mode="cheonjiin" script={script} value={text} onChange={setText} onSubmit={send} submitLabel="전송" />
        </div>
      </div>
    </section>
  );
}

function EndingA({ say }: { say: (text: string) => void }) {
  const [step, setStep] = useState(0);
  const beats = [line('end.a1'), line('end.a2'), line('end.a3'), line('end.a4'), line('end.a5'), line('end.a6')];
  useEffect(() => {
    playClue('ending');
  }, []);
  return (
    <section className={styles.panel} data-puzzle="ending">
      <h2><Mark name="snow" />받았어</h2>
      {beats.slice(0, step + 1).map((text) => (
        <p key={text}>{text}</p>
      ))}
      {step < beats.length - 1 ? (
        <button type="button" onClick={() => setStep((n) => n + 1)}>다음</button>
      ) : (
        <button
          type="button"
          onClick={() => {
            say(line('end.a6'));
            useLasttrainStore.getState().setFlag('endingA');
          }}
        >
          끝났다고 적기
        </button>
      )}
    </section>
  );
}

function PhoneBook({
  year,
  showSister,
  say,
  lead,
  pad,
}: {
  year: string;
  showSister: boolean;
  say: (text: string) => void;
  lead?: ReactNode;
  pad?: ReactNode;
}) {
  const [app, setApp] = useState<'inbox' | 'calls' | 'alarm' | null>('inbox');
  return (
    <div className="lasttrain-phone" data-live="phone">
      <div>
        <p><Mark name="phone" />폴더폰 {year} ⏰</p>
        {lead}
        {app === 'inbox' && (
          <>
            {MESSAGES.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => {
                  const s = useLasttrainStore.getState();
                  if (!s.extra.readMessages.includes(msg.id)) {
                    s.patchExtra({ readMessages: [...s.extra.readMessages, msg.id] });
                  }
                  say(`${msg.time} ${msg.read ? '읽음' : '안 읽음'} ${msg.text}`);
                }}
              >
                {msg.time} {msg.read ? '읽음' : '안 읽음'}
              </button>
            ))}
            {showSister && (
              <button
                type="button"
                onClick={() => {
                  const s = useLasttrainStore.getState();
                  if (!s.extra.readMessages.includes('m2026')) {
                    s.patchExtra({ readMessages: [...s.extra.readMessages, 'm2026'] });
                  }
                  say(SISTER_2026);
                }}
              >
                2026 누나
              </button>
            )}
          </>
        )}
        {app === 'calls' && CALLS.map((call) => <p key={call.time}>{call.time} {call.who} {call.kind}</p>)}
        {app === 'alarm' && <p>{ALARM}</p>}
      </div>
      <div>
        <div className="radio-row">
          <button type="button" onClick={() => setApp('inbox')}>문자</button>
          <button type="button" onClick={() => setApp('calls')}>통화기록</button>
          <button type="button" onClick={() => setApp('alarm')}>알람</button>
        </div>
        {pad}
      </div>
    </div>
  );
}

function Notebook({ onClose, say }: { onClose: () => void; say: (text: string) => void }) {
  const notes = useLasttrainStore((s) => s.notebook);
  const items = useLasttrainStore((s) => s.items);
  const solved = useLasttrainStore((s) => s.solved);
  const [draft, setDraft] = useState('');
  return (
    <aside className={`lasttrain-sheet ${styles.sheet}`}>
      <button type="button" onClick={onClose}><Mark name="note" />수첩 닫기</button>
      {items.includes('천지인 카드') && <p>{line('card')}</p>}
      {notes.map((note) => (
        <p key={note.id}>{note.text}</p>
      ))}
      {solved.P2 && !solved.P3 && (
        <Keypad
          mode="cheonjiin"
          script="hangul"
          value={draft}
          onChange={setDraft}
          onSubmit={() => {
            if (!judgeDraft(draft)) {
              say(line('p3.wrong'));
              return;
            }
            useLasttrainStore.getState().markSolved('P3');
            addNote('draft', '임시보관함: 선물 눈사람');
            say(line('p3.solved'));
          }}
        />
      )}
    </aside>
  );
}

function FinderPad({
  spots,
  caption,
  onShutter,
  year = 'counter',
}: {
  spots: { id: string; x: number; y: number; w: number; h: number; label: string }[];
  caption: (ids: string[]) => string;
  onShutter: (ids: string[]) => void;
  year?: 'counter' | 'warehouse';
}) {
  const padRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<ViewRect | null>(null);
  useEffect(() => {
    const el = padRef.current;
    if (!el) return;
    const finder = new Viewfinder();
    return finder.attach(el, (next) => setRect(next));
  }, []);
  const covered = rect
    ? spots.filter((spot) => rectContains(rect, spot.x + spot.w / 2, spot.y + spot.h / 2)).map((spot) => spot.id)
    : [];
  return (
    <div>
      <div ref={padRef} className="lasttrain-pad" data-live="viewfinder" data-year={year} style={{ height: FINDER_PAD.h }}>
        {spots.map((spot) => (
          <i key={spot.id} className="lasttrain-spot" style={{ left: spot.x, top: spot.y, width: spot.w, height: spot.h }}>
            {spot.label}
          </i>
        ))}
        {rect && (
          <div className="lasttrain-finder" data-year={year} style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
            {caption(covered)}
          </div>
        )}
      </div>
      <button type="button" onClick={() => onShutter(covered)}>셔터</button>
    </div>
  );
}

function Mark({ name }: { name: string }) {
  return <img className={styles.mark} src={`/themes/neulbom-lasttrain/props/${name}.svg`} alt="" />;
}

function addNote(id: string, text: string) {
  const s = useLasttrainStore.getState();
  if (s.notebook.some((note) => note.id === id)) return;
  useLasttrainStore.setState({ notebook: [...s.notebook, { id, text }] });
}
