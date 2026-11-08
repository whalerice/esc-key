'use client';

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import { useAppStore } from '@/engine/save/appStore';
import { DarknessMask } from '@/engine/fx/DarknessMask';
import { nearestSnap, type SnapTarget } from '@/engine/widgets/DragSnap';
import { allFound, markFound, type FindTarget } from '@/engine/widgets/FindTap';
import { Keypad } from '@/engine/widgets/Keypad';
import { NumberDial } from '@/engine/widgets/NumberDial';
import { RotaryDial } from '@/engine/widgets/RotaryDial';
import { SafeDial } from '@/engine/widgets/SafeDial';
import { TuningKnob, stationSignal } from '@/engine/widgets/TuningKnob';
import { longPressMs } from '@/engine/widgets/LongPress';
import { propArt, roomArt } from './art';
import styles from './art.module.css';
import { duckBed, playClue, playSeat, stopBeds, stopNoise, syncBed, syncNoise } from './audio';
import { line } from './data/script';
import {
  CANCEL_CODE,
  FILM_TARGET,
  PIN_BASE,
  RECV_DIGITS,
  SCARF,
  STATION_MHZ,
  TRAP_MHZ,
  CIPHER,
  chessRanks,
  decodeMorse,
  fFileLetters,
  judgeCall,
  judgeCallsign,
  judgeDrawer,
  judgeFilm,
  judgeFreq,
  judgePairs,
  judgeSafeStop,
  judgeSend,
  judgeStation,
  judgeWord,
  pinNumbers,
  pinsMatch,
  punchedColumn,
  scarfCodes,
  solfege,
  stepZoom,
  thump,
  type SafeDir,
} from './puzzles/answers';
import { useAshStore } from './store';

const DIAL_FACE = ['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
const SEND_KEYS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ...'0123456789', ' '];

type Banner = { id: string; lines: string[] };

export function AshDawnFlow({
  say,
  selectedItem,
  onUseRef,
  notebookRef,
}: {
  say: (text: string) => void;
  selectedItem: string | null;
  onUseRef: MutableRefObject<(itemId: string, targetId: string) => void>;
  notebookRef: MutableRefObject<() => void>;
}) {
  const scene = useAshStore((s) => s.scene);
  const solved = useAshStore((s) => s.solved);
  const items = useAshStore((s) => s.items);
  const notes = useAshStore((s) => s.notebook);
  const flags = useAshStore((s) => s.flags);
  const lockStage = useAshStore((s) => s.extra.lockStage);
  const big = useAppStore((s) => s.settings.bigText);
  const hearing = useAppStore((s) => s.settings.hearingAssist);
  const [openNotes, setOpenNotes] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [queue, setQueue] = useState<Banner[]>([]);
  const sayRef = useRef(say);
  sayRef.current = say;
  const filmDrop = useRef<() => void>(() => undefined);

  useEffect(() => {
    notebookRef.current = () => setOpenNotes((open) => !open);
  }, [notebookRef]);

  useEffect(() => {
    onUseRef.current = (itemId, targetId) => {
      if (itemId === '전문' && targetId === 'board') {
        useAshStore.getState().setFlag('board');
        sayRef.current(line('p3.lay'));
      }
      if (itemId === '투명 필름' && targetId === 'cross') filmDrop.current();
    };
  }, [onUseRef]);

  useEffect(() => {
    const s = useAshStore.getState();
    if (s.solved.P3 && !s.flags.greta1) {
      s.setFlag('greta1');
      setQueue((q) => [
        ...q,
        {
          id: 'greta',
          lines: [line('greta.1'), line('greta.2'), line('greta.3'), line('greta.me'), line('greta.how')],
        },
      ]);
    }
  }, [solved.P3]);

  useEffect(() => {
    const s = useAshStore.getState();
    if (s.solved.P7 && !s.flags.silent) {
      s.setFlag('silent');
      setQueue((q) => [
        ...q,
        { id: 'silent', lines: ['무전실', line('p7.breath'), line('p7.know')] },
      ]);
    }
  }, [solved.P7]);

  useEffect(() => {
    const s = useAshStore.getState();
    if (!s.solved.P8 || s.flags.air) return;
    s.setFlag('air');
    setQueue((q) => [
      ...q,
      { id: 'air', lines: [line('air.1'), line('air.2'), line('air.3'), line('air.me1'), line('air.me2')] },
      { id: 'greta-b', lines: [line('gb.1'), line('gb.2'), line('gb.3'), line('gb.me')] },
      { id: 'chief', lines: [line('chief.1'), line('chief.2'), line('chief.me')] },
    ]);
  }, [solved.P8]);

  useEffect(() => {
    if (banner || queue.length === 0) return;
    setBanner(queue[0]!);
    setQueue((q) => q.slice(1));
  }, [banner, queue]);

  useEffect(() => {
    duckBed(!!banner);
    if (!banner) return;
    const voice =
      banner.id === 'greta' || banner.id === 'greta-b'
        ? 'greta'
        : banner.id === 'silent'
          ? 'breath'
          : banner.id === 'air'
            ? 'lenz'
            : banner.id === 'chief'
              ? 'chief'
              : null;
    if (voice) playClue(voice);
  }, [banner]);

  useEffect(() => {
    playSeat('train');
    playSeat('chime');
    playSeat('tube');
    syncBed();
    return () => {
      stopBeds();
      stopNoise();
    };
  }, []);

  useEffect(() => {
    if (scene === 'teletype') playSeat('teletype');
  }, [scene]);

  const go = (next: string) => useAshStore.getState().setScene(next);

  return (
    <>
    <img
      className={styles.stage}
      src={roomArt({
        scene,
        dark: scene === 'desk' && !solved.P1,
        finaleA: !!flags.finaleA,
        finaleB: !!flags.finaleB,
      })}
      alt=""
    />
    <div className={`ash-flow ${styles.flow}`} data-big={big ? 'yes' : 'no'} data-scene={scene} data-puzzle={solved.P9 ? 'clear' : 'play'}>
      {banner && (
        <div className="ash-banner" role="status">
          <Phone
            lines={banner.lines}
            onDone={() => setBanner(null)}
          />
        </div>
      )}
      <div className="radio-row">
        <button type="button" onClick={() => go('desk')}>책상</button>
        {solved.P2 && <button type="button" onClick={() => go('radio')}>무전실</button>}
        {flags.films && <button type="button" onClick={() => go('archive')}>보관소</button>}
        {items.includes('분소장실 열쇠') && (
          <button type="button" onClick={() => go('office')}>분소장실</button>
        )}
        {flags.pins && <button type="button" onClick={() => go('teletype')}>텔레타이프실</button>}
        <button type="button" onClick={() => setOpenNotes(true)}>수첩 열기</button>
      </div>

      {scene === 'desk' && !solved.P1 && <DeskDark say={say} />}
      {scene === 'desk' && solved.P1 && !solved.P2 && <PhoneDial say={say} />}
      {scene === 'desk' && solved.P1 && !solved.P3 && (
        <Chess say={say} selectedItem={selectedItem} board={!!flags.board} />
      )}
      {scene === 'desk' && solved.P4 && !solved.P5 && <Matchbook say={say} filmDrop={filmDrop} />}
      {scene === 'desk' && solved.P5 && !flags.films && <ChessBox say={say} />}
      {scene === 'desk' && solved.P8 && !flags.pins && <MusicBox say={say} hearing={hearing} />}
      {scene === 'desk' && flags.v17 && !items.includes('분소장실 열쇠') && <Josef say={say} />}

      {scene === 'radio' && solved.P2 && !solved.P4 && <Station say={say} hearing={hearing} />}
      {scene === 'radio' && !!flags.v17 && !solved.P7 && <Scarf say={say} />}

      {scene === 'archive' && <Archive say={say} />}
      {scene === 'office' && !solved.P8 && <Safe say={say} stage={lockStage} />}
      {scene === 'teletype' && !flags.finaleA && !flags.finaleB && <Send say={say} />}

      {openNotes && (
        <aside className="ash-notes" data-layer="modal">
          <h2>수첩</h2>
          <ul>
            {notes.length === 0 && <li>비어 있다.</li>}
            {notes.map((note) => (
              <li key={note.id}>{note.text}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setOpenNotes(false)}>닫기</button>
        </aside>
      )}
    </div>
    {flags.finaleA && !flags.endingA && (
      <div className={styles.card}>
        <FinaleA say={say} />
      </div>
    )}
    {flags.finaleB && !flags.endingB && (
      <div className={styles.card}>
        <FinaleB say={say} />
      </div>
    )}
    </>
  );
}

function Mark({ name }: { name: Parameters<typeof propArt>[0] }) {
  return <img className={styles.mark} src={propArt(name)} alt="" />;
}

function inLight(event: ReactMouseEvent<HTMLButtonElement>, mask: DarknessMask): boolean {
  const panel = event.currentTarget.parentElement?.getBoundingClientRect();
  if (!panel) return false;
  const h = panel.height;
  const lx = event.clientX - panel.left;
  const ly = event.clientY - panel.top - h * 0.15;
  const r = h * 0.22;
  mask.enabled = true;
  mask.fingerX = event.clientX;
  mask.fingerY = event.clientY;
  mask.holeRatio = 0.15;
  const b = event.currentTarget.getBoundingClientRect();
  const cx = b.left + b.width / 2 - panel.left;
  const cy = b.top + b.height / 2 - panel.top;
  return Math.hypot(lx - cx, ly - cy) <= r;
}

function Phone({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i >= lines.length - 1;
  return (
    <div>
      <p>{lines[i]}</p>
      <button type="button" onClick={() => (last ? onDone() : setI(i + 1))}>
        {last ? '닫기' : '다음'}
      </button>
    </div>
  );
}

function addNote(id: string, text: string) {
  const s = useAshStore.getState();
  if (s.notebook.some((note) => note.id === id)) return;
  useAshStore.setState({ notebook: [...s.notebook, { id, text }] });
}

function gain(id: string) {
  useAshStore.getState().addItem(id);
}

function DeskDark({ say }: { say: (text: string) => void }) {
  const mask = useRef(new DarknessMask());
  const dial = useRef(new NumberDial(3));
  const [vals, setVals] = useState<number[]>([0, 0, 0]);
  const [light, setLight] = useState<{ x: number; y: number; r: number } | null>(null);
  const [seen, setSeen] = useState({ note: false, clock: false, drawer: false });
  const said = useRef(false);

function reveal(event: ReactMouseEvent<HTMLButtonElement>, run: () => void) {
  const panel = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!panel || !inLight(event, mask.current)) {
      if (panel) {
        const h = panel.height;
        setLight({
          x: event.clientX - panel.left,
          y: event.clientY - panel.top - h * 0.15,
          r: h * 0.22,
        });
      }
      return;
    }
    const h = panel.height;
    setLight({
      x: event.clientX - panel.left,
      y: event.clientY - panel.top - h * 0.15,
      r: h * 0.22,
    });
    run();
  }

  useEffect(() => {
    if (said.current) return;
    said.current = true;
    say(line('p1.dark'));
    say(line('p1.how'));
  }, [say]);

  function move(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const h = rect.height;
    mask.current.enabled = true;
    mask.current.fingerX = event.clientX;
    mask.current.fingerY = event.clientY;
    mask.current.holeRatio = 0.15;
    setLight({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - h * 0.15,
      r: h * 0.22,
    });
  }

  function bump(index: number, dir: number) {
    dial.current.setDigit(index, dial.current.values[index]! + dir);
    setVals([...dial.current.values]);
  }

  return (
    <section data-puzzle="P1">
      <img className={styles.clue} src={propArt('headphones')} alt="" />
      <div
        className="ash-dark"
        onPointerMove={move}
        onPointerDown={move}
        style={
          light
            ? {
                background: `radial-gradient(circle ${light.r}px at ${light.x}px ${light.y}px, transparent 0 60%, #0a0a0a 78%)`,
              }
            : undefined
        }
      >
        <button
          type="button"
          onClick={(event) =>
            reveal(event, () => {
              setSeen((s) => ({ ...s, note: true }));
              say(line('p1.note'));
            })
          }
        >
          <Mark name="sticky" />
          포스트잇
        </button>
        <button
          type="button"
          onClick={(event) =>
            reveal(event, () => {
              setSeen((s) => ({ ...s, clock: true }));
              say(line('p1.clock'));
              say('9시 26분. 시침이 9, 분침이 5와 6 사이.');
            })
          }
        >
          <Mark name="clock" />
          탁상시계
        </button>
        <button
          type="button"
          onClick={(event) =>
            reveal(event, () => {
              setSeen((s) => ({ ...s, drawer: true }));
              say(line('p1.drawer'));
            })
          }
        >
          <Mark name="drawer" />
          서랍
        </button>
        <button type="button" onClick={(event) => reveal(event, () => say(line('p1.wall')))}>
          <Mark name="wallclock" />
          벽시계
        </button>
      </div>
      {seen.drawer && (
        <div className="radio-row" aria-label="서랍 자물쇠">
          {vals.map((n, i) => (
            <span key={i}>
              <button type="button" aria-label={`${i + 1}번째 올리기`} onClick={() => bump(i, 1)}>
                {n} +
              </button>
              <button type="button" aria-label={`${i + 1}번째 내리기`} onClick={() => bump(i, -1)}>
                −
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              const hit = judgeDrawer(dial.current.values);
              if (hit === 'swap') {
                say(line('p1.swap'));
                return;
              }
              if (hit !== 'ok') {
                say(line('p1.no'));
                return;
              }
              const s = useAshStore.getState();
              gain('리나 사진');
              gain('전화번호부');
              gain('투명 필름');
              gain('성냥갑');
              addNote('lina', 'Lina · 7.11.');
              s.markSolved('P1');
              playSeat('lock');
              playSeat('drawer');
              say(line('p1.photo'));
              say(line('p1.match'));
              say(line('p1.power'));
              say(line('p1.next'));
            }}
          >
            열기
          </button>
        </div>
      )}
      {seen.clock && <p>시침 9 · 분침 26</p>}
      {seen.note && <p>서랍은 시계가 멈춘 때</p>}
    </section>
  );
}

function PhoneDial({ say }: { say: (text: string) => void }) {
  const phone = useRef(new RotaryDial());
  const [digits, setDigits] = useState('');
  const heard = useRef({ hans: false, otto: false });

  function push(n: number) {
    phone.current.dial(n);
    playSeat('dial');
    setDigits((prev) => (prev + String(phone.current.lastDigit ?? n)).slice(0, 8));
  }

  return (
    <section data-puzzle="P2">
      <div className={styles.loot}>
        <Mark name="photo" />
        <Mark name="phonebook" />
        <Mark name="film" />
        <Mark name="matchbox" />
        <Mark name="phone" />
      </div>
      <p>HANS 4267 · OTTO 6886 · JOSEF — (번호 없음) 「늘 하던 방식대로」</p>
      <p>{line('p2.book')}</p>
      <p aria-label="돌린 번호">{digits || '—'}</p>
      <div className="radio-row" aria-label="다이얼">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
          <button key={n} type="button" onClick={() => push(n)}>
            {n}
            {DIAL_FACE[n] ? ` ${DIAL_FACE[n]}` : ''}
          </button>
        ))}
      </div>
      <div className="radio-row">
        <button type="button" onClick={() => setDigits('')}>수화기 내려놓기</button>
        <button
          type="button"
          onClick={() => {
            const hit = judgeCall(digits);
            if (hit === 'hans') {
              playClue('hans');
              say(line('p2.hans'));
              if (!heard.current.hans) {
                heard.current.hans = true;
                say(line('p2.hans.me'));
              }
              return;
            }
            if (hit === 'otto') {
              playClue('otto');
              say(line('p2.otto'));
              if (!heard.current.otto) {
                heard.current.otto = true;
                say(line('p2.otto.me'));
              }
              return;
            }
            if (hit !== 'josef') {
              playSeat('busy');
              say(line('p2.none'));
              return;
            }
            playClue('josef');
            const s = useAshStore.getState();
            s.markSolved('P2');
            addNote('josef', '경비실 요제프 56733 · 라디오는 사진 뒤에 적힌 그대로');
            say(line('p2.josef1'));
            say(line('p2.josef2'));
            say(line('p2.josef3'));
            say(line('p2.josef4'));
            say(line('p2.back'));
            say(line('p2.freq'));
          }}
        >
          걸기
        </button>
      </div>
    </section>
  );
}

function Chess({
  say,
  selectedItem,
  board,
}: {
  say: (text: string) => void;
  selectedItem: string | null;
  board: boolean;
}) {
  const ranks = chessRanks();
  const grid = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ paper: false, punch: false, corner: false, board: false });

  function place() {
    useAshStore.getState().setFlag('board');
    say(line('p3.lay'));
  }

  function drop(file: number, rank: number) {
    if (!useAshStore.getState().flags.board) {
      say(line('p3.empty'));
      return;
    }
    if (file !== 5) {
      playSeat('chess');
      say(line('p3.back'));
      return;
    }
    if (rank === 1) {
      const s = useAshStore.getState();
      s.markSolved('P3');
      addNote('op', '작전명 GLASHAUS');
      playSeat('chess');
      say(fFileLetters().split('').join(' · '));
      say(line('p3.name'));
      say(line('p3.need'));
      return;
    }
    const count = 8 - rank;
    say(fFileLetters().slice(0, count).split('').join(' · '));
    say(line('p3.back'));
  }

  function onGridUp(event: ReactPointerEvent<HTMLDivElement>) {
    const root = grid.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const targets: SnapTarget[] = [...root.querySelectorAll('button')].map((button) => {
      const box = button.getBoundingClientRect();
      return {
        id: `${button.dataset.file}:${button.dataset.rank}`,
        x: box.left - rect.left + box.width / 2,
        y: box.top - rect.top + box.height / 2,
        r: Math.max(box.width, box.height) / 2,
      };
    });
    const hit = nearestSnap(event.clientX - rect.left, event.clientY - rect.top, targets);
    if (!hit) return;
    const [file, rank] = hit.id.split(':').map(Number);
    drop(file!, rank!);
  }

  return (
    <section data-puzzle="P3">
      <p>EMPF: ORGEL-INNEN</p>
      <button
        type="button"
        onClick={() => {
          gain('전문');
          playSeat('paper');
          addNote('empf', 'EMPF = 수신자, ORGEL-INNEN = 오르겔(우리 분소) 내부');
          setLook((s) => ({ ...s, paper: true }));
          say(line('p3.head'));
          if (look.board) say(line('p3.sixty'));
        }}
      >
        전문 집기
      </button>
      <img className={styles.clue} src={propArt('cipher')} alt="" />
      {look.paper && (
        <p className="ash-paper">
          {CIPHER.match(/.{1,7}/g)?.map((row, i) => (
            <span key={i}>
              {[...row].map((ch, col) => (
                <b key={col} data-punch={col === 5 ? 'yes' : 'no'}>
                  {ch}
                </b>
              ))}
            </span>
          ))}
        </p>
      )}
      {look.paper && (
        <button
          type="button"
          onClick={() => {
            setLook((s) => ({ ...s, punch: true }));
            say(`${punchedColumn()}. ${line('p3.punch')}`);
          }}
        >
          6번째 열
        </button>
      )}
      {look.paper && (
        <button
          type="button"
          onClick={() => {
            setLook((s) => ({ ...s, corner: true }));
            say('체스판처럼 읽어라');
            say(line('p3.corner'));
          }}
        >
          모서리
        </button>
      )}
      <div
        ref={grid}
        className="ash-board"
        data-use-target="board"
        onPointerUp={onGridUp}
        onClick={() => {
          if (selectedItem === '전문') place();
        }}
      >
        {ranks.map((row, ri) =>
          [...row].map((ch, file) => {
            const rank = 8 - ri;
            const rook = file === 5 && rank === 8;
            return (
              <button key={`${file}${rank}`} type="button" data-file={file} data-rank={rank}>
                {board ? ch : rook ? <Mark name="rook" /> : ''}
              </button>
            );
          }),
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setLook((s) => ({ ...s, board: true }));
          say('32. … Tf8–f1');
          say(line('p3.board'));
          say(line('p3.last'));
          if (look.paper) say(line('p3.sixty'));
        }}
      >
        기보
      </button>
      <p>f8 검은 룩. 용지를 판 위에 놓은 뒤 f1까지.</p>
    </section>
  );
}

function Station({ say, hearing }: { say: (text: string) => void; hearing: boolean }) {
  const knob = useRef<TuningKnob | null>(null);
  const el = useRef<HTMLDivElement>(null);
  const [freq, setFreq] = useState(3);
  const [signal, setSignal] = useState(0);
  const trapSaid = useRef(false);
  const hitSaid = useRef(false);
  if (!knob.current) {
    knob.current = new TuningKnob({
      min: 3,
      max: 15,
      perTurn: 2,
      snap: 0.01,
      inertiaMs: 0,
      onChange: (value) => setFreq(value),
    });
  }

  useEffect(() => {
    const node = el.current;
    if (!node || !knob.current) return;
    return knob.current.attach(node);
  }, []);

  useEffect(() => {
    const near = stationSignal(freq, { freq: STATION_MHZ, width: 0.6, soundId: 'near' });
    setSignal(near);
    syncNoise(near);
    return () => syncNoise(0);
  }, [freq]);

  const band = judgeFreq(freq);

  useEffect(() => {
    if (band === 'trap' && !trapSaid.current) {
      trapSaid.current = true;
      say(line('p4.trap'));
    }
    if (band === 'hit' && !hitSaid.current) {
      hitSaid.current = true;
      playClue('station');
      say(line('p4.page'));
      say(line('p4.nums'));
    }
  }, [band, say]);

  function nudge(delta: number) {
    const cur = knob.current?.value ?? freq;
    const next = Math.round((cur + delta) * 100) / 100;
    knob.current?.set(Math.min(15, Math.max(3, next)));
    setFreq(knob.current?.value ?? next);
  }

  return (
    <section data-puzzle="P4">
      <img className={styles.clue} src={propArt('radio')} alt="" />
      <img className={styles.mark} src={propArt('mug')} alt="" />
      <p>{line('p4.room')}</p>
      <div ref={el} className="ash-knob" aria-label="주파수 다이얼">
        {freq.toFixed(2)} MHz
      </div>
      <div className="radio-row">
        <button type="button" aria-label="크게 내리기" onClick={() => nudge(-0.1)}>−</button>
        <button type="button" aria-label="미세 내리기" onClick={() => nudge(-0.01)}>◀</button>
        <button type="button" aria-label="미세 올리기" onClick={() => nudge(0.01)}>▶</button>
        <button type="button" aria-label="크게 올리기" onClick={() => nudge(0.1)}>+</button>
      </div>
      <p>신호 {Math.round(signal * 10)} / 10</p>
      {(hearing || band === 'hit') && band === 'hit' && <p className="ash-lamp">{line('p4.cap')}</p>}
      {band === 'hit' && (
        <>
          <button
            type="button"
            onClick={() => {
              playClue('station');
              say(line('p4.cap'));
            }}
          >
            다시 듣기
          </button>
          <StationPad say={say} />
        </>
      )}
    </section>
  );
}

function StationPad({ say }: { say: (text: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div>
      <Keypad mode="numeric" value={value} onChange={setValue} onSubmit={() => submit(value, say)} submitLabel="받아 적기" />
    </div>
  );
}

function submit(value: string, say: (text: string) => void) {
  if (!judgeStation(value)) {
    say(line('p4.no'));
    return;
  }
  useAshStore.getState().markSolved('P4');
  addNote('station', '방송: 14페이지 / 40271 16947');
  say(line('p4.book'));
  say(line('p4.same'));
  say(line('p4.why'));
}

function Matchbook({
  say,
  filmDrop,
}: {
  say: (text: string) => void;
  filmDrop: MutableRefObject<() => void>;
}) {
  const [open, setOpen] = useState(false);
  const [notch, setNotch] = useState(false);
  const [at, setAt] = useState({ x: 16, y: 24 });
  const [shown, setShown] = useState(false);
  const [digits, setDigits] = useState('');
  const [word, setWord] = useState('');
  const notchRef = useRef(false);
  notchRef.current = notch;
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const pad = useRef<HTMLDivElement>(null);

  function apply(hit: 'ok' | 'notch' | 'miss') {
    if (hit === 'miss') return;
    if (hit === 'notch') {
      setAt({ x: 16, y: 24 });
      say(line('p5.notch'));
      return;
    }
    setShown(true);
    addNote('pad', '14페이지 표 숫자 47291 65038');
    playSeat('lock');
    playSeat('paper');
    say(line('p5.rule'));
  }

  useEffect(() => {
    filmDrop.current = () => apply(judgeFilm(FILM_TARGET.x, FILM_TARGET.y, notchRef.current));
  });

  return (
    <section data-puzzle="P5">
      {!open ? (
        <button
          type="button"
          onPointerUp={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            if (event.clientX - box.left > box.width * 0.55) {
              setOpen(true);
              say(line('p5.box'));
              say(line('p5.pad'));
              say(line('p5.page'));
            }
          }}
        >
          <Mark name="matchbox" />
          성냥갑 (오른쪽으로 밀기)
        </button>
      ) : (
        <>
          <p>받은 숫자 − 표의 숫자. 자리마다, 받아내림 없이. 두 자리씩 A=01 … Z=26.</p>
          <p>받은 {RECV_DIGITS} · 표는 필름 구멍.</p>
          <div ref={pad} className="ash-pad" data-use-target="cross">
            <span className="ash-cross" style={{ left: FILM_TARGET.x, top: FILM_TARGET.y }} />
            <button
              type="button"
              className="ash-film"
              style={{ left: at.x, top: at.y }}
              onPointerDown={(event) => {
                drag.current = { dx: event.clientX - at.x, dy: event.clientY - at.y };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!drag.current) return;
                setAt({ x: event.clientX - drag.current.dx, y: event.clientY - drag.current.dy });
              }}
              onPointerUp={(event) => {
                drag.current = null;
                const rect = pad.current?.getBoundingClientRect();
                if (!rect) return;
                apply(judgeFilm(event.clientX - rect.left, event.clientY - rect.top, notch));
              }}
            >
              필름
            </button>
          </div>
          <button type="button" onClick={() => setNotch((v) => !v)}>
            {notch ? '홈 맞음' : '홈 돌리기'}
          </button>
          {shown && <p>4 7 2 9 1 6 5 0 3 8</p>}
          {shown && (
            <>
              <label>
                자리 계산 10칸
                <input
                  value={digits}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(event) => setDigits(event.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const hit = judgePairs(digits);
                  if (hit === 'range') {
                    say(line('p5.range'));
                    return;
                  }
                  if (hit !== 'ok') {
                    say(line('p5.no'));
                    return;
                  }
                  solveChess(say);
                }}
              >
                글자로
              </button>
              <Keypad mode="alpha" value={word} onChange={setWord} onSubmit={() => {
                if (!judgeWord(word)) {
                  say(line('p5.no'));
                  return;
                }
                solveChess(say);
              }} submitLabel="CHESS 확인" />
            </>
          )}
        </>
      )}
      <button type="button" onClick={() => { setOpen(true); say(line('p5.box')); }}>
        열기
      </button>
    </section>
  );
}

function solveChess(say: (text: string) => void) {
  if (useAshStore.getState().solved.P5) return;
  useAshStore.getState().markSolved('P5');
  addNote('chess', '03 08 05 19 19 → CHESS');
  say(line('p5.word'));
  say(line('p5.order'));
  say(line('p5.spy'));
  say(line('p5.still'));
  say(line('p5.box2'));
}

function ChessBox({ say }: { say: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cuts, setCuts] = useState<FindTarget[]>([
    { id: '1', found: false },
    { id: '2', found: false },
    { id: '3', found: false },
  ]);

  function read(id: string, text: string, noteId: string, note: string) {
    if (!flipped) {
      say(line('p6.read'));
      return;
    }
    const next = markFound(cuts, id);
    setCuts(next);
    addNote(noteId, note);
    say(text);
    if (allFound(next)) {
      gain('마이크로필름');
      useAshStore.getState().setFlag('films');
    }
  }

  return (
    <section data-puzzle="P6">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            say(line('p6.take'));
            say(line('p6.mirror'));
          }}
        >
          <Mark name="rook" />
          체스 상자
        </button>
      ) : (
        <>
          <div className="radio-row">
            <button type="button" aria-label="축소" onClick={() => setZoom(stepZoom(zoom, -1, 1, 6))}>−</button>
            <p>×{zoom}</p>
            <button type="button" aria-label="확대" onClick={() => setZoom(stepZoom(zoom, 1, 1, 6))}>+</button>
            <button type="button" onClick={() => setZoom(1)}>전체 보기</button>
            <button type="button" onClick={() => setFlipped(true)}>뒤집기</button>
          </div>
          <div className="ash-cuts" data-flip={flipped ? 'no' : 'yes'} style={{ fontSize: `${zoom}rem` }}>
            <img className={styles.mark} src={propArt('microfilm')} alt="" />
            <button type="button" onClick={() => read('1', line('p6.years'), 'confess', line('film.1'))}>
              {flipped ? line('film.1') : '컷 1'}
            </button>
            <button type="button" onClick={() => read('2', line('p6.safe'), 'safe', '분소장 금고 R32 · L15 · R??')}>
              {flipped ? line('film.2') : '컷 2'}
            </button>
            <button type="button" onClick={() => read('3', line('p6.note'), 'v17', '보관소 V-17 · 렌츠 채널 D · 검은 비숍')}>
              {flipped ? line('film.3') : '컷 3'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function Archive({ say }: { say: (text: string) => void }) {
  const mask = useRef(new DarknessMask());
  const [light, setLight] = useState<{ x: number; y: number; r: number } | null>(null);
  const read = useAshStore((s) => !!s.flags.v17);

  function move(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mask.current.fingerX = event.clientX;
    mask.current.fingerY = event.clientY;
    mask.current.enabled = true;
    setLight({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - rect.height * 0.15,
      r: rect.height * 0.22,
    });
  }

  return (
    <section data-puzzle="archive">
      <div
        className="ash-dark"
        onPointerMove={move}
        onPointerDown={move}
        style={
          light
            ? {
                background: `radial-gradient(circle ${light.r}px at ${light.x}px ${light.y}px, transparent 0 60%, #0a0a0a 78%)`,
              }
            : undefined
        }
      >
        <button
          type="button"
          onClick={(event) => {
            if (!inLight(event, mask.current)) return;
            say('V-01. 빈 서랍에 가깝다.');
          }}
        >
          V-01
        </button>
        <button
          type="button"
          onClick={(event) => {
            if (!inLight(event, mask.current)) return;
            if (read) return;
            useAshStore.getState().setFlag('v17');
            addNote('legend', '뜨개 범례: 1코 = · / 3코 = — / 안뜨기 줄 = 글자 끝');
            say(line('file.card'));
            say(line('file.key'));
            say(line('p6.file'));
            say(line('p6.morse'));
          }}
        >
          V-17
        </button>
      </div>
      {read && (
        <>
          <img className={styles.clue} src={propArt('file')} alt="" />
          <p>{line('file.card')}</p>
          <p>{line('file.key')}</p>
        </>
      )}
    </section>
  );
}

function Scarf({ say }: { say: (text: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [buf, setBuf] = useState('');
  const [text, setText] = useState('');
  const groups = scarfCodes();

  function commit() {
    if (!buf) return;
    setText((prev) => prev + (decodeMorse([buf]) || '?'));
    setBuf('');
  }

  return (
    <section data-puzzle="P7">
      <img className={styles.clue} src={propArt('scarf')} alt="" />
      <p>{line('p7.room')}</p>
      <div className="radio-row">
        <button type="button" aria-label="축소" onClick={() => setZoom(stepZoom(zoom, -1, 1, 4))}>−</button>
        <p>×{zoom}</p>
        <button type="button" aria-label="확대" onClick={() => setZoom(stepZoom(zoom, 1, 1, 4))}>+</button>
      </div>
      <p className="ash-scarf" style={{ fontSize: `${zoom}rem` }}>{SCARF}</p>
      <p>{groups.join(' / ')}</p>
      <p aria-label="모스 입력">{text}{buf && ` ${buf}`}</p>
      <div className="ash-morse">
        <button type="button" onClick={() => setBuf((v) => v + '·')}>·</button>
        <button type="button" onClick={() => setBuf((v) => v + '—')}>—</button>
        <button type="button" onClick={commit}>글자 확정</button>
        <button
          type="button"
          onClick={() => {
            if (buf) {
              setBuf('');
              return;
            }
            setText((prev) => prev.slice(0, -1));
          }}
        >
          한 글자 지우기
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!judgeCallsign(text)) {
            say('조회 결과 없음');
            say(line('p7.none'));
            return;
          }
          useAshStore.getState().markSolved('P7');
          addNote('vogel', 'VOGEL3 = 매일 03:00 채널 B 송신');
          playSeat('teletype');
          say(line('p7.hit'));
          say(line('p7.name'));
          say(line('p7.time'));
          say(line('p7.who'));
          say(line('p7.phone'));
        }}
      >
        송신 기록 조회
      </button>
    </section>
  );
}

function Josef({ say }: { say: (text: string) => void }) {
  return (
    <section data-puzzle="josef">
      <p>{line('p8.need')}</p>
      <p>{line('p8.word')}</p>
      <div className="radio-row">
        <button type="button" onClick={() => { playClue('josef'); say(line('p8.where')); }}>렌츠 선배 어디 계세요?</button>
        <button
          type="button"
          onClick={() => {
            if (useAshStore.getState().items.includes('분소장실 열쇠')) return;
            gain('분소장실 열쇠');
            playSeat('key');
            playClue('josef');
            say(line('p8.key1'));
            say(line('p8.key2'));
            say(line('p8.slide'));
          }}
        >
          검은 비숍
        </button>
        <button type="button" onClick={() => { playClue('josef'); say(line('p8.keyno')); }}>분소장실 열쇠 주세요.</button>
      </div>
    </section>
  );
}

function Safe({ say, stage }: { say: (text: string) => void; stage: number }) {
  const dial = useRef(new SafeDial(40));
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState<SafeDir>('R');
  const [gauge, setGauge] = useState(false);
  const said = useRef(false);

  useEffect(() => {
    if (said.current) return;
    said.current = true;
    say(line('p8.miss'));
    say(line('p8.ear'));
  }, [say]);

  function turn(nextDir: SafeDir) {
    const cur = dial.current.position;
    dial.current.set(nextDir === 'R' ? cur + 1 : cur - 1);
    setPos(dial.current.position);
    setDir(nextDir);
    setGauge(thump(useAshStore.getState().extra.lockStage, nextDir, dial.current.position));
  }

  function commit() {
    const now = useAshStore.getState().extra.lockStage;
    const hit = judgeSafeStop(now, dir, dial.current.position);
    if (hit === 'reset') {
      useAshStore.getState().patchExtra({ lockStage: 0 });
      setGauge(false);
      say(line('p8.reset'));
      return;
    }
    if (hit === 'advance') {
      playSeat('lock');
      useAshStore.getState().patchExtra({ lockStage: now + 1 });
      setGauge(false);
      return;
    }
    playSeat('thump');
    const s = useAshStore.getState();
    s.patchExtra({ lockStage: 3 });
    s.markSolved('P8');
    addNote('code', '취소 코드 앞 4자리 5208 · 송신 형식');
    addNote('form', line('safe.form'));
    say(line('safe.report'));
    say(line('safe.form'));
    say(line('safe.half'));
    say(line('p8.knew'));
    say(line('p8.left'));
    say(line('p8.alone'));
    say(line('p8.rest'));
  }

  const lamps = Math.min(3, stage);

  return (
    <section data-puzzle="P8">
      <img className={styles.clue} src={propArt('safe')} alt="" />
      <p>스티커 R-L-R · 눈금 {pos}</p>
      <div className="ash-safe" aria-label="금고 다이얼">{pos}</div>
      <div className="radio-row">
        <button type="button" onClick={() => turn('L')}>왼쪽</button>
        <button type="button" onClick={() => turn('R')}>오른쪽</button>
        <button type="button" onClick={commit}>손 떼기</button>
      </div>
      <p>램프 {'●'.repeat(lamps)}{'○'.repeat(3 - lamps)}</p>
      <p>청진기 {gauge ? '바늘이 튀었다' : '가만히'}</p>
    </section>
  );
}

function MusicBox({ say, hearing }: { say: (text: string) => void; hearing: boolean }) {
  const [pins, setPins] = useState<number[]>([...PIN_BASE]);
  const [show, setShow] = useState(false);
  const [names, setNames] = useState(false);
  const numbers = pinNumbers(pins);

  function bump(index: number, dir: number) {
    setPins((prev) => prev.map((n, i) => (i === index ? ((n - 1 + dir + 7) % 7) + 1 : n)));
    setShow(false);
  }

  return (
    <section data-puzzle="P9">
      <img className={styles.clue} src={propArt('musicbox')} alt="" />
      <p>{line('p9.lid')}</p>
      <p>오르골: 도 레 미 파 솔 솔 솔</p>
      <button type="button" onClick={() => setNames((v) => !v)}>계이름 자막</button>
      <button
        type="button"
        onClick={() => {
          playClue('hum');
          say(names || hearing ? '라 레 도 파 시 솔 레' : '(허밍)');
        }}
      >
        다시 듣기
      </button>
      {(names || hearing) && <p>라 레 도 파 시 솔 레</p>}
      <div className="radio-row">
        {pins.map((n, i) => (
          <span key={i}>
            <button type="button" aria-label={`${i + 1}칸 올리기`} onClick={() => bump(i, 1)}>+</button>
            <button
              type="button"
              aria-label={`${i + 1}칸`}
              onPointerDown={(event) => {
                event.currentTarget.dataset.y = String(event.clientY);
              }}
              onPointerUp={(event) => {
                const dy = event.clientY - Number(event.currentTarget.dataset.y ?? event.clientY);
                if (Math.abs(dy) < 16) return;
                bump(i, dy < 0 ? 1 : -1);
              }}
            >
              {solfege(n)}
            </button>
            <button type="button" aria-label={`${i + 1}칸 내리기`} onClick={() => bump(i, -1)}>−</button>
            {show && <b data-pin={numbers[i] ?? ''}>{numbers[i] ?? ''}</b>}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          if (!pinsMatch(pins)) {
            playClue('box');
            say(line('p9.no'));
            return;
          }
          setShow(true);
          useAshStore.getState().setFlag('pins');
          addNote('tail', `취소 코드 뒤 4자리 6172 → ${CANCEL_CODE}`);
          playClue('hum');
          say(line('p9.tail'));
          say(line('p9.hide'));
        }}
      >
        태엽
      </button>
    </section>
  );
}

function Send({ say }: { say: (text: string) => void }) {
  const [lines, setLines] = useState(['', '', '']);
  const [row, setRow] = useState(0);
  const [channel, setChannel] = useState<string | null>(null);
  const hold = useRef(0);

  function transmit() {
    const hit = judgeSend(lines, channel);
    if (hit === 'channel') {
      say(line('p9.channel'));
      return;
    }
    if (hit === 'bad') {
      say('인증 불일치 — 재확인하라');
      say(line('p9.bad'));
      return;
    }
    if (hit === 'dead') {
      say('수신처 응답 없음 — 채널 확인');
      say(line('p9.dead'));
      return;
    }
    const s = useAshStore.getState();
    s.markSolved('P9');
    if (hit === 'A') {
      s.patchExtra({ sent: 'A' });
      s.setFlag('finaleA');
      return;
    }
    s.patchExtra({ sent: 'B' });
    s.setFlag('finaleB');
  }

  return (
    <section data-puzzle="P9">
      <img className={styles.clue} src={propArt('teletype')} alt="" />
      <p>{line('safe.form')}</p>
      <div className="radio-row">
        {['A', 'B', 'C', 'D'].map((id) => (
          <button key={id} type="button" data-channel={id} aria-pressed={channel === id} onClick={() => setChannel(id)}>
            채널 {id}
          </button>
        ))}
        <button
          type="button"
          onPointerDown={() => {
            window.clearTimeout(hold.current);
            hold.current = window.setTimeout(transmit, longPressMs(1000));
          }}
          onPointerUp={() => window.clearTimeout(hold.current)}
          onPointerLeave={() => window.clearTimeout(hold.current)}
        >
          송신 레버
        </button>
      </div>
      <div className="radio-row">
        {[0, 1, 2].map((i) => (
          <button key={i} type="button" aria-pressed={row === i} onClick={() => setRow(i)}>
            {i + 1}줄 {lines[i] || '…'}
          </button>
        ))}
      </div>
      <Keypad
        mode="custom"
        keys={SEND_KEYS}
        value={lines[row] ?? ''}
        onChange={(value) => setLines((prev) => prev.map((text, i) => (i === row ? value : text)))}
      />
      <button
        type="button"
        onClick={() => setLines((prev) => prev.map((text, i) => (i === row ? `${text} ` : text)))}
      >
        띄어쓰기
      </button>
    </section>
  );
}

function FinaleA({ say }: { say: (text: string) => void }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    playSeat('chime');
    playClue('danke');
    say(line('endA.1'));
    say(line('endA.2'));
    say(line('endA.3'));
    say(line('endA.4'));
    say(line('endA.5'));
    say(line('endA.6'));
    say(line('endA.7'));
    say(line('endA.ask'));
  }, [say]);

  function choose(choice: 'write' | 'blank') {
    const s = useAshStore.getState();
    s.patchExtra({ epilogueChoice: choice });
    say(choice === 'write' ? line('endA.write') : line('endA.blank'));
    say(line('endA.done'));
    s.setFlag('endingA');
  }

  return (
    <section className={styles.finale} data-ending="A">
      <img className={styles.clue} src={propArt('border')} alt="" />
      <h2>새벽은 오지 않았다</h2>
      <p>국경 검문소. 눈 내리는 새벽. 두 사람의 뒷모습.</p>
      <p>내부 협력자: VOGEL3 (그레타 포겔) ____</p>
      <Hold label="렌츠 이름도 적는다" onHold={() => choose('write')} />
      <Hold label="적지 않는다" onHold={() => choose('blank')} />
    </section>
  );
}

function FinaleB({ say }: { say: (text: string) => void }) {
  const said = useRef(false);
  useEffect(() => {
    if (said.current) return;
    said.current = true;
    say(line('endB.1'));
    say(line('endB.2'));
    say(line('endB.3'));
    say(line('endB.4'));
    say(line('endB.5'));
  }, [say]);
  return (
    <section className={styles.finale} data-ending="B">
      <h2>가로챈 새벽</h2>
      <img className={styles.clue} src={propArt('file')} alt="" />
      <button type="button" onClick={() => useAshStore.getState().setFlag('endingB')}>끝</button>
    </section>
  );
}

function Hold({ label, onHold }: { label: string; onHold: () => void }) {
  const timer = useRef(0);
  return (
    <button
      type="button"
      onPointerDown={() => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(onHold, longPressMs(1000));
      }}
      onPointerUp={() => window.clearTimeout(timer.current)}
      onPointerLeave={() => window.clearTimeout(timer.current)}
    >
      {label}
    </button>
  );
}
